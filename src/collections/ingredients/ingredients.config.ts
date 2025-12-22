import { generateNameSearchHook } from './hooks';
import { anyone, isAdmin } from '@/core/access';
import type { CollectionConfig } from 'payload';

export const Ingredients: CollectionConfig = {
  slug: 'ingredients',
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['id', 'name', 'category'],
    group: 'Ingredients',
  },
  hooks: {
    beforeChange: [generateNameSearchHook],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'name_search',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        hidden: true, // Hide from admin UI
        readOnly: true, // Additional protection in UI
      },
      access: {
        create: () => false, // Prevent users from creating this field
        update: () => false, // Prevent users from updating this field
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      required: true,
      maxDepth: 1,
    },
    {
      name: 'recipe_ingredients',
      type: 'relationship',
      relationTo: 'recipe-ingredients' as any,
      hasMany: true,
      required: false,
      maxDepth: 2, // Include recipe and amount details
      admin: {
        hidden: true, // Hide from main ingredient view
      },
      filterOptions: ({ id }) => ({
        ingredient: {
          equals: id,
        },
      }),
    },
  ],
};
