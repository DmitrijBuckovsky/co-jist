import { PAYLOAD_TOKEN_EXPIRATION } from '@/constants';

import {
  emailUpdateAccess,
  isAdminCollectionAccess,
  isSelfOrAdmin,
  roleCreateAccess,
  roleUpdateAccess,
} from './access';
import { changePassword } from './endpoints';
import { anyone } from '@/core/access';
import type { CollectionConfig } from 'payload';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    verify: true,
    tokenExpiration: PAYLOAD_TOKEN_EXPIRATION,
  },
  access: {
    read: isSelfOrAdmin,
    create: anyone,
    update: isSelfOrAdmin,
    delete: isSelfOrAdmin,

    // Only admin can access admin panel
    admin: isAdminCollectionAccess,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
      access: {
        update: emailUpdateAccess,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      defaultValue: '',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: UserRole.Admin },
        { label: 'User', value: UserRole.User },
      ],
      defaultValue: UserRole.User,
      required: true,
      // Only admin can change role
      access: {
        create: roleCreateAccess,
        update: roleUpdateAccess,
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
  endpoints: [changePassword],
};
