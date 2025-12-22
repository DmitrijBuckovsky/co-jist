import type { CollectionAfterChangeHook } from 'payload';

interface IngredientRowData {
  id?: number;
  ingredient: number | null;
  amount: string;
  is_main: boolean;
  _delete?: boolean;
  _localId?: string;
}

export const syncIngredientsHook: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  // Prevent infinite loops
  if (context?.skipIngredientSync) return doc;

  const { payload } = req;
  const recipeId = doc.id;
  const ingredientsData: IngredientRowData[] = doc.ingredients_data || [];

  // Skip if no ingredients data to process
  if (!ingredientsData.length) return doc;

  // Get existing recipe-ingredients for this recipe
  const existing = await payload.find({
    collection: 'recipe-ingredients',
    where: { recipe: { equals: recipeId } },
    limit: 1000,
    req, // Pass req to use the same transaction
  });
  const existingIds = new Set(existing.docs.map((d) => d.id));
  const processedIds = new Set<number>();

  // Process each row from the form
  for (const row of ingredientsData) {
    if (row._delete && row.id) {
      // Delete existing recipe-ingredient
      await payload.delete({
        collection: 'recipe-ingredients',
        id: row.id,
        req, // Pass req to use the same transaction
      });
      processedIds.add(row.id);
    } else if (row.id && existingIds.has(row.id)) {
      // Update existing recipe-ingredient
      if (row.ingredient && row.amount) {
        await payload.update({
          collection: 'recipe-ingredients',
          id: row.id,
          data: {
            ingredient: row.ingredient,
            amount: row.amount,
            is_main: row.is_main,
          },
          req, // Pass req to use the same transaction
        });
      }
      processedIds.add(row.id);
    } else if (!row.id && row.ingredient && row.amount) {
      // Create new recipe-ingredient
      await payload.create({
        collection: 'recipe-ingredients',
        data: {
          recipe: recipeId,
          ingredient: row.ingredient,
          amount: row.amount,
          is_main: row.is_main,
        },
        req, // Pass req to use the same transaction
      });
    }
  }

  // Delete any recipe-ingredients that were removed from the form
  // (existed before but not in the current form data)
  for (const existingId of existingIds) {
    if (!processedIds.has(existingId)) {
      const wasInForm = ingredientsData.some((r) => r.id === existingId);
      if (!wasInForm) {
        await payload.delete({
          collection: 'recipe-ingredients',
          id: existingId,
          req, // Pass req to use the same transaction
        });
      }
    }
  }

  // Clear the ingredients_data field after syncing
  await payload.update({
    collection: 'recipes',
    id: recipeId,
    data: { ingredients_data: null },
    context: { skipIngredientSync: true },
    req, // Pass req to use the same transaction
  });

  return doc;
};
