import { UserRole } from '../users.config';
import { Access } from 'payload';

export const isSelfOrAdmin: Access = ({ req }) => {
  const user = req.user;

  if (!user) return false;

  if (user.role === UserRole.Admin) {
    return true;
  }

  return { id: { equals: user?.id } };
};
