import { withErrorHandling } from '@/core/exceptions';
import type { PayloadRequest } from 'payload';

interface RecipeWithIngredients {
  id: number;
  name: string;
  difficulty: string | null;
  prep_time_mins: number | null;
  ingredientIds: Set<number>;
  ingredients: Array<{
    id: number;
    name: string;
    amount: string;
    isMain: boolean;
  }>;
}

interface RecipeIngredientRow {
  recipe_id: number;
  recipe_name: string;
  difficulty: string | null;
  prep_time_mins: number | null;
  ingredient_id: number;
  ingredient_name: string;
  amount: string;
  is_main: boolean;
}

/**
 * GET /api/recipes/zero-waste
 *
 * Returns 5 recipes that share maximum ingredients (zero waste shopping).
 * Uses randomized greedy algorithm to vary results.
 *
 * Query params:
 * - recipeId: optional seed recipe ID (if provided, this recipe will be the starting point)
 * - mode: 'overlap' (default) for max shared ingredients, 'diverse' for max different ingredients
 */
export const zeroWasteHandler = withErrorHandling(async (req: PayloadRequest) => {
  const url = new URL(req.url || '', 'http://localhost');
  const seedRecipeId = url.searchParams.get('recipeId') ? parseInt(url.searchParams.get('recipeId')!, 10) : null;
  const mode = url.searchParams.get('mode') === 'diverse' ? 'diverse' : 'overlap';
  // Fetch all recipes with their ingredients
  const query = `
    SELECT
      r.id AS recipe_id,
      r.name AS recipe_name,
      r.difficulty,
      r.prep_time_mins,
      ri.ingredient_id,
      i.name AS ingredient_name,
      ri.amount,
      ri.is_main
    FROM recipes r
    JOIN recipe_ingredients ri ON r.id = ri.recipe_id
    JOIN ingredients i ON ri.ingredient_id = i.id
    ORDER BY r.id, ri.is_main DESC, i.name ASC
  `;

  const { rows } = await req.payload.db.pool.query<RecipeIngredientRow>(query);

  if (rows.length === 0) {
    return Response.json({
      success: true,
      data: {
        recipes: [],
        shoppingList: [],
        stats: { totalIngredients: 0, sharedIngredients: 0 },
      },
    });
  }

  // Group by recipe
  const recipesMap = new Map<number, RecipeWithIngredients>();

  for (const row of rows) {
    let recipe = recipesMap.get(row.recipe_id);
    if (!recipe) {
      recipe = {
        id: row.recipe_id,
        name: row.recipe_name,
        difficulty: row.difficulty,
        prep_time_mins: row.prep_time_mins,
        ingredientIds: new Set(),
        ingredients: [],
      };
      recipesMap.set(row.recipe_id, recipe);
    }
    recipe.ingredientIds.add(row.ingredient_id);
    recipe.ingredients.push({
      id: row.ingredient_id,
      name: row.ingredient_name,
      amount: row.amount,
      isMain: row.is_main,
    });
  }

  const allRecipes = Array.from(recipesMap.values());

  if (allRecipes.length < 5) {
    // Not enough recipes, return all
    return buildResponse(allRecipes);
  }

  // Randomized greedy algorithm
  const selected: RecipeWithIngredients[] = [];
  const remaining = new Set(allRecipes);

  // 1. Pick seed recipe (from query param or random)
  let seed: RecipeWithIngredients | undefined;
  if (seedRecipeId) {
    seed = allRecipes.find((r) => r.id === seedRecipeId);
  }
  if (!seed) {
    seed = pickRandom(Array.from(remaining));
  }
  selected.push(seed);
  remaining.delete(seed);

  // 2. Iteratively add 4 more recipes maximizing ingredient overlap
  while (selected.length < 5 && remaining.size > 0) {
    const currentIngredients = new Set<number>();
    for (const recipe of selected) {
      for (const id of recipe.ingredientIds) {
        currentIngredients.add(id);
      }
    }

    // Score remaining recipes by overlap
    const scored = Array.from(remaining).map((recipe) => {
      const overlap = countOverlap(recipe.ingredientIds, currentIngredients);
      return { recipe, overlap };
    });

    // Sort by overlap: descending for 'overlap' mode, ascending for 'diverse' mode
    if (mode === 'diverse') {
      scored.sort((a, b) => a.overlap - b.overlap);
    } else {
      scored.sort((a, b) => b.overlap - a.overlap);
    }

    // Pick randomly from top 3 (or fewer if less available)
    const topCandidates = scored.slice(0, Math.min(3, scored.length));
    const chosen = pickRandom(topCandidates).recipe;

    selected.push(chosen);
    remaining.delete(chosen);
  }

  return buildResponse(selected);
});

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function countOverlap(setA: Set<number>, setB: Set<number>): number {
  let count = 0;
  for (const id of setA) {
    if (setB.has(id)) count++;
  }
  return count;
}

function buildResponse(recipes: RecipeWithIngredients[]) {
  // Build unified shopping list
  const ingredientUsage = new Map<number, { name: string; usedIn: string[] }>();

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const existing = ingredientUsage.get(ing.id);
      if (existing) {
        existing.usedIn.push(recipe.name);
      } else {
        ingredientUsage.set(ing.id, {
          name: ing.name,
          usedIn: [recipe.name],
        });
      }
    }
  }

  const shoppingList = Array.from(ingredientUsage.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      usedIn: data.usedIn,
    }))
    .sort((a, b) => b.usedIn.length - a.usedIn.length || a.name.localeCompare(b.name, 'cs'));

  const sharedIngredients = shoppingList.filter((i) => i.usedIn.length > 1).length;

  return Response.json({
    success: true,
    data: {
      recipes: recipes.map((r) => ({
        id: r.id,
        name: r.name,
        difficulty: r.difficulty,
        prepTimeMins: r.prep_time_mins,
        ingredients: r.ingredients,
      })),
      shoppingList,
      stats: {
        totalIngredients: shoppingList.length,
        sharedIngredients,
      },
    },
  });
}
