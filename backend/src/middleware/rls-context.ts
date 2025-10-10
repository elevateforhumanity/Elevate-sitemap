import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

/**
 * Middleware to set RLS context for authenticated requests
 * This ensures Row Level Security policies are enforced at the database level
 */
export const setRLSContext = (prisma: PrismaClient) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract user info from JWT (set by auth middleware)
      const user = (req as any).user;

      if (user) {
        // Set session variables for RLS policies
        await prisma.$executeRawUnsafe(`
          SELECT set_user_context(
            '${user.id}',
            '${user.orgId || ''}',
            '${user.role || 'STUDENT'}',
            '${user.email || ''}'
          );
        `);
      } else {
        // For unauthenticated requests, set empty context
        await prisma.$executeRawUnsafe(`
          SELECT set_user_context('', '', '', '');
        `);
      }

      next();
    } catch (error) {
      console.error('Error setting RLS context:', error);
      // Don't block the request, but log the error
      next();
    }
  };
};

/**
 * Helper function to set RLS context for background jobs or scripts
 */
export const setRLSContextForJob = async (
  prisma: PrismaClient,
  userId: string,
  orgId: string,
  role: string,
  email: string
) => {
  await prisma.$executeRawUnsafe(`
    SELECT set_user_context(
      '${userId}',
      '${orgId}',
      '${role}',
      '${email}'
    );
  `);
};

/**
 * Helper function to bypass RLS for admin operations
 */
export const setAdminContext = async (prisma: PrismaClient) => {
  await prisma.$executeRawUnsafe(`
    SELECT set_user_context('', '', 'SUPER_ADMIN', '');
  `);
};
