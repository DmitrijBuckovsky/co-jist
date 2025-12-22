'use client';

import { useDocumentInfo, useField } from '@payloadcms/ui';
import React, { useCallback, useEffect, useState } from 'react';

interface IngredientOption {
  id: number;
  name: string;
}

interface IngredientRow {
  _localId: string;
  id?: number;
  ingredient: number | null;
  amount: string;
  is_main: boolean;
  _delete?: boolean;
}

interface SearchableSelectProps {
  value: number | null;
  options: IngredientOption[];
  onChange: (value: number) => void;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ value, options, onChange, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);
  const filteredOptions = options.filter((opt) => opt.name.toLowerCase().includes(search.toLowerCase()));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 2 }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-input-bg)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: selectedOption ? 'inherit' : '#999' }}>{selectedOption?.name || placeholder}</span>
        <span style={{ fontSize: '10px' }}>{isOpen ? '\u25B2' : '\u25BC'}</span>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            marginTop: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            autoFocus
            style={{
              width: '100%',
              padding: '8px',
              border: 'none',
              borderBottom: '1px solid var(--theme-elevation-150)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '8px', color: '#999' }}>No results</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    background: opt.id === value ? 'var(--theme-elevation-100)' : 'transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--theme-elevation-50)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = opt.id === value ? 'var(--theme-elevation-100)' : 'transparent')
                  }
                >
                  {opt.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const IngredientsEditor: React.FC = () => {
  const { id: recipeId } = useDocumentInfo();
  const { setValue } = useField<IngredientRow[]>({ path: 'ingredients_data' });

  const [rows, setRows] = useState<IngredientRow[]>([]);
  const [ingredientOptions, setIngredientOptions] = useState<IngredientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Fetch all available ingredients for the selector
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch('/api/ingredients?limit=1000&depth=0&sort=name');
        const data = await response.json();
        const sorted = data.docs
          .map((i: { id: number; name: string }) => ({ id: i.id, name: i.name }))
          .sort((a: IngredientOption, b: IngredientOption) => a.name.localeCompare(b.name, 'cs'));
        setIngredientOptions(sorted);
      } catch (error) {
        console.error('Failed to fetch ingredients:', error);
      }
    };
    fetchIngredients();
  }, []);

  // Load existing recipe ingredients (only for existing recipes)
  useEffect(() => {
    if (initialized) return;

    const loadExistingIngredients = async () => {
      if (recipeId) {
        try {
          const response = await fetch(`/api/recipe-ingredients?where[recipe][equals]=${recipeId}&depth=1`);
          const data = await response.json();
          const existingRows: IngredientRow[] = data.docs.map(
            (ri: { id: number; ingredient: { id: number } | number; amount: string; is_main?: boolean }) => ({
              _localId: `existing-${ri.id}`,
              id: ri.id,
              ingredient: typeof ri.ingredient === 'object' ? ri.ingredient.id : ri.ingredient,
              amount: ri.amount,
              is_main: ri.is_main || false,
            }),
          );
          setRows(existingRows);
          // Don't call setValue here - it marks the form as dirty
          // We only sync to form when user makes actual changes
        } catch (error) {
          console.error('Failed to fetch existing ingredients:', error);
        }
      }
      setLoading(false);
      setInitialized(true);
    };

    loadExistingIngredients();
  }, [recipeId, initialized]);

  // Sync local rows to form field whenever rows change
  const syncToForm = useCallback(
    (updatedRows: IngredientRow[]) => {
      setRows(updatedRows);
      setValue(updatedRows);
    },
    [setValue],
  );

  const addRow = () => {
    const newRow: IngredientRow = {
      _localId: `new-${Date.now()}`,
      ingredient: null,
      amount: '',
      is_main: false,
    };
    syncToForm([...rows, newRow]);
  };

  const updateRow = (localId: string, field: keyof IngredientRow, value: unknown) => {
    const updated = rows.map((row) => (row._localId === localId ? { ...row, [field]: value } : row));
    syncToForm(updated);
  };

  const removeRow = (localId: string) => {
    const row = rows.find((r) => r._localId === localId);
    if (row?.id) {
      // Mark existing row for deletion
      const updated = rows.map((r) => (r._localId === localId ? { ...r, _delete: true } : r));
      syncToForm(updated);
    } else {
      // Remove new row entirely
      syncToForm(rows.filter((r) => r._localId !== localId));
    }
  };

  if (loading) return <div>Loading ingredients...</div>;

  const visibleRows = rows.filter((r) => !r._delete);

  return (
    <div style={{ marginBottom: '24px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: 500,
        }}
      >
        Recipe Ingredients
      </label>

      {visibleRows.length === 0 ? (
        <p style={{ color: '#666', marginBottom: '12px' }}>No ingredients added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {visibleRows.map((row) => (
            <div
              key={row._localId}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                padding: '8px',
                background: 'var(--theme-elevation-50)',
                borderRadius: '4px',
              }}
            >
              <SearchableSelect
                value={row.ingredient}
                options={ingredientOptions}
                onChange={(value) => updateRow(row._localId, 'ingredient', value)}
                placeholder="Select ingredient..."
              />

              <input
                type="text"
                placeholder="Amount (e.g., 2 cups)"
                value={row.amount}
                onChange={(e) => updateRow(row._localId, 'amount', e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--theme-elevation-150)' }}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                <input
                  type="checkbox"
                  checked={row.is_main}
                  onChange={(e) => updateRow(row._localId, 'is_main', e.target.checked)}
                />
                Main
              </label>

              <button
                type="button"
                onClick={() => removeRow(row._localId)}
                style={{
                  padding: '6px 12px',
                  background: 'var(--theme-error-500)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addRow}
        style={{
          padding: '8px 16px',
          background: 'var(--theme-elevation-100)',
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        + Add Ingredient
      </button>
    </div>
  );
};

export default IngredientsEditor;
