'use client';
import { Difficulty, getDifficultyLabel } from '../_utils/difficulty';
import { Allergen, AllergenBadge } from './AllergenBadge';
import { PageHeader } from './PageHeader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface SearchParams {
  ingredientIds: number[];
  difficulty?: string[];
  maxPrepTime?: number;
}

const PAGE_SIZE = 20;

interface RecipeIngredient {
  id: number;
  name: string;
  isMain: boolean;
  have: boolean;
  allergens?: Allergen[];
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

type SortOption = 'name' | 'prepTime' | 'difficulty' | 'score';

const SORT_OPTIONS: Record<SortOption, string> = {
  score: 'Shoda',
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
  const [recipes, setRecipes] = useState<RecipeMatch[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const savedSort = localStorage.getItem('recipeSortBy');
    if (savedSort) {
      setSortBy(savedSort as SortOption);
    }

    const savedResults = localStorage.getItem('recipeMatches');
    const savedParams = localStorage.getItem('recipeSearchParams');

    if (!savedResults || !savedParams) {
      router.push('/');
      return;
    }

    try {
      const resultsData: RecipeResultsData = JSON.parse(savedResults);
      const paramsData: SearchParams = JSON.parse(savedParams);
      setRecipes(resultsData.recipes);
      setTotalMatches(resultsData.totalMatches);
      setHasMore((resultsData as RecipeResultsData & { hasMore?: boolean }).hasMore ?? resultsData.recipes.length < resultsData.totalMatches);
      setSearchParams(paramsData);
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchMore = useCallback(async () => {
    if (!searchParams || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setLoadingMore(true);

    try {
      const response = await fetch('/api/recipes/match-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...searchParams,
          limit: PAGE_SIZE,
          offset: recipes.length,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newRecipes = data.data?.recipes || [];
        setHasMore(data.data?.hasMore || false);
        setRecipes((prev) => [...prev, ...newRecipes]);
      }
    } catch (error) {
      console.error('Failed to fetch more recipes:', error);
    } finally {
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [searchParams, recipes.length]);

  const handleScroll = useCallback(() => {
    if (!hasMore || isLoadingRef.current) return;

    const trigger = loadMoreRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight + 100;

    if (isVisible) {
      fetchMore();
    }
  }, [hasMore, fetchMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const sortedRecipes = useMemo(() => {
    if (!recipes.length) return [];

    return [...recipes].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
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
    return (
      <div className="page-container">
        <div className="page-loading">
          <div className="spinner" />
          <p>Načítání...</p>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
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
        title={`${totalMatches} ${totalMatches === 1 ? 'recept' : totalMatches < 5 ? 'recepty' : 'receptů'}`}
      >
        <div className="sort-controls">
          <label htmlFor="sort-select">Řadit podle:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => {
              const val = e.target.value as SortOption;
              setSortBy(val);
              localStorage.setItem('recipeSortBy', val);
            }}
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
                    {ing.allergens && ing.allergens.length > 0 && <AllergenBadge allergens={ing.allergens} />}
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
        <div ref={loadMoreRef} className="load-more-trigger">
          {loadingMore && <div className="loading-more">Načítám další...</div>}
          {!loadingMore && hasMore && <div className="loading-more">Posuňte pro načtení dalších</div>}
        </div>
      </div>
    </div>
  );
}
