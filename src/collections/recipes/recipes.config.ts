import { listRecipes, matchRecipes, randomRecipes, searchRecipes } from './endpoints';
import { generateNameSearchHook, syncIngredientsHook } from './hooks';
import { anyone, isAdmin } from '@/core/access';
import type { CollectionConfig } from 'payload';

export const Recipes: CollectionConfig = {
  slug: 'recipes',
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['id', 'name', 'prep_time_mins'],
    group: 'Recipe Management',
  },
  endpoints: [matchRecipes, searchRecipes, listRecipes, randomRecipes],
  hooks: {
    beforeChange: [generateNameSearchHook],
    afterChange: [syncIngredientsHook],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'name_search',
      type: 'text',
      required: true,
      unique: false,
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'instructions',
      type: 'textarea',
      required: true,
    },
    {
      name: 'prep_time_mins',
      type: 'number',
      min: 0,
      label: 'Prep Time (mins)',
      admin: {
        description: 'Preparation time in minutes',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ],
      required: false,
    },
    // Hidden JSON field to store ingredient data during form submission
    {
      name: 'ingredients_data',
      type: 'json',
      admin: {
        hidden: true,
      },
    },
    // UI field for inline ingredient editing
    {
      name: 'ingredients_editor',
      type: 'ui',
      admin: {
        components: {
          Field: '/collections/recipes/components/IngredientsEditor',
        },
      },
    },
  ],
};
