'use client';

import { DIFFICULTY_LABELS } from '../_utils/difficulty';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

interface RandomRecipe {
  id: number;
  name: string;
  difficulty: string | null;
  prep_time_mins: number | null;
}

const STORAGE_KEY_ALLERGENS = 'userAllergens';
const STORAGE_KEY_HIDE = 'hideMyAllergens';

export function RandomRecipes() {
  const [recipes, setRecipes] = useState<RandomRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideMyAllergens, setHideMyAllergens] = useState(false);
  const [userAllergenIds, setUserAllergenIds] = useState<Set<number>>(new Set());
  const hasFetchedRef = useRef(false);

  const fetchRandomRecipes = async (hide: boolean, allergenIds: Set<number>) => {
    setLoading(true);
    setError(null);
    try {
      const requestBody: { excludeAllergenIds?: number[] } = {};
      if (hide && allergenIds.size > 0) {
        requestBody.excludeAllergenIds = Array.from(allergenIds);
      }

      const response = await fetch('/api/recipes/random-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch random recipes');
      }
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError('Failed to load random recipes');
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

    fetchRandomRecipes(hide, allergenIds);
  }, []);

  const handleAllergenToggle = (checked: boolean) => {
    setHideMyAllergens(checked);
    localStorage.setItem(STORAGE_KEY_HIDE, JSON.stringify(checked));
    fetchRandomRecipes(checked, userAllergenIds);
  };

  return (
    <div className="recipe-search" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          Náhodné recepty
        </h2>
        {userAllergenIds.size > 0 && (
          <label className="selector-toggle">
            <input type="checkbox" checked={hideMyAllergens} onChange={(e) => handleAllergenToggle(e.target.checked)} />
            Skrýt moje alergeny
          </label>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="recipe-search-list" style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="recipe-search-item skeleton"
              style={{ height: '44px', background: 'rgb(30, 30, 30)', animation: 'pulse 1.5s infinite' }}
            ></div>
          ))
        ) : recipes.length > 0 ? (
          recipes.map((recipe) => (
            <Link href={`/recipe/${recipe.id}`} key={recipe.id} className="recipe-search-item">
              <div className="recipe-search-content">
                <span className="recipe-search-name">{recipe.name}</span>
                <span className={`difficulty-badge ${recipe.difficulty || 'medium'}`}>
                  {DIFFICULTY_LABELS[recipe.difficulty as keyof typeof DIFFICULTY_LABELS] || recipe.difficulty}
                </span>
              </div>
              {recipe.prep_time_mins && <span className="recipe-search-time">{recipe.prep_time_mins} min</span>}
            </Link>
          ))
        ) : (
          <div className="recipe-search-empty">Žádné recepty nebyly nalezeny.</div>
        )}
      </div>

      <div className="selector-footer">
        <button
          onClick={() => fetchRandomRecipes(hideMyAllergens, userAllergenIds)}
          disabled={loading}
          className="selector-submit"
        >
          {loading ? 'Načítám...' : 'Obnovit recepty'}
        </button>
      </div>
    </div>
  );
}
