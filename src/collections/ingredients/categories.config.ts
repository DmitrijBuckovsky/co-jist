import { normalizeCategoryNameHook } from './hooks';
import { anyone, isAdmin } from '@/core/access';
import type { CollectionConfig } from 'payload';

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    group: 'Ingredients',
  },
  hooks: {
    beforeChange: [normalizeCategoryNameHook],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
  ],
};
