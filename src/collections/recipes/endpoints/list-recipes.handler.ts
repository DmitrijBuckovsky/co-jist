import { withErrorHandling } from '@/core/exceptions';
import { extractJsonBody } from '@/core/utils/json-body-extractor';
import type { PayloadRequest } from 'payload';

interface RecipeIngredientDB {
  recipe_id: number;
  ingredient_id: number;
  ingredient_name: string;
  is_main: boolean;
}

interface RecipeIngredientInfo {
  id: number;
  name: string;
  isMain: boolean;
  have: boolean;
}

interface RecipeMatchDB {
  id: number;
  name: string;
  difficulty: string | null;
  prep_time_mins: number | null;
  main_total: number;
  main_have: number;
  secondary_total: number;
  secondary_have: number;
  missing_main: number;
  missing_secondary: number;
  missing_total: number;
  score: number;
}

class RecipeMatch {
  constructor(
    public row: RecipeMatchDB,
    public ingredients: RecipeIngredientInfo[],
  ) {}

  toJSON() {
    return {
      id: this.row.id,
      name: this.row.name,
      difficulty: this.row.difficulty,
      prepTimeMins: this.row.prep_time_mins,
      mainTotal: this.row.main_total,
      mainHave: this.row.main_have,
      secondaryTotal: this.row.secondary_total,
      secondaryHave: this.row.secondary_have,
      missingMain: this.row.missing_main,
      missingSecondary: this.row.missing_secondary,
      missingTotal: this.row.missing_total,
      score: this.row.score,
      ingredients: this.ingredients,
    };
  }
}

export const listRecipesHandler = withErrorHandling(async (req: PayloadRequest) => {
  const body = await extractJsonBody(req);
  const {
    difficulty,
    maxPrepTime,
    limit = 20,
    offset = 0,
  }: { difficulty?: string[]; maxPrepTime?: number; limit?: number; offset?: number } = body;

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
  const params: any[] = [];

  if (sanitizedDifficulty.length > 0) {
    params.push(sanitizedDifficulty);
    filters.push(`r.difficulty IS NOT NULL AND r.difficulty::text = ANY($${params.length}::text[])`);
  }

  if (validMaxPrepTime !== null) {
    params.push(validMaxPrepTime);
    filters.push(`r.prep_time_mins <= $${params.length}`);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  // Get total count
  const countQuery = `
    SELECT COUNT(DISTINCT r.id) as total
    FROM recipes r
    JOIN recipe_ingredients ri ON r.id = ri.recipe_id
    ${whereClause};
  `;
  const { rows: countRows } = await req.payload.db.pool.query<{ total: string }>(countQuery, params);
  const totalCount = parseInt(countRows[0]?.total || '0', 10);

  // Get paginated recipes with their ingredients
  params.push(validLimit);
  params.push(validOffset);

  const query = `
    SELECT
      r.id,
      r.name,
      r.difficulty,
      r.prep_time_mins,
      COUNT(*) FILTER (WHERE ri.is_main) AS main_total,
      0 AS main_have,
      COUNT(*) FILTER (WHERE NOT ri.is_main) AS secondary_total,
      0 AS secondary_have,
      COUNT(*) FILTER (WHERE ri.is_main) AS missing_main,
      COUNT(*) FILTER (WHERE NOT ri.is_main) AS missing_secondary,
      COUNT(*) AS missing_total,
      0 AS score
    FROM recipes r
    JOIN recipe_ingredients ri ON r.id = ri.recipe_id
    ${whereClause}
    GROUP BY r.id, r.name, r.difficulty, r.prep_time_mins
    ORDER BY r.name ASC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;

  const { rows } = await req.payload.db.pool.query<RecipeMatchDB>(query, params);

  if (rows.length === 0) {
    return Response.json({
      success: true,
      data: {
        totalMatches: totalCount,
        recipes: [],
        hasMore: false,
      },
    });
  }

  // Get ingredients for all recipes
  const recipeIds = rows.map((r) => r.id);
  const ingredientsQuery = `
    SELECT
      ri.recipe_id,
      ri.ingredient_id,
      i.name AS ingredient_name,
      ri.is_main
    FROM recipe_ingredients ri
    JOIN ingredients i ON ri.ingredient_id = i.id
    WHERE ri.recipe_id = ANY($1::int[])
    ORDER BY ri.is_main DESC, i.name ASC;
  `;

  const { rows: ingredientRows } = await req.payload.db.pool.query<RecipeIngredientDB>(ingredientsQuery, [recipeIds]);

  // Group ingredients by recipe_id
  const ingredientsByRecipe = new Map<number, RecipeIngredientInfo[]>();
  for (const row of ingredientRows) {
    const info: RecipeIngredientInfo = {
      id: row.ingredient_id,
      name: row.ingredient_name,
      isMain: row.is_main,
      have: false, // When no ingredients selected, none are "had"
    };
    const existing = ingredientsByRecipe.get(row.recipe_id) || [];
    existing.push(info);
    ingredientsByRecipe.set(row.recipe_id, existing);
  }

  return Response.json({
    success: true,
    data: {
      totalMatches: totalCount,
      recipes: rows.map((row) => new RecipeMatch(row, ingredientsByRecipe.get(row.id) || [])),
      hasMore: validOffset + rows.length < totalCount,
    },
  });
});
