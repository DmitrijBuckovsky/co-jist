'use client';
import { AllRecipes } from './_components/AllRecipes';
import { IngredientSelector } from './_components/IngredientSelector';
import { RandomRecipes } from './_components/RandomRecipes';
import { RecipeSearch } from './_components/RecipeSearch';
import { ZeroWaste } from './_components/ZeroWaste';
import { Difficulty, DIFFICULTY_LABELS } from './_utils/difficulty';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type View = 'all' | 'search' | 'match' | 'random' | 'zerowaste';

const VALID_VIEWS: View[] = ['all', 'search', 'match', 'random', 'zerowaste'];

export default function HomePage() {
  const searchParams = useSearchParams();
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<Difficulty>>(new Set());
  const [maxPrepTime, setMaxPrepTime] = useState<number | null>(null);

  // Get view from URL params, default to 'random'
  const urlView = searchParams.get('view') as View | null;
  const view: View = urlView && VALID_VIEWS.includes(urlView) ? urlView : 'random';

  // Get seedRecipeId from URL params (for zerowaste) - computed directly, no state needed
  const urlRecipeId = searchParams.get('recipeId');
  const seedRecipeId = urlRecipeId ? parseInt(urlRecipeId, 10) : null;

  useEffect(() => {
    const saved = localStorage.getItem('selectedDifficulties');
    if (saved) {
      try {
        setSelectedDifficulties(new Set(JSON.parse(saved)));
      } catch {}
    }
    const savedTime = localStorage.getItem('maxPrepTime');
    if (savedTime) {
      try {
        setMaxPrepTime(JSON.parse(savedTime));
      } catch {}
    }
  }, []);

  const toggleDifficulty = (diff: Difficulty) => {
    setSelectedDifficulties((prev) => {
      const next = new Set(prev);
      if (next.has(diff)) {
        next.delete(diff);
      } else {
        next.add(diff);
      }
      localStorage.setItem('selectedDifficulties', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const handleMaxPrepTimeChange = (value: number | null) => {
    setMaxPrepTime(value);
    if (value === null) {
      localStorage.removeItem('maxPrepTime');
    } else {
      localStorage.setItem('maxPrepTime', JSON.stringify(value));
    }
  };

  return (
    <div className="main-page">
      {view !== 'random' && view !== 'zerowaste' && (
        <div className="difficulty-filter">
          <div className="filter-section">
            <span className="difficulty-label">Obtížnost:</span>
            <div className="difficulty-options">
              {Object.values(Difficulty).map((diff) => (
                <button
                  key={diff}
                  className={`difficulty-btn ${selectedDifficulties.has(diff) ? 'active' : ''}`}
                  onClick={() => toggleDifficulty(diff)}
                >
                  {DIFFICULTY_LABELS[diff]}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-section">
            <span className="difficulty-label">Max. čas:</span>
            <div className="difficulty-options">
              {[30, 45, 60, 90].map((time) => (
                <button
                  key={time}
                  className={`difficulty-btn ${maxPrepTime === time ? 'active' : ''}`}
                  onClick={() => handleMaxPrepTimeChange(maxPrepTime === time ? null : time)}
                >
                  {time} min
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="view-content">
        {view === 'match' && (
          <IngredientSelector selectedDifficulties={Array.from(selectedDifficulties)} maxPrepTime={maxPrepTime} />
        )}
        {view === 'search' && (
          <RecipeSearch selectedDifficulties={Array.from(selectedDifficulties)} maxPrepTime={maxPrepTime} />
        )}
        {view === 'all' && (
          <AllRecipes selectedDifficulties={Array.from(selectedDifficulties)} maxPrepTime={maxPrepTime} />
        )}
        {view === 'random' && <RandomRecipes />}
        {view === 'zerowaste' && <ZeroWaste seedRecipeId={seedRecipeId} />}
      </div>
    </div>
  );
}
