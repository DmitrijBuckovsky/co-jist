'use client';
import { Difficulty, getDifficultyLabel } from '../_utils/difficulty';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

const PAGE_SIZE = 20;

interface AllRecipesProps {
  selectedDifficulties?: string[];
  maxPrepTime?: number | null;
}

export function AllRecipes({ selectedDifficulties = [], maxPrepTime = null }: AllRecipesProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const fetchRecipes = useCallback(
    async (offset: number = 0, append: boolean = false) => {
      // Use ref to prevent duplicate calls
      if (append && isLoadingRef.current) return;

      if (append) {
        isLoadingRef.current = true;
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const requestBody: { difficulty?: string[]; maxPrepTime?: number; limit: number; offset: number } = {
          limit: PAGE_SIZE,
          offset,
        };
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
          const newRecipes = data.data?.recipes || [];
          setHasMore(data.data?.hasMore || false);

          if (append) {
            setRecipes((prev) => [...prev, ...newRecipes]);
          } else {
            setRecipes(newRecipes);
          }
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isLoadingRef.current = false;
      }
    },
    [selectedDifficulties, maxPrepTime],
  );

  useEffect(() => {
    fetchRecipes(0, false);
  }, [fetchRecipes]);

  // Infinite scroll - use scroll event
  const handleScroll = useCallback(() => {
    if (!hasMore || isLoadingRef.current) return;

    const trigger = loadMoreRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight + 100;

    if (isVisible) {
      fetchRecipes(recipes.length, true);
    }
  }, [hasMore, recipes.length, fetchRecipes]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    // Also check immediately in case content is short
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

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
        <div ref={loadMoreRef} className="load-more-trigger">
          {loadingMore && <div className="loading-more">Načítám další...</div>}
          {!loadingMore && hasMore && <div className="loading-more">Posuňte pro načtení dalších</div>}
        </div>
      </div>
    </div>
  );
}
