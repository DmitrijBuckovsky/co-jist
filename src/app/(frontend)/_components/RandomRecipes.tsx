'use client';

import { DIFFICULTY_LABELS } from '../_utils/difficulty';
import { Recipe } from '@/payload-types';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export function RandomRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recipes/random-recipes');
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

  useEffect(() => {
    fetchRandomRecipes();
  }, []);

  return (
    <div className="recipe-search" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '12px' }}>
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
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="recipe-search-list" style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          // Skeleton loading state
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
        <button onClick={fetchRandomRecipes} disabled={loading} className="selector-submit">
          {loading ? 'Načítám...' : 'Obnovit recepty'}
        </button>
      </div>
    </div>
  );
}
