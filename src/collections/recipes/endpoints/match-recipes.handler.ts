import { RecipeIngredientDB, RecipeIngredientInfo, RecipeMatch, RecipeMatchDB } from '../dtos/recipe-match.dto';

import { withErrorHandling } from '@/core/exceptions';
import { extractJsonBody } from '@/core/utils/json-body-extractor';
import type { PayloadRequest } from 'payload';

export const matchRecipesHandler = withErrorHandling(async (req: PayloadRequest) => {
  const body = await extractJsonBody(req);
  const {
    ingredientIds,
    difficulty,
    maxPrepTime,
    limit = 20,
    offset = 0,
  }: { ingredientIds?: number[]; difficulty?: string[]; maxPrepTime?: number; limit?: number; offset?: number } = body;
  const sanitizedIds = Array.isArray(ingredientIds)
    ? ingredientIds.map(Number).filter((id) => Number.isInteger(id))
    : [];

  if (sanitizedIds.length === 0) {
    return Response.json({ error: 'ingredientIds array is required and must not be empty' }, { status: 400 });
  }

  // Validate difficulty values
  const validDifficulties = ['easy', 'medium', 'hard'];
  const sanitizedDifficulty = Array.isArray(difficulty) ? difficulty.filter((d) => validDifficulties.includes(d)) : [];

  // Validate maxPrepTime
  const validMaxPrepTime = typeof maxPrepTime === 'number' && maxPrepTime > 0 ? maxPrepTime : null;

  // Validate pagination
  const validLimit = typeof limit === 'number' && limit > 0 ? Math.min(limit, 100) : 20;
  const validOffset = typeof offset === 'number' && offset >= 0 ? offset : 0;

  // Build filter clauses
  const filters: string[] = [];
  const params: any[] = [sanitizedIds];

  if (sanitizedDifficulty.length > 0) {
    params.push(sanitizedDifficulty);
    filters.push(`r.difficulty IS NOT NULL AND r.difficulty::text = ANY($${params.length}::text[])`);
  }

  if (validMaxPrepTime !== null) {
    params.push(validMaxPrepTime);
    filters.push(`r.prep_time_mins <= $${params.length}`);
  }

  const whereClause = filters.length > 0 ? `AND ${filters.join(' AND ')}` : '';

  // Use parameterized SQL to score recipes server-side without loading everything into memory
  const query = `
    WITH user_ingredients AS (
      SELECT unnest($1::int[]) AS ingredient_id
    ),
    recipe_analysis AS (
      SELECT
        r.id,
        r.name,
        r.difficulty,
        r.prep_time_mins,
        COUNT(*) FILTER (WHERE ri.is_main) AS main_total,
        COUNT(*) FILTER (WHERE ri.is_main AND ri.ingredient_id IN (SELECT ingredient_id FROM user_ingredients)) AS main_have,
        COUNT(*) FILTER (WHERE NOT ri.is_main) AS secondary_total,
        COUNT(*) FILTER (WHERE NOT ri.is_main AND ri.ingredient_id IN (SELECT ingredient_id FROM user_ingredients)) AS secondary_have,
        COUNT(*) FILTER (WHERE ri.is_main AND ri.ingredient_id NOT IN (SELECT ingredient_id FROM user_ingredients)) AS missing_main,
        COUNT(*) FILTER (WHERE NOT ri.is_main AND ri.ingredient_id NOT IN (SELECT ingredient_id FROM user_ingredients)) AS missing_secondary,
        COUNT(*) FILTER (WHERE ri.ingredient_id NOT IN (SELECT ingredient_id FROM user_ingredients)) AS missing_total
      FROM recipes r
      JOIN recipe_ingredients ri ON r.id = ri.recipe_id
      WHERE 1=1 ${whereClause}
      GROUP BY r.id, r.name, r.difficulty, r.prep_time_mins
    )
    SELECT
      id,
      name,
      difficulty,
      prep_time_mins,
      main_total,
      main_have,
      secondary_total,
      secondary_have,
      missing_main,
      missing_secondary,
      missing_total,
      (secondary_have - missing_total) AS score,
      COUNT(*) OVER() AS total_count
    FROM recipe_analysis
    WHERE main_have = main_total AND main_total > 0
    ORDER BY score DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2};
  `;

  params.push(validLimit, validOffset);

  const { rows } = await req.payload.db.pool.query<RecipeMatchDB>(query, params);

  if (rows.length === 0) {
    return Response.json({
      success: true,
      data: {
        totalMatches: 0,
        recipes: [],
        hasMore: false,
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

  const totalCount = rows.length > 0 ? parseInt(rows[0].total_count || '0', 10) : 0;

  return Response.json({
    success: true,
    data: {
      totalMatches: totalCount,
      recipes: rows.map((row) => new RecipeMatch(row, ingredientsByRecipe.get(row.id) || [])),
      hasMore: validOffset + rows.length < totalCount,
    },
  });
});
