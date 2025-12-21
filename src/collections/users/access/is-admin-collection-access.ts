import { UserRole } from '../users.config';
import type { PayloadRequest } from 'payload';

/**
 * Access control for admin panel access.
 * Returns boolean (not AccessResult) as required by access.admin property.
 */
export const isAdminCollectionAccess = ({ req }: { req: PayloadRequest }): boolean =>
  Boolean(req.user?.role === UserRole.Admin);
