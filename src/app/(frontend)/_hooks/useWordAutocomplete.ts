'use client';

import { applySuggestion, AutocompleteWord, findWhisperSuggestion, getCompletionText } from '../_utils/autocomplete';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseWordAutocompleteResult {
  getSuggestion: (input: string) => string | null;
  getCompletion: (input: string, suggestion: string) => string;
  applyCompletion: (input: string, suggestion: string) => string;
  loading: boolean;
  ready: boolean;
}

export function useWordAutocomplete(): UseWordAutocompleteResult {
  const [words, setWords] = useState<AutocompleteWord[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch('/api/recipes/autocomplete-words')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setWords(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getSuggestion = useCallback((input: string) => findWhisperSuggestion(input, words), [words]);

  const getCompletion = useCallback((input: string, suggestion: string) => getCompletionText(input, suggestion), []);

  const applyCompletion = useCallback((input: string, suggestion: string) => applySuggestion(input, suggestion), []);

  return {
    getSuggestion,
    getCompletion,
    applyCompletion,
    loading,
    ready: words.length > 0,
  };
}
