'use client';
import { Difficulty, getDifficultyLabel } from '../_utils/difficulty';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface Recipe {
  id: number;
  name: string;
  difficulty: string | null;
  prepTimeMins: number | null;
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

interface AllRecipesProps {
  selectedDifficulties?: string[];
  maxPrepTime?: number | null;
}

export function AllRecipes({ selectedDifficulties = [], maxPrepTime = null }: AllRecipesProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('name');

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const requestBody: { difficulty?: string[]; maxPrepTime?: number } = {};
        if (selectedDifficulties.length > 0) {
          requestBody.difficulty = selectedDifficulties;
        }
        if (maxPrepTime !== null) {
          requestBody.maxPrepTime = maxPrepTime;
        }

        const response = await fetch('/api/recipes/list-recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          setRecipes(data.data?.recipes || []);
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [selectedDifficulties, maxPrepTime]);

  const sortedRecipes = useMemo(() => {
    if (!recipes) return [];

    return [...recipes].sort((a, b) => {
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
  }, [recipes, sortBy]);

  if (loading) {
    return <div className="loading">Načítání receptů...</div>;
  }

  if (recipes.length === 0) {
    return <div className="empty">Žádné recepty nenalezeny.</div>;
  }

  return (
    <div className="recipe-search">
      <div className="results-controls">
        <div className="sort-controls">
          <label htmlFor="sort-select-all">Řadit podle:</label>
          <select
            id="sort-select-all"
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
      </div>
      <div className="recipe-search-list">
        {sortedRecipes.map((recipe) => (
          <Link href={`/recipe/${recipe.id}`} key={recipe.id} className="recipe-search-item">
            <div className="recipe-search-content">
              <span className="recipe-search-name">{recipe.name}</span>
              {recipe.difficulty && (
                <span className={`difficulty-badge ${recipe.difficulty}`}>{getDifficultyLabel(recipe.difficulty)}</span>
              )}
            </div>
            {recipe.prepTimeMins && <span className="recipe-search-time">{recipe.prepTimeMins} min</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
