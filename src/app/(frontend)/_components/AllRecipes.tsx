'use client';
import { Difficulty, getDifficultyLabel } from '../_utils/difficulty';
import { InfoModal } from './InfoModal';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Recipe {
  id: number;
  name: string;
  difficulty: string | null;
  prepTimeMins: number | null;
}

const STORAGE_KEY_ALLERGENS = 'userAllergens';
const STORAGE_KEY_HIDE = 'hideMyAllergens';

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
  const [hideMyAllergens, setHideMyAllergens] = useState(false);
  const [userAllergenIds, setUserAllergenIds] = useState<Set<number>>(new Set());

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const recipesRef = useRef(recipes);
  const hasMoreRef = useRef(hasMore);
  const hideMyAllergensRef = useRef(hideMyAllergens);
  const userAllergenIdsRef = useRef(userAllergenIds);

  // Keep refs in sync for scroll handler
  useEffect(() => {
    recipesRef.current = recipes;
    hasMoreRef.current = hasMore;
    hideMyAllergensRef.current = hideMyAllergens;
    userAllergenIdsRef.current = userAllergenIds;
  }, [recipes, hasMore, hideMyAllergens, userAllergenIds]);

  const fetchRecipes = async (offset: number = 0, append: boolean = false, hide: boolean, allergenIds: Set<number>) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const requestBody: {
        difficulty?: string[];
        maxPrepTime?: number;
        excludeAllergenIds?: number[];
        limit: number;
        offset: number;
      } = {
        limit: PAGE_SIZE,
        offset,
      };
      if (selectedDifficulties.length > 0) {
        requestBody.difficulty = selectedDifficulties;
      }
      if (maxPrepTime !== null) {
        requestBody.maxPrepTime = maxPrepTime;
      }
      if (hide && allergenIds.size > 0) {
        requestBody.excludeAllergenIds = Array.from(allergenIds);
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
          setRecipes((prev) => {
            const existingIds = new Set(prev.map((r) => r.id));
            const uniqueNew = newRecipes.filter((r: Recipe) => !existingIds.has(r.id));
            return [...prev, ...uniqueNew];
          });
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
  };

  // Load localStorage and fetch on mount
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    let hide = false;
    let allergenIds = new Set<number>();

    try {
      const savedHide = localStorage.getItem(STORAGE_KEY_HIDE);
      if (savedHide) {
        hide = JSON.parse(savedHide);
        setHideMyAllergens(hide);
      }
    } catch {}
    try {
      const savedAllergens = localStorage.getItem(STORAGE_KEY_ALLERGENS);
      if (savedAllergens) {
        allergenIds = new Set(JSON.parse(savedAllergens));
        setUserAllergenIds(allergenIds);
      }
    } catch {}

    fetchRecipes(0, false, hide, allergenIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAllergenToggle = (checked: boolean) => {
    setHideMyAllergens(checked);
    localStorage.setItem(STORAGE_KEY_HIDE, JSON.stringify(checked));
    fetchRecipes(0, false, checked, userAllergenIds);
  };

  // Infinite scroll using IntersectionObserver
  useEffect(() => {
    const trigger = loadMoreRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
          fetchRecipes(recipesRef.current.length, true, hideMyAllergensRef.current, userAllergenIdsRef.current);
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(trigger);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loadingMore]); // Re-observe after loading state changes

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
    <div className="recipe-search" ref={containerRef}>
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="page-title-row">
          <h2
            style={{
              margin: 0,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'rgb(120, 120, 120)',
              fontWeight: 600,
            }}
          >
            Všechny recepty
          </h2>
          <InfoModal>
            <p>Procházejte všechny recepty v databázi.</p>
            <p>Můžete je řadit podle názvu, času přípravy nebo obtížnosti.</p>
            <p>Posouvejte dolů pro načtení dalších receptů.</p>
          </InfoModal>
        </div>
      </div>
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
        {userAllergenIds.size > 0 && (
          <label className="selector-toggle">
            <input type="checkbox" checked={hideMyAllergens} onChange={(e) => handleAllergenToggle(e.target.checked)} />
            Skrýt moje alergeny
          </label>
        )}
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
