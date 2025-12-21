import type { CollectionConfig } from 'payload';

export const RecipeIngredients: CollectionConfig = {
  slug: 'recipe-ingredients',
  admin: {
    useAsTitle: 'amount',
    defaultColumns: ['recipe', 'ingredient', 'amount', 'is_main'],
    group: 'Recipe Management',
  },
  fields: [
    {
      name: 'recipe',
      type: 'relationship',
      relationTo: 'recipes',
      required: true,
      maxDepth: 1,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'ingredient',
      type: 'relationship',
      relationTo: 'ingredients',
      required: true,
      maxDepth: 2, // Include category
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'is_main',
      type: 'checkbox',
      label: 'Main Ingredient',
      defaultValue: false,
      admin: {
        description: 'Check if this is a main ingredient (gets higher priority in recipe matching)',
      },
    },
    {
      name: 'amount',
      type: 'text',
      required: true,
      admin: {
        description: 'Quantity and unit (e.g., "2 cups", "1 tbsp", "3 pieces")',
        placeholder: 'e.g., 2 cups, 1 tbsp, 3 pieces',
      },
    },
  ],
};
