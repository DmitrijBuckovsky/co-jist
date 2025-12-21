import type { CollectionConfig } from 'payload';
import { matchRecipes } from './endpoints';

export const Recipes: CollectionConfig = {
  slug: 'recipes',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['id', 'name', 'prep_time_mins'],
    group: 'Recipe Management',
  },
  endpoints: [matchRecipes],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
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
      admin: {
        description: 'Preparation time in minutes',
      },
    },
    // Virtual field to display ingredients
    {
      name: 'ingredients_display',
      type: 'text',
      virtual: true,
      admin: {
        readOnly: true,
        description: 'Ingredients used in this recipe (managed via Recipe Ingredients)',
        components: {
          Field: '/collections/recipes/components/IngredientsDisplay',
        },
      },
    },
  ],
};
