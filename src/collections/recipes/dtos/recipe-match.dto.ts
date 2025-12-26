export interface RecipeIngredientInfo {
  id: number;
  name: string;
  isMain: boolean;
  have: boolean;
}

export class RecipeMatch {
  id: number;
  name: string;
  difficulty: string | null;
  prepTimeMins: number | null;
  mainTotal: number;
  mainHave: number;
  secondaryTotal: number;
  secondaryHave: number;
  missingMain: number;
  missingSecondary: number;
  missingTotal: number;
  score: number;
  ingredients: RecipeIngredientInfo[];

  constructor(dbEntity: RecipeMatchDB, ingredients: RecipeIngredientInfo[] = []) {
    this.id = dbEntity.id;
    this.name = dbEntity.name;
    this.difficulty = dbEntity.difficulty;
    this.prepTimeMins = dbEntity.prep_time_mins;
    this.mainTotal = Number(dbEntity.main_total);
    this.mainHave = Number(dbEntity.main_have);
    this.secondaryTotal = Number(dbEntity.secondary_total);
    this.secondaryHave = Number(dbEntity.secondary_have);
    this.missingMain = Number(dbEntity.missing_main);
    this.missingSecondary = Number(dbEntity.missing_secondary);
    this.missingTotal = Number(dbEntity.missing_total);
    this.score = Number(dbEntity.score);
    this.ingredients = ingredients;
  }
}

export interface RecipeMatchDB {
  id: number;
  name: string;
  difficulty: string | null;
  prep_time_mins: number | null;
  main_total: string;
  main_have: string;
  secondary_total: string;
  secondary_have: string;
  missing_main: string;
  missing_secondary: string;
  missing_total: string;
  score: string;
  total_count?: string;
}

export interface RecipeIngredientDB {
  recipe_id: number;
  ingredient_id: number;
  ingredient_name: string;
  is_main: boolean;
  have: boolean;
}
