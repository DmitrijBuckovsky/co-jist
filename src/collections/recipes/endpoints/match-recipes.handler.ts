import { withErrorHandling } from '@/core/exceptions';
import { extractJsonBody } from '@/core/utils/json-body-extractor';
import type { PayloadRequest } from 'payload';
import { RecipeMatch, RecipeMatchDB } from '../dtos/recipe-match.dto';

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

  return Response.json({
    success: true,
    data: {
      totalMatches: rows.length,
      recipes: rows.map((row) => new RecipeMatch(row)),
    },
  });
});
