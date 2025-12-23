'use client';
import { Difficulty, getDifficultyLabel } from '../_utils/difficulty';
import { PageHeader } from './PageHeader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface RecipeIngredient {
  id: number;
  name: string;
  isMain: boolean;
  have: boolean;
}

interface RecipeMatch {
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
  ingredients: RecipeIngredient[];
}

interface RecipeResultsData {
  totalMatches: number;
  recipes: RecipeMatch[];
}

type SortOption = 'name' | 'prepTime' | 'difficulty';

const SORT_OPTIONS: Record<SortOption, string> = {
  name: 'Název',
  prepTime: 'Čas přípravy',
  difficulty: 'Obtížnost',
};

const DIFFICULTY_ORDER = {
  [Difficulty.Easy]: 1,
  [Difficulty.Medium]: 2,
  [Difficulty.Hard]: 3,
};

export function RecipeResults() {
  const router = useRouter();
  const [results, setResults] = useState<RecipeResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('name');

  useEffect(() => {
    const savedResults = localStorage.getItem('recipeMatches');

    if (!savedResults) {
      router.push('/');
      return;
    }

    try {
      setResults(JSON.parse(savedResults));
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const sortedRecipes = useMemo(() => {
    if (!results) return [];

    return [...results.recipes].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'prepTime':
          const aTime = a.prepTimeMins || 0;
          const bTime = b.prepTimeMins || 0;
          return aTime - bTime;
        case 'difficulty':
          const aDiff = DIFFICULTY_ORDER[a.difficulty as Difficulty] || 0;
          const bDiff = DIFFICULTY_ORDER[b.difficulty as Difficulty] || 0;
          return aDiff - bDiff;
        default:
          return 0;
      }
    });
  }, [results, sortBy]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-loading">
          <div className="spinner" />
          <p>Načítání...</p>
        </div>
      </div>
    );
  }

  if (!results || results.recipes.length === 0) {
    return (
      <div className="page-container">
        <PageHeader title="Žádné recepty nenalezeny" />
        <p className="page-message">Zkuste vybrat více ingrediencí</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title={`${results.totalMatches} ${results.totalMatches === 1 ? 'recept' : results.totalMatches < 5 ? 'recepty' : 'receptů'}`}
      >
        <div className="sort-controls">
          <label htmlFor="sort-select">Řadit podle:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="sort-select"
          >
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </PageHeader>

      <div className="results-list">
        {sortedRecipes.map((recipe) => (
          <Link key={recipe.id} href={`/recipe/${recipe.id}`} className="results-card">
            <div className="results-card-content">
              <div className="results-card-header">
                <h2>{recipe.name}</h2>
                {recipe.difficulty && (
                  <span className={`difficulty-badge ${recipe.difficulty}`}>
                    {getDifficultyLabel(recipe.difficulty)}
                  </span>
                )}
              </div>
              <div className="results-card-ingredients">
                {recipe.ingredients.map((ing) => (
                  <span
                    key={ing.id}
                    className={`results-ingredient ${ing.have ? 'have' : 'missing'} ${ing.isMain ? 'main' : ''}`}
                  >
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="results-card-right">
              {recipe.prepTimeMins && <span className="results-card-time">{recipe.prepTimeMins} min</span>}
              <span className="results-card-score">{recipe.score}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
