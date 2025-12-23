'use client';
import { getDifficultyLabel } from '../_utils/difficulty';
import Link from 'next/link';
import { useState } from 'react';

interface RecipeSearchResult {
  id: number;
  name: string;
  difficulty: string | null;
  prep_time_mins: number | null;
  similarity: number;
}

interface RecipeSearchProps {
  selectedDifficulties?: string[];
  maxPrepTime?: number | null;
}

export function RecipeSearch({ selectedDifficulties = [], maxPrepTime = null }: RecipeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RecipeSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (query.trim().length < 2) return;

    setSearching(true);
    setSearched(true);

    try {
      const requestBody: { query: string; limit: number; difficulty?: string[]; maxPrepTime?: number } = {
        query: query.trim(),
        limit: 20,
      };
      if (selectedDifficulties.length > 0) {
        requestBody.difficulty = selectedDifficulties;
      }
      if (maxPrepTime !== null) {
        requestBody.maxPrepTime = maxPrepTime;
      }

      const response = await fetch('/api/recipes/search-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.data?.recipes || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearching(false);
    setSearched(false);
  };

  return (
    <div className="recipe-search">
      <h2>Hledat recepty</h2>

      <div className="recipe-search-input">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Zadejte název receptu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className="clear-button" onClick={handleClear} aria-label="Clear search">
            ×
          </button>
        </div>
        <button onClick={handleSearch} disabled={searching || query.trim().length < 2}>
          {searching ? 'Hledám...' : 'Hledat'}
        </button>
      </div>

      {searched && (
        <div className="recipe-search-results">
          {results.length === 0 ? (
            <p className="recipe-search-empty">Žádné recepty nenalezeny</p>
          ) : (
            <div className="recipe-search-list">
              {results.map((recipe) => (
                <Link key={recipe.id} href={`/recipe/${recipe.id}`} className="recipe-search-item">
                  <div className="recipe-search-content">
                    <span className="recipe-search-name">{recipe.name}</span>
                    {recipe.difficulty && (
                      <span className={`difficulty-badge ${recipe.difficulty}`}>
                        {getDifficultyLabel(recipe.difficulty)}
                      </span>
                    )}
                  </div>
                  {recipe.prep_time_mins && <span className="recipe-search-time">{recipe.prep_time_mins} min</span>}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
