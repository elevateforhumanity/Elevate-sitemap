# Stripe Integration Setup Guide

## 🎯 Overview

This guide will help you set up Stripe to accept payments for the Elevate Platform licenses.

## 📋 Prerequisites

- Stripe account (create at https://stripe.com)
- Business information (EIN/Tax ID)
- Bank account for payouts

## 🚀 Quick Setup (30 minutes)

### Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click "Start now"
3. Enter business information
4. Verify email address
5. Complete business verification

### Step 2: Get API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy **Publishable key** (starts with `pk_`)
3. Copy **Secret key** (starts with `sk_`)
4. Save these securely (you'll need them later)

**Test Mode Keys:**
- Use for testing before going live
- Start with `pk_test_` and `sk_test_`

**Live Mode Keys:**
- Use for real payments
- Start with `pk_live_` and `sk_live_`

### Step 3: Create Products in Stripe

#### Product 1: Starter License

1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Fill in details:
   ```
   Name: Elevate Platform - Starter License
   Description: Full source code, 1 domain, 6 months updates, email support
   Pricing: One-time payment
   Price: $2,997.00 USD
   ```
4. Click "Save product"
5. **Copy the Price ID** (starts with `price_`)

#### Product 2: Professional License

1. Click "Add product"
2. Fill in details:
   ```
   Name: Elevate Platform - Professional License
   Description: Full source code, 5 domains, lifetime updates, priority support, white-label
   Pricing: One-time payment
   Price: $7,997.00 USD
   ```
3. Click "Save product"
4. **Copy the Price ID**

#### Product 3: Enterprise License

1. Click "Add product"
2. Fill in details:
   ```
   Name: Elevate Platform - Enterprise License
   Description: Full source code, unlimited domains, dedicated support, custom development
   Pricing: One-time payment
   Price: $19,997.00 USD
   ```
3. Click "Save product"
4. **Copy the Price ID**

### Step 4: Update Store Page

Edit `/public/pages/store.html` and replace the placeholder keys:

```javascript
// Line 10: Replace with your Publishable Key
const stripe = Stripe('pk_live_YOUR_ACTUAL_KEY_HERE');

// Lines 13-27: Replace with your actual Price IDs
const products = {
    starter: {
        priceId: 'price_ACTUAL_STARTER_ID', // Replace this
        name: 'Starter License',
        amount: 299700
    },
    professional: {
        priceId: 'price_ACTUAL_PROFESSIONAL_ID', // Replace this
        name: 'Professional License',
        amount: 799700
    },
    enterprise: {
        priceId: 'price_ACTUAL_ENTERPRISE_ID', // Replace this
        name: 'Enterprise License',
        amount: 1999700
    }
};
```

### Step 5: Create Checkout Session API

Create a Cloudflare Worker to handle checkout sessions:

**File: `worker/checkout.js`**

```javascript
export default {
  async fetch(request, env) {
    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Parse request body
    const { priceId, productName, amount } = await request.json();

    // Validate input
    if (!priceId || !productName || !amount) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Create Stripe checkout session
    const stripe = require('stripe')(env.STRIPE_SECRET_KEY);
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${env.SITE_URL}/pages/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.SITE_URL}/pages/store.html`,
        customer_email: '', // Optional: pre-fill if you have it
        metadata: {
          product_name: productName,
          license_type: priceId.includes('starter') ? 'starter' : 
                        priceId.includes('professional') ? 'professional' : 'enterprise'
        }
      });

      return new Response(JSON.stringify({ id: session.id }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': env.SITE_URL,
        },
      });
    } catch (error) {
      console.error('Stripe error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
```

**Deploy Worker:**
```bash
cd worker
wrangler deploy
```

**Set Environment Variables:**
```bash
wrangler secret put STRIPE_SECRET_KEY
# Paste your secret key when prompted

wrangler secret put SITE_URL
# Enter: https://tiny-new.pages.dev
```

### Step 6: Set Up Webhooks

Webhooks notify you when payments succeed.

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://your-worker.workers.dev/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. **Copy the Signing Secret** (starts with `whsec_`)

**Webhook Handler:**

```javascript
async function handleWebhook(request, env) {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();
  
  const stripe = require('stripe')(env.STRIPE_SECRET_KEY);
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Generate license key
      const licenseKey = generateLicenseKey();
      
      // Save to database
      await saveLicense({
        email: session.customer_email,
        licenseKey: licenseKey,
        licenseType: session.metadata.license_type,
        amount: session.amount_total,
        stripeSessionId: session.id
      });
      
      // Send email with license key
      await sendLicenseEmail(session.customer_email, licenseKey);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
}

function generateLicenseKey() {
  // Generate unique license key
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let key = 'EFH-';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) key += '-';
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key; // Format: EFH-XXXX-XXXX-XXXX-XXXX
}
```

### Step 7: Test Payment Flow

**Test Mode:**
1. Use test API keys
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any 3-digit CVC
5. Any ZIP code

**Test Checklist:**
- [ ] Click "Buy Starter License"
- [ ] Redirects to Stripe Checkout
- [ ] Enter test card details
- [ ] Payment succeeds
- [ ] Redirects to success page
- [ ] Receives confirmation email
- [ ] License key is generated
- [ ] Can download digital products

### Step 8: Go Live

**Before going live:**
1. Switch to live API keys
2. Test with real card (small amount)
3. Verify webhook works
4. Check email delivery
5. Test refund process

**Switch to Live Mode:**
1. In Stripe dashboard, toggle to "Live mode"
2. Copy live API keys
3. Update environment variables
4. Redeploy worker
5. Test one more time

## 💰 Pricing Configuration

### Current Pricing:
- **Starter:** $2,997 (one-time)
- **Professional:** $7,997 (one-time)
- **Enterprise:** $19,997 (one-time)

### To Change Prices:
1. Go to Stripe dashboard
2. Edit product
3. Add new price
4. Update Price ID in store.html
5. Archive old price (don't delete)

### Payment Plans (Optional):
You can add payment plans for Enterprise:
```
Option 1: $19,997 one-time
Option 2: $2,000/month for 12 months ($24,000 total)
Option 3: $5,000 down + $1,500/month for 12 months ($23,000 total)
```

## 📊 Monitoring

### Stripe Dashboard:
- View all payments
- Track revenue
- See failed payments
- Manage refunds
- Export data

### Key Metrics to Track:
- Conversion rate (visitors → buyers)
- Average order value
- Refund rate
- Payment success rate
- Time to first purchase

## 🔒 Security Best Practices

1. **Never expose secret keys**
   - Keep in environment variables
   - Don't commit to Git
   - Rotate regularly

2. **Validate webhooks**
   - Always verify signature
   - Check event type
   - Handle duplicates

3. **Use HTTPS**
   - Required for Stripe
   - Cloudflare provides free SSL

4. **Log everything**
   - Payment attempts
   - Failures
   - Refunds
   - Webhook events

## 🆘 Troubleshooting

### Issue: "Invalid API Key"
**Solution:** Check you're using the correct key (test vs live)

### Issue: "Webhook signature verification failed"
**Solution:** Verify webhook secret is correct

### Issue: "Payment declined"
**Solution:** Customer's card was declined, ask them to try another card

### Issue: "Checkout session expired"
**Solution:** Sessions expire after 24 hours, create a new one

## 📞 Support

- **Stripe Support:** https://support.stripe.com
- **Stripe Docs:** https://stripe.com/docs
- **Stripe API Reference:** https://stripe.com/docs/api

## 📝 Checklist

- [ ] Created Stripe account
- [ ] Got API keys
- [ ] Created 3 products
- [ ] Copied Price IDs
- [ ] Updated store.html
- [ ] Created checkout API
- [ ] Set up webhooks
- [ ] Tested payment flow
- [ ] Verified email delivery
- [ ] Tested refunds
- [ ] Switched to live mode
- [ ] Monitored first sale

**Estimated Setup Time:** 30-60 minutes

---

**Next Steps:** After Stripe is configured, test the complete purchase flow and verify license delivery works correctly.
