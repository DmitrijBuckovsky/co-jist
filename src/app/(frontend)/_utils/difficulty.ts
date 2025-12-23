export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.Easy]: 'Snadné',
  [Difficulty.Medium]: 'Střední',
  [Difficulty.Hard]: 'Těžké',
};

export const getDifficultyLabel = (difficulty: string): string => {
  return DIFFICULTY_LABELS[difficulty as Difficulty] || difficulty;
};
