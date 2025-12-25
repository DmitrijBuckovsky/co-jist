'use client';

import { DIFFICULTY_LABELS } from '../_utils/difficulty';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

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

  const fetchZeroWaste = async (recipeId?: number | null, planMode: PlanMode = mode) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (recipeId) params.set('recipeId', String(recipeId));
      if (planMode === 'diverse') params.set('mode', 'diverse');
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

  useEffect(() => {
    fetchZeroWaste(seedRecipeId, mode);
  }, [seedRecipeId, mode]);

  return (
    <div className="zero-waste">
      <div className="zero-waste-header">
        <div className="zero-waste-controls">
          <h2>Plán</h2>
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
              <h3>Recepty</h3>
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
        <button onClick={() => fetchZeroWaste(seedRecipeId)} disabled={loading} className="selector-submit">
          {loading ? 'Načítám...' : 'Nové recepty'}
        </button>
      </div>
    </div>
  );
}
