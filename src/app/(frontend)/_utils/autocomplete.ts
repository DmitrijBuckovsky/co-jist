import { normalizeText } from '@/core/utils/normalize-text';

export interface AutocompleteWord {
  word: string;
  wordSearch: string;
}

/**
 * Finds the best whisper suggestion for the current input.
 * Matches the last word being typed against available words.
 * Returns the full word to complete to, or null if no match.
 */
export function findWhisperSuggestion(input: string, words: AutocompleteWord[]): string | null {
  if (!input || input.length < 1) return null;

  // Get the last word being typed (after the last space)
  const lastSpaceIndex = input.lastIndexOf(' ');
  const currentWord = lastSpaceIndex >= 0 ? input.slice(lastSpaceIndex + 1) : input;

  if (!currentWord || currentWord.length < 1) return null;

  const normalizedInput = normalizeText(currentWord);
  if (!normalizedInput) return null;

  // Find prefix matches, prefer shorter words (more specific)
  const prefixMatches = words
    .filter((w) => w.wordSearch.startsWith(normalizedInput))
    .sort((a, b) => a.word.length - b.word.length);

  if (prefixMatches.length > 0) {
    return prefixMatches[0].word;
  }

  return null;
}

/**
 * Given user input and a suggestion, returns the completion text
 * (the part that should appear as ghost text after the cursor)
 */
export function getCompletionText(input: string, suggestion: string): string {
  const lastSpaceIndex = input.lastIndexOf(' ');
  const currentWord = lastSpaceIndex >= 0 ? input.slice(lastSpaceIndex + 1) : input;

  // Normalize both for comparison (handles diacritics: "kur" matches "kuře")
  const normalizedInput = normalizeText(currentWord);
  const normalizedSuggestion = normalizeText(suggestion);

  if (normalizedSuggestion.startsWith(normalizedInput)) {
    // Find the corresponding position in the original suggestion
    // by matching normalized character by character
    let suggestionIndex = 0;
    let normalizedIndex = 0;

    while (normalizedIndex < normalizedInput.length && suggestionIndex < suggestion.length) {
      const normalizedChar = normalizeText(suggestion[suggestionIndex]);
      if (normalizedChar) {
        normalizedIndex++;
      }
      suggestionIndex++;
    }

    return suggestion.slice(suggestionIndex);
  }

  return suggestion;
}

/**
 * Applies the suggestion to the input, replacing the current word
 */
export function applySuggestion(input: string, suggestion: string): string {
  const lastSpaceIndex = input.lastIndexOf(' ');

  if (lastSpaceIndex >= 0) {
    return input.slice(0, lastSpaceIndex + 1) + suggestion;
  }

  return suggestion;
}
