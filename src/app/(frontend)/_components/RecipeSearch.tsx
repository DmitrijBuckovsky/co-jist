'use client';
import { useWordAutocomplete } from '../_hooks/useWordAutocomplete';
import { getDifficultyLabel } from '../_utils/difficulty';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [whisperSuggestion, setWhisperSuggestion] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getSuggestion, getCompletion, applyCompletion, ready } = useWordAutocomplete();

  const handleSearch = useCallback(async () => {
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
  }, [query, selectedDifficulties, maxPrepTime]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch();
      } else if (query.trim().length === 0) {
        setResults([]);
        setSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // Update whisper suggestion when query changes
  useEffect(() => {
    if (ready && query.length >= 1) {
      const suggestion = getSuggestion(query);
      setWhisperSuggestion(suggestion);
    } else {
      setWhisperSuggestion(null);
    }
  }, [query, getSuggestion, ready]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && whisperSuggestion) {
      e.preventDefault();
      setQuery(applyCompletion(query, whisperSuggestion));
      setWhisperSuggestion(null);
    } else if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const acceptSuggestion = () => {
    if (whisperSuggestion) {
      setQuery(applyCompletion(query, whisperSuggestion));
      setWhisperSuggestion(null);
      inputRef.current?.focus();
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
        <div className="input-wrapper whisper-container">
          {whisperSuggestion && (
            <div className="whisper-ghost">
              <span className="whisper-typed">{query}</span>
              <span className="whisper-completion">{getCompletion(query, whisperSuggestion)}</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="text"
            className="whisper-input"
            placeholder="Zadejte název receptu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {whisperSuggestion && (
            <button
              type="button"
              className="whisper-accept-btn"
              onClick={acceptSuggestion}
              aria-label="Doplnit"
              title="TAB"
            >
              ↵
            </button>
          )}
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
