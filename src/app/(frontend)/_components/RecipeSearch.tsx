'use client';
import { useWordAutocomplete } from '../_hooks/useWordAutocomplete';
import { getDifficultyLabel } from '../_utils/difficulty';
import { InfoModal } from './InfoModal';
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

const STORAGE_KEY_ALLERGENS = 'userAllergens';
const STORAGE_KEY_HIDE = 'hideMyAllergens';

export function RecipeSearch({ selectedDifficulties = [], maxPrepTime = null }: RecipeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RecipeSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [whisperSuggestion, setWhisperSuggestion] = useState<string | null>(null);
  const [hideMyAllergens, setHideMyAllergens] = useState(false);
  const [userAllergenIds, setUserAllergenIds] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const { getSuggestion, getCompletion, applyCompletion, ready } = useWordAutocomplete();

  // Use refs to read allergen values in callback without adding to dependencies
  const hideMyAllergensRef = useRef(hideMyAllergens);
  const userAllergenIdsRef = useRef(userAllergenIds);

  // Load from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    try {
      const savedHide = localStorage.getItem(STORAGE_KEY_HIDE);
      if (savedHide) setHideMyAllergens(JSON.parse(savedHide));
    } catch {}
    try {
      const savedAllergens = localStorage.getItem(STORAGE_KEY_ALLERGENS);
      if (savedAllergens) setUserAllergenIds(new Set(JSON.parse(savedAllergens)));
    } catch {}
  }, []);

  useEffect(() => {
    hideMyAllergensRef.current = hideMyAllergens;
    userAllergenIdsRef.current = userAllergenIds;
  }, [hideMyAllergens, userAllergenIds]);

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) return;

    setSearching(true);
    setSearched(true);

    try {
      const requestBody: {
        query: string;
        limit: number;
        difficulty?: string[];
        maxPrepTime?: number;
        excludeAllergenIds?: number[];
      } = {
        query: query.trim(),
        limit: 20,
      };
      if (selectedDifficulties.length > 0) {
        requestBody.difficulty = selectedDifficulties;
      }
      if (maxPrepTime !== null) {
        requestBody.maxPrepTime = maxPrepTime;
      }
      if (hideMyAllergensRef.current && userAllergenIdsRef.current.size > 0) {
        requestBody.excludeAllergenIds = Array.from(userAllergenIdsRef.current);
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
      <div className="page-title-row">
        <h2>Hledat recepty</h2>
        <InfoModal>
          <p>Hledejte recepty podle názvu.</p>
          <p>Začněte psát a uvidíte návrhy.</p>
          <p>Můžete filtrovat podle obtížnosti a maximálního času přípravy.</p>
        </InfoModal>
      </div>

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

      {userAllergenIds.size > 0 && (
        <label className="selector-toggle" style={{ marginTop: '8px' }}>
          <input
            type="checkbox"
            checked={hideMyAllergens}
            onChange={(e) => {
              setHideMyAllergens(e.target.checked);
              localStorage.setItem('hideMyAllergens', JSON.stringify(e.target.checked));
            }}
          />
          Skrýt moje alergeny
        </label>
      )}

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
