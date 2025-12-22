import { RecipeIngredientDB, RecipeIngredientInfo, RecipeMatch, RecipeMatchDB } from '../dtos/recipe-match.dto';

import { withErrorHandling } from '@/core/exceptions';
import { extractJsonBody } from '@/core/utils/json-body-extractor';
import type { PayloadRequest } from 'payload';

export const matchRecipesHandler = withErrorHandling(async (req: PayloadRequest) => {
  const body = await extractJsonBody(req);
  const { ingredientIds }: { ingredientIds?: number[] } = body;
  const sanitizedIds = Array.isArray(ingredientIds)
    ? ingredientIds.map(Number).filter((id) => Number.isInteger(id))
    : [];

  if (sanitizedIds.length === 0) {
    return Response.json({ error: 'ingredientIds array is required and must not be empty' }, { status: 400 });
  }

  // Use parameterized SQL to score recipes server-side without loading everything into memory
  const query = `
    WITH user_ingredients AS (
      SELECT unnest($1::int[]) AS ingredient_id
    ),
    recipe_analysis AS (
      SELECT
        r.id,
        r.name,
        COUNT(*) FILTER (WHERE ri.is_main) AS main_total,
        COUNT(*) FILTER (WHERE ri.is_main AND ri.ingredient_id IN (SELECT ingredient_id FROM user_ingredients)) AS main_have,
        COUNT(*) FILTER (WHERE NOT ri.is_main) AS secondary_total,
        COUNT(*) FILTER (WHERE NOT ri.is_main AND ri.ingredient_id IN (SELECT ingredient_id FROM user_ingredients)) AS secondary_have,
        COUNT(*) FILTER (WHERE ri.is_main AND ri.ingredient_id NOT IN (SELECT ingredient_id FROM user_ingredients)) AS missing_main,
        COUNT(*) FILTER (WHERE NOT ri.is_main AND ri.ingredient_id NOT IN (SELECT ingredient_id FROM user_ingredients)) AS missing_secondary,
        COUNT(*) FILTER (WHERE ri.ingredient_id NOT IN (SELECT ingredient_id FROM user_ingredients)) AS missing_total
      FROM recipes r
      JOIN recipe_ingredients ri ON r.id = ri.recipe_id
      GROUP BY r.id, r.name
    )
    SELECT
      id,
      name,
      main_total,
      main_have,
      secondary_total,
      secondary_have,
      missing_main,
      missing_secondary,
      missing_total,
      (secondary_have - missing_total) AS score
    FROM recipe_analysis
    WHERE main_have = main_total AND main_total > 0
    ORDER BY score DESC;
  `;

  const { rows } = await req.payload.db.pool.query<RecipeMatchDB>(query, [sanitizedIds]);

  if (rows.length === 0) {
    return Response.json({
      success: true,
      data: {
        totalMatches: 0,
        recipes: [],
      },
    });
  }

  // Get ingredients for all matched recipes
  const recipeIds = rows.map((r) => r.id);
  const ingredientsQuery = `
    WITH user_ingredients AS (
      SELECT unnest($1::int[]) AS ingredient_id
    )
    SELECT
      ri.recipe_id,
      ri.ingredient_id,
      i.name AS ingredient_name,
      ri.is_main,
      ri.ingredient_id IN (SELECT ingredient_id FROM user_ingredients) AS have
    FROM recipe_ingredients ri
    JOIN ingredients i ON ri.ingredient_id = i.id
    WHERE ri.recipe_id = ANY($2::int[])
    ORDER BY ri.is_main DESC, i.name ASC;
  `;

  const { rows: ingredientRows } = await req.payload.db.pool.query<RecipeIngredientDB>(ingredientsQuery, [
    sanitizedIds,
    recipeIds,
  ]);

  // Group ingredients by recipe_id
  const ingredientsByRecipe = new Map<number, RecipeIngredientInfo[]>();
  for (const row of ingredientRows) {
    const info: RecipeIngredientInfo = {
      id: row.ingredient_id,
      name: row.ingredient_name,
      isMain: row.is_main,
      have: row.have,
    };
    const existing = ingredientsByRecipe.get(row.recipe_id) || [];
    existing.push(info);
    ingredientsByRecipe.set(row.recipe_id, existing);
  }

  return Response.json({
    success: true,
    data: {
      totalMatches: rows.length,
      recipes: rows.map((row) => new RecipeMatch(row, ingredientsByRecipe.get(row.id) || [])),
    },
  });
});
