'use client';

import { DIFFICULTY_LABELS } from '../_utils/difficulty';
import { InfoModal } from './InfoModal';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

const STORAGE_KEY_ALLERGENS = 'userAllergens';
const STORAGE_KEY_HIDE = 'hideMyAllergens';

interface ZeroWasteRecipe {
  id: number;
  name: string;
  difficulty: string | null;
  prepTimeMins: number | null;
  ingredients: Array<{
    id: number;
    name: string;
    amount: string;
    isMain: boolean;
  }>;
}

interface ShoppingItem {
  id: number;
  name: string;
  usedIn: string[];
}

interface ZeroWasteData {
  recipes: ZeroWasteRecipe[];
  shoppingList: ShoppingItem[];
  stats: {
    totalIngredients: number;
    sharedIngredients: number;
  };
}

type PlanMode = 'overlap' | 'diverse';

interface ZeroWasteProps {
  seedRecipeId?: number | null;
}

export function ZeroWaste({ seedRecipeId }: ZeroWasteProps) {
  const [data, setData] = useState<ZeroWasteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PlanMode>('overlap');
  const [hideMyAllergens, setHideMyAllergens] = useState(false);
  const [userAllergenIds, setUserAllergenIds] = useState<Set<number>>(new Set());
  const hasFetchedRef = useRef(false);
  const lastFetchKeyRef = useRef<string>('');

  const fetchZeroWaste = async (
    recipeId?: number | null,
    planMode: PlanMode = mode,
    hide: boolean = hideMyAllergens,
    allergenIds: Set<number> = userAllergenIds,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (recipeId) params.set('recipeId', String(recipeId));
      if (planMode === 'diverse') params.set('mode', 'diverse');
      if (hide && allergenIds.size > 0) {
        params.set('excludeAllergens', Array.from(allergenIds).join(','));
      }
      const url = `/api/recipes/zero-waste${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      setError('Nepodařilo se načíst recepty');
      console.error(err);
    } finally {
      setLoading(false);
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

    lastFetchKeyRef.current = `${seedRecipeId}-${mode}`;
    fetchZeroWaste(seedRecipeId, mode, hide, allergenIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when mode changes (after initial mount)
  useEffect(() => {
    if (!hasFetchedRef.current) return;
    const fetchKey = `${seedRecipeId}-${mode}`;
    if (lastFetchKeyRef.current === fetchKey) return;
    lastFetchKeyRef.current = fetchKey;
    fetchZeroWaste(seedRecipeId, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedRecipeId, mode]);

  const handleAllergenToggle = (checked: boolean) => {
    setHideMyAllergens(checked);
    localStorage.setItem(STORAGE_KEY_HIDE, JSON.stringify(checked));
    fetchZeroWaste(seedRecipeId, mode, checked, userAllergenIds);
  };

  return (
    <div className="zero-waste">
      <div className="zero-waste-header">
        <div className="zero-waste-controls">
          <div className="page-title-row">
            <h2>Plán</h2>
            <InfoModal>
              <p>Plánování jídel s minimálním odpadem.</p>
              <p>Režim "Sdílené" najde recepty se společnými ingrediencemi, "Různé" nabídne pestřejší výběr.</p>
              <p>Seznam nákupu ukazuje všechny potřebné ingredience.</p>
            </InfoModal>
          </div>
          <div className="zero-waste-toggle-group">
            <label className="zero-waste-toggle-label">Ingredience:</label>
            <div className="selector-view-toggle">
              <button
                className={`selector-view-btn ${mode === 'overlap' ? 'active' : ''}`}
                onClick={() => setMode('overlap')}
                disabled={loading}
              >
                Sdílené
              </button>
              <button
                className={`selector-view-btn ${mode === 'diverse' ? 'active' : ''}`}
                onClick={() => setMode('diverse')}
                disabled={loading}
              >
                Různé
              </button>
            </div>
          </div>
        </div>
        {data && (
          <div className="zero-waste-stats">
            <span>{data.recipes.length} receptů</span>
            <span className="separator">•</span>
            <span>{data.stats.totalIngredients} ingrediencí</span>
            {data.stats.sharedIngredients > 0 && (
              <>
                <span className="separator">•</span>
                <span className="shared">{data.stats.sharedIngredients} sdílených</span>
              </>
            )}
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="zero-waste-content">
        {loading ? (
          <div className="zero-waste-loading">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="recipe-search-item skeleton" style={{ height: '44px' }}></div>
            ))}
          </div>
        ) : data && data.recipes.length > 0 ? (
          <>
            <div className="zero-waste-recipes">
              <div className="zero-waste-title">
                <h3>Recepty</h3>
                {userAllergenIds.size > 0 && (
                  <label className="selector-toggle">
                    <input
                      type="checkbox"
                      checked={hideMyAllergens}
                      onChange={(e) => handleAllergenToggle(e.target.checked)}
                    />
                    Skrýt moje alergeny
                  </label>
                )}
              </div>
              <div className="recipe-search-list">
                {data.recipes.map((recipe) => (
                  <Link href={`/recipe/${recipe.id}`} key={recipe.id} className="recipe-search-item">
                    <div className="recipe-search-content">
                      <span className="recipe-search-name">{recipe.name}</span>
                      {recipe.difficulty && (
                        <span className={`difficulty-badge ${recipe.difficulty}`}>
                          {DIFFICULTY_LABELS[recipe.difficulty as keyof typeof DIFFICULTY_LABELS]}
                        </span>
                      )}
                    </div>
                    {recipe.prepTimeMins && <span className="recipe-search-time">{recipe.prepTimeMins} min</span>}
                  </Link>
                ))}
              </div>
            </div>

            <div className="zero-waste-shopping">
              <h3>Seznam</h3>
              <ul className="shopping-list">
                {data.shoppingList.map((item) => (
                  <li key={item.id} className={item.usedIn.length > 1 ? 'shared' : ''}>
                    <span className="shopping-item-name">{item.name}</span>
                    {item.usedIn.length > 1 && <span className="shopping-item-count">({item.usedIn.length}×)</span>}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="recipe-search-empty">Žádné recepty nebyly nalezeny.</div>
        )}
      </div>

      <div className="selector-footer">
        <button
          onClick={() => fetchZeroWaste(seedRecipeId, mode, hideMyAllergens, userAllergenIds)}
          disabled={loading}
          className="selector-submit"
        >
          {loading ? 'Načítám...' : 'Nové recepty'}
        </button>
      </div>
    </div>
  );
}
