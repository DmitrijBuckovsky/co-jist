import { withErrorHandling } from '@/core/exceptions';
import { extractJsonBody } from '@/core/utils/json-body-extractor';
import type { PayloadRequest } from 'payload';

interface RandomRecipeDB {
  id: number;
  name: string;
  difficulty: string | null;
  prep_time_mins: number | null;
}

/**
 * POST /api/recipes/random-recipes
 *
 * Returns one random recipe per difficulty level (easy, medium, hard)
 * Optionally excludes recipes containing ingredients with specified allergens
 */
export const randomRecipesHandler = withErrorHandling(async (req: PayloadRequest) => {
  const body = await extractJsonBody(req);
  const { excludeAllergenIds }: { excludeAllergenIds?: number[] } = body || {};

  // Validate excludeAllergenIds
  const sanitizedExcludeAllergenIds = Array.isArray(excludeAllergenIds)
    ? excludeAllergenIds.map(Number).filter((id) => Number.isInteger(id))
    : [];

  // Build allergen exclusion clause
  let allergenExclusionClause = '';
  const params: any[] = [];

  if (sanitizedExcludeAllergenIds.length > 0) {
    params.push(sanitizedExcludeAllergenIds);
    allergenExclusionClause = `
      AND r.id NOT IN (
        SELECT DISTINCT ri.recipe_id
        FROM recipe_ingredients ri
        JOIN ingredients_rels ir ON ri.ingredient_id = ir.parent_id
        WHERE ir.allergens_id = ANY($1::int[])
      )
    `;
  }

  // Get one random recipe per difficulty using DISTINCT ON and random ordering
  const query = `
    WITH ranked_recipes AS (
      SELECT
        r.id,
        r.name,
        r.difficulty,
        r.prep_time_mins,
        ROW_NUMBER() OVER (PARTITION BY r.difficulty ORDER BY RANDOM()) as rn
      FROM recipes r
      WHERE r.difficulty IN ('easy', 'medium', 'hard')
        ${allergenExclusionClause}
    )
    SELECT id, name, difficulty, prep_time_mins
    FROM ranked_recipes
    WHERE rn = 1
    ORDER BY
      CASE difficulty
        WHEN 'easy' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'hard' THEN 3
      END;
  `;

  const { rows } = await req.payload.db.pool.query<RandomRecipeDB>(query, params);

  return Response.json(rows);
});
