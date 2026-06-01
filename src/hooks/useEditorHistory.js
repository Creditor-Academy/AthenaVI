import { useCallback, useRef, useState } from 'react';

const MAX_HISTORY = 40;

function cloneProject(project) {
  return JSON.parse(JSON.stringify(project));
}

/**
 * Project state with undo/redo stacks (snapshot-based).
 */
export function useEditorHistory(initialProject) {
  const [project, setProjectInternal] = useState(initialProject);
  const pastRef = useRef([]);
  const futureRef = useRef([]);
  const skipNextHistoryRef = useRef(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const bumpHistory = () => setHistoryVersion((v) => v + 1);

  const setProject = useCallback((updater, options = {}) => {
    const trackHistory = options.history === true;

    setProjectInternal((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;

      if (trackHistory && !skipNextHistoryRef.current) {
        pastRef.current.push(cloneProject(prev));
        if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift();
        futureRef.current = [];
        bumpHistory();
      }
      skipNextHistoryRef.current = false;

      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (!pastRef.current.length) return false;

    setProjectInternal((current) => {
      futureRef.current.push(cloneProject(current));
      const previous = pastRef.current.pop();
      skipNextHistoryRef.current = true;
      bumpHistory();
      return previous;
    });
    return true;
  }, []);

  const redo = useCallback(() => {
    if (!futureRef.current.length) return false;

    setProjectInternal((current) => {
      pastRef.current.push(cloneProject(current));
      const next = futureRef.current.pop();
      skipNextHistoryRef.current = true;
      bumpHistory();
      return next;
    });
    return true;
  }, []);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  void historyVersion;

  const resetHistory = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
    bumpHistory();
  }, []);

  return {
    project,
    setProject,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  };
}
