import { UserRole } from '@/collections/users/users.config';
import { Access } from 'payload';

export const isMyOrAdmin: Access = ({ req }) => {
  const user = req.user;

  if (!user) return false;

  if (user.role === UserRole.Admin) {
    return true;
  }

  return { user: { equals: user?.id } };
};
