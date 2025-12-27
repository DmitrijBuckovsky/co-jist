'use client';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Allergen {
  id: number;
  number: number;
  name: string;
}

interface AllergenPreferencesProps {
  onBack: () => void;
}

const STORAGE_KEY = 'userAllergens';

export function AllergenPreferences({ onBack }: AllergenPreferencesProps) {
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllergens();
    loadSavedSelection();
  }, []);

  const loadAllergens = async () => {
    try {
      const response = await fetch('/api/allergens?limit=100');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      const sorted = data.docs.sort((a: Allergen, b: Allergen) => a.number - b.number);
      setAllergens(sorted);
    } catch (err) {
      console.error('Failed to load allergens:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedSelection = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSelected(new Set(JSON.parse(saved)));
      } catch {}
    }
  };

  const toggleAllergen = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const selectedCount = selected.size;

  return (
    <div className="allergen-prefs">
      <header className="allergen-prefs-header">
        <button className="allergen-prefs-back" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h1>Moje alergeny</h1>
      </header>

      <p className="allergen-prefs-description">
        Vyberte alergeny, na které jste citliví. Tyto alergeny budou zvýrazněny u receptů.
      </p>

      {loading ? (
        <div className="allergen-prefs-loading">Načítám...</div>
      ) : (
        <>
          <div className="allergen-prefs-list">
            {allergens.map((allergen) => {
              const isSelected = selected.has(allergen.id);
              return (
                <div
                  key={allergen.id}
                  className={`allergen-prefs-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleAllergen(allergen.id)}
                >
                  <span className="allergen-prefs-number">{allergen.number}</span>
                  <span className="allergen-prefs-name">{allergen.name}</span>
                  <span className={`allergen-prefs-check ${isSelected ? 'checked' : ''}`}>{isSelected ? '✓' : ''}</span>
                </div>
              );
            })}
          </div>

          {selectedCount > 0 && (
            <div className="allergen-prefs-summary">
              Vybráno: {selectedCount} {selectedCount === 1 ? 'alergen' : selectedCount < 5 ? 'alergeny' : 'alergenů'}
            </div>
          )}
        </>
      )}
    </div>
  );
}
