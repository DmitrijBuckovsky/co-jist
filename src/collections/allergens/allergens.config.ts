import { anyone, isAdmin } from '@/core/access';
import type { CollectionConfig } from 'payload';

export const Allergens: CollectionConfig = {
  slug: 'allergens',
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['number', 'name'],
    group: 'Ingredients',
  },
  fields: [
    {
      name: 'number',
      type: 'number',
      required: true,
      unique: true,
      min: 1,
      max: 14,
      admin: {
        description: 'EU allergen number (1-14)',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Czech name of the allergen',
      },
    },
  ],
};
