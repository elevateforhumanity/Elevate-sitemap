import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { setAdminContext } from '../middleware/rls-context';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const prisma = new PrismaClient();

/**
 * Stripe Webhook Handler with Idempotency
 * 
 * Security:
 * - Verifies webhook signature
 * - Uses idempotency keys to prevent duplicate processing
 * - Bypasses RLS for payment processing (admin context)
 */
router.post(
  '/webhook',
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Use event ID as idempotency key
    const idempotencyKey = event.id;

    try {
      // Set admin context to bypass RLS for payment processing
      await setAdminContext(prisma);

      // Check if we've already processed this event
      const existingEvent = await prisma.$queryRaw<any[]>`
        SELECT id FROM stripe_events WHERE event_id = ${idempotencyKey}
      `.catch(() => null);

      if (existingEvent && existingEvent.length > 0) {
        console.log(`Event ${idempotencyKey} already processed, skipping`);
        return res.json({ received: true, cached: true });
      }

      // Process the event
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionChange(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Record that we processed this event (idempotency)
      await prisma.$executeRaw`
        INSERT INTO stripe_events (event_id, event_type, processed_at)
        VALUES (${idempotencyKey}, ${event.type}, NOW())
        ON CONFLICT (event_id) DO NOTHING
      `;

      res.json({ received: true });
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { id, customer, metadata, amount_total, payment_status } = session;

  if (payment_status !== 'paid') {
    console.log(`Checkout session ${id} not paid yet`);
    return;
  }

  // Update order status
  if (metadata?.orderId) {
    await prisma.payment.update({
      where: { id: metadata.orderId },
      data: {
        status: 'PAID',
        stripeSessionId: id,
      },
    });

    // Grant access to course if applicable
    if (metadata?.courseId && metadata?.userId) {
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: metadata.userId,
            courseId: metadata.courseId,
          },
        },
        create: {
          userId: metadata.userId,
          courseId: metadata.courseId,
          status: 'ACTIVE',
        },
        update: {
          status: 'ACTIVE',
        },
      });
    }
  }

  console.log(`Checkout session completed: ${id}`);
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { id, metadata } = paymentIntent;

  if (metadata?.orderId) {
    await prisma.payment.update({
      where: { id: metadata.orderId },
      data: { status: 'PAID' },
    });
  }

  console.log(`Payment intent succeeded: ${id}`);
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { id, metadata } = paymentIntent;

  if (metadata?.orderId) {
    await prisma.payment.update({
      where: { id: metadata.orderId },
      data: { status: 'FAILED' },
    });
  }

  console.log(`Payment intent failed: ${id}`);
}

/**
 * Handle subscription changes
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const { id, customer, status, metadata } = subscription;

  // Update subscription status in your database
  // This is a placeholder - implement based on your subscription model
  console.log(`Subscription ${id} status: ${status}`);
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { id, metadata } = subscription;

  // Revoke access when subscription is cancelled
  if (metadata?.userId && metadata?.courseId) {
    await prisma.enrollment.updateMany({
      where: {
        userId: metadata.userId,
        courseId: metadata.courseId,
      },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  console.log(`Subscription deleted: ${id}`);
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const { id, subscription } = invoice;
  console.log(`Invoice payment succeeded: ${id}`);
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const { id, subscription, customer_email } = invoice;
  
  // Send notification to customer about failed payment
  console.log(`Invoice payment failed: ${id} for ${customer_email}`);
  
  // TODO: Send email notification
}

export default router;
