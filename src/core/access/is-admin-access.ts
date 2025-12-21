import { UserRole } from '@/collections/users/users.config';
import { Access, FieldAccess } from 'payload';

export const isAdmin: Access = ({ req }) => Boolean(req?.user && req.user?.role === UserRole.Admin);

export const isAdminField: FieldAccess = ({ req }) => Boolean(req?.user && req.user?.role === UserRole.Admin);
