export class RecipeMatch {
  id: number;
  name: string;
  mainTotal: number;
  mainHave: number;
  secondaryTotal: number;
  secondaryHave: number;
  missingMain: number;
  missingSecondary: number;
  missingTotal: number;
  score: number;

  constructor(dbEntity: RecipeMatchDB) {
    this.id = dbEntity.id;
    this.name = dbEntity.name;
    this.mainTotal = Number(dbEntity.main_total);
    this.mainHave = Number(dbEntity.main_have);
    this.secondaryTotal = Number(dbEntity.secondary_total);
    this.secondaryHave = Number(dbEntity.secondary_have);
    this.missingMain = Number(dbEntity.missing_main);
    this.missingSecondary = Number(dbEntity.missing_secondary);
    this.missingTotal = Number(dbEntity.missing_total);
    this.score = Number(dbEntity.score);
  }
}

export interface RecipeMatchDB {
  id: number;
  name: string;
  main_total: string;
  main_have: string;
  secondary_total: string;
  secondary_have: string;
  missing_main: string;
  missing_secondary: string;
  missing_total: string;
  score: string;
}
