'use client';
import { Allergen, AllergenBadge } from './AllergenBadge';
import { InfoModal } from './InfoModal';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

// Remove diacritics from string for search comparison
const removeDiacritics = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const STORAGE_KEY_ALLERGENS = 'userAllergens';
const STORAGE_KEY_HIDE = 'hideMyAllergens';

interface Category {
  id: number;
  name: string;
}

interface Ingredient {
  id: number;
  name: string;
  category: Category | number;
  allergens?: Allergen[];
}

interface IngredientSelectorProps {
  selectedDifficulties?: string[];
  maxPrepTime?: number | null;
}

export function IngredientSelector({ selectedDifficulties = [], maxPrepTime = null }: IngredientSelectorProps) {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSelected, setShowSelected] = useState(false);
  const [viewMode, setViewMode] = useState<'alphabetical' | 'grouped'>('alphabetical');
  const [hideMyAllergens, setHideMyAllergens] = useState(false);
  const [userAllergenIds, setUserAllergenIds] = useState<Set<number>>(new Set());
  const hasFetchedRef = useRef(false);

  // Load from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    try {
      const savedSelected = localStorage.getItem('selectedIngredients');
      if (savedSelected) setSelected(new Set(JSON.parse(savedSelected)));
    } catch {}
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
    // Prevent double fetch from StrictMode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients?depth=2&limit=1000');
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const sorted = data.docs.sort((a: Ingredient, b: Ingredient) => a.name.localeCompare(b.name));

      setIngredients(sorted);
    } catch (err) {
      setError('Nepodařilo se načíst ingredience');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = ingredients;

    if (showSelected) {
      result = result.filter((i) => selected.has(i.id));
    }

    if (search) {
      const query = removeDiacritics(search.toLowerCase());
      result = result.filter((i) => removeDiacritics(i.name.toLowerCase()).includes(query));
    }

    if (hideMyAllergens && userAllergenIds.size > 0) {
      result = result.filter((i) => {
        if (!i.allergens || i.allergens.length === 0) return true;
        return !i.allergens.some((a) => userAllergenIds.has(a.id));
      });
    }

    return result;
  }, [ingredients, search, selected, showSelected, hideMyAllergens, userAllergenIds]);

  const grouped = useMemo(() => {
    const groups: Record<string, Ingredient[]> = {};

    if (viewMode === 'grouped') {
      for (const ing of filtered) {
        const categoryName = typeof ing.category === 'object' ? ing.category.name : 'Other';
        if (!groups[categoryName]) {
          groups[categoryName] = [];
        }
        groups[categoryName].push(ing);
      }
    } else {
      for (const ing of filtered) {
        const letter = ing.name.charAt(0).toUpperCase();
        if (!groups[letter]) {
          groups[letter] = [];
        }
        groups[letter].push(ing);
      }
    }

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, viewMode]);

  const toggleIngredient = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem('selectedIngredients', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const clearAll = () => {
    setSelected(new Set());
    localStorage.removeItem('selectedIngredients');
  };

  const findRecipes = async () => {
    if (selected.size === 0) return;

    setSearching(true);
    setError(null);

    try {
      const ingredientIdsToSend = Array.from(selected);

      const requestBody: {
        ingredientIds: number[];
        difficulty?: string[];
        maxPrepTime?: number;
        excludeAllergenIds?: number[];
      } = {
        ingredientIds: ingredientIdsToSend,
      };
      if (selectedDifficulties.length > 0) {
        requestBody.difficulty = selectedDifficulties;
      }
      if (maxPrepTime !== null) {
        requestBody.maxPrepTime = maxPrepTime;
      }
      if (hideMyAllergens && userAllergenIds.size > 0) {
        requestBody.excludeAllergenIds = Array.from(userAllergenIds);
      }

      const response = await fetch('/api/recipes/match-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Search failed');

      const result = await response.json();
      // Store search params for pagination in results page (use filtered IDs for search)
      localStorage.setItem(
        'recipeSearchParams',
        JSON.stringify({
          ingredientIds: ingredientIdsToSend,
          difficulty: selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
          maxPrepTime: maxPrepTime ?? undefined,
          excludeAllergenIds: hideMyAllergens && userAllergenIds.size > 0 ? Array.from(userAllergenIds) : undefined,
        }),
      );
      localStorage.setItem('recipeMatches', JSON.stringify(result.data));
      // Keep original selection (not filtered) so user doesn't lose their choices
      router.push('/results');
    } catch (err) {
      setError('Nepodařilo se najít recepty. Zkuste znovu.');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="selector-page">
        <div className="page-loading">
          <p>Načítání...</p>
        </div>
      </div>
    );
  }

  const renderIngredient = (ing: Ingredient) => (
    <div
      key={ing.id}
      onClick={() => toggleIngredient(ing.id)}
      className={`selector-item ${selected.has(ing.id) ? 'selected' : ''}`}
    >
      <span className="selector-name">
        {ing.name}
        {ing.allergens && ing.allergens.length > 0 && <AllergenBadge allergens={ing.allergens} />}
      </span>
    </div>
  );

  return (
    <div className="selector-page">
      <header className="selector-header">
        <div className="page-title-row">
          <h1>Co máš v kuchyni?</h1>
          <InfoModal>
            <p>Vyberte ingredience, které máte doma.</p>
            <p>Aplikace najde recepty, které z nich můžete uvařit.</p>
            <p>Čím více ingrediencí vyberete, tím přesnější budou výsledky.</p>
          </InfoModal>
        </div>
      </header>

      {error && <div className="selector-error">{error}</div>}

      <div className="selector-controls">
        <input
          type="text"
          placeholder="Hledat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="selector-search"
        />
        <div className="selector-view-toggle">
          <button
            className={`selector-view-btn ${viewMode === 'alphabetical' ? 'active' : ''}`}
            onClick={() => setViewMode('alphabetical')}
          >
            A-Z
          </button>
          <button
            className={`selector-view-btn ${viewMode === 'grouped' ? 'active' : ''}`}
            onClick={() => setViewMode('grouped')}
          >
            Skupiny
          </button>
        </div>
        {userAllergenIds.size > 0 && (
          <label className="selector-toggle">
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
        <label className="selector-toggle">
          <input type="checkbox" checked={showSelected} onChange={(e) => setShowSelected(e.target.checked)} />
          Vybráno ({selected.size})
        </label>
        <button
          onClick={clearAll}
          className="selector-clear-btn"
          style={{ visibility: selected.size > 0 ? 'visible' : 'hidden' }}
        >
          Resetovat
        </button>
      </div>

      <div className="selector-list">
        {filtered.length === 0 ? (
          <div className="selector-empty">{search ? 'Nic nenalezeno' : 'Žádné ingredience'}</div>
        ) : (
          <div className="selector-groups">
            {grouped.map(([groupName, items]) => (
              <div key={groupName} className="selector-group">
                <h3 className="selector-group-title">{groupName}</h3>
                <div className="selector-items">{items.map(renderIngredient)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="selector-footer">
        <button onClick={findRecipes} disabled={searching || selected.size === 0} className="selector-submit">
          {searching ? 'Hledám...' : `Najít recepty (${selected.size})`}
        </button>
      </div>
    </div>
  );
}
