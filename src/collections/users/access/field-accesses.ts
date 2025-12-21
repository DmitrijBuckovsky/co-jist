import { UserRole } from '../users.config';
import { FieldAccess } from 'payload';

// Email field: cannot be updated
export const emailUpdateAccess: FieldAccess = () => false;

// Role field: only admin can create or update
export const roleCreateAccess: FieldAccess = ({ req: { user } }) => user?.role === UserRole.Admin;
export const roleUpdateAccess: FieldAccess = ({ req: { user } }) => user?.role === UserRole.Admin;
