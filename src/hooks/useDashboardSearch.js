import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildDefaultSuggestions,
  buildStaticSearchIndex,
  flattenGroupedResults,
  matchSearchResults,
  SEARCH_CATEGORIES,
} from '../utils/dashboardSearchIndex';
import { fetchDynamicSearchIndex } from '../utils/dashboardSearchFetch';

const INDEX_TTL_MS = 5 * 60 * 1000;
const DEBOUNCE_MS = 250;

export function useDashboardSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexError, setIndexError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [indexVersion, setIndexVersion] = useState(0);

  const indexRef = useRef([]);
  const indexBuiltAtRef = useRef(0);
  const buildPromiseRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const ensureIndex = useCallback(async () => {
    const now = Date.now();
    if (
      indexRef.current.length > 0 &&
      now - indexBuiltAtRef.current < INDEX_TTL_MS
    ) {
      return indexRef.current;
    }

    if (buildPromiseRef.current) {
      return buildPromiseRef.current;
    }

    setIsIndexing(true);
    setIndexError(null);

    buildPromiseRef.current = (async () => {
      try {
        const staticIndex = buildStaticSearchIndex();
        const dynamicIndex = await fetchDynamicSearchIndex();
        const merged = [...staticIndex, ...dynamicIndex];
        indexRef.current = merged;
        indexBuiltAtRef.current = Date.now();
        setIndexVersion((v) => v + 1);
        return merged;
      } catch (err) {
        console.error('Dashboard search index failed:', err);
        setIndexError('Some results may be unavailable.');
        const fallback = buildStaticSearchIndex();
        indexRef.current = fallback;
        indexBuiltAtRef.current = Date.now();
        setIndexVersion((v) => v + 1);
        return fallback;
      } finally {
        setIsIndexing(false);
        buildPromiseRef.current = null;
      }
    })();

    return buildPromiseRef.current;
  }, []);

  const handleFocus = useCallback(() => {
    setIsOpen(true);
    ensureIndex();
  }, [ensureIndex]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    ensureIndex();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [ensureIndex]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(0);
  }, []);

  const staticSuggestions = useMemo(() => buildDefaultSuggestions(buildStaticSearchIndex()), []);

  const resultsByCategory = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) return {};
    return matchSearchResults(indexRef.current, q, { maxPerCategory: 5 });
  }, [debouncedQuery, indexVersion]);

  const flatResults = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) return staticSuggestions;
    return flattenGroupedResults(resultsByCategory);
  }, [debouncedQuery, resultsByCategory, staticSuggestions]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, isOpen]);

  const moveActive = useCallback(
    (delta) => {
      if (!flatResults.length) return;
      setActiveIndex((prev) => {
        const next = prev + delta;
        if (next < 0) return flatResults.length - 1;
        if (next >= flatResults.length) return 0;
        return next;
      });
    },
    [flatResults.length]
  );

  const getActiveResult = useCallback(() => {
    if (!flatResults.length) return null;
    return flatResults[activeIndex] || flatResults[0];
  }, [flatResults, activeIndex]);

  const categoryLabels = useMemo(
    () => Object.fromEntries(SEARCH_CATEGORIES.map((c) => [c.id, c.label])),
    []
  );

  return {
    query,
    setQuery,
    debouncedQuery,
    isOpen,
    setIsOpen,
    isIndexing,
    indexError,
    activeIndex,
    setActiveIndex,
    inputRef,
    resultsByCategory,
    flatResults,
    categoryLabels,
    staticSuggestions,
    ensureIndex,
    handleFocus,
    handleOpen,
    handleClose,
    moveActive,
    getActiveResult,
  };
}

export default useDashboardSearch;
