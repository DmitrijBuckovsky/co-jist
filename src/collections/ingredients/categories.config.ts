import { normalizeCategoryNameHook } from './hooks';
import type { CollectionConfig } from 'payload';

export const Categories: CollectionConfig = {
  slug: 'categories',
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
