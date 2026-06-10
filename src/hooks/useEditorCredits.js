import { useCallback, useEffect, useState } from 'react';
import creditsService from '../services/creditsService.js';
import { isTeamWorkspaceType } from '../utils/creditTransactions.js';

export function useEditorCredits(workspaceId, refreshKey = 0) {
  const [personalCredits, setPersonalCredits] = useState(null);
  const [workspaceCredits, setWorkspaceCredits] = useState(null);
  const [workspaceType, setWorkspaceType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!workspaceId) {
      setPersonalCredits(null);
      setWorkspaceCredits(null);
      setWorkspaceType('');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await creditsService.getWorkspaceBalance(workspaceId);
      setPersonalCredits(Number(data.personalCredits ?? 0));
      setWorkspaceCredits(Number(data.workspaceCredits ?? 0));
      setWorkspaceType(data.workspaceType || '');
    } catch (err) {
      setError(err.message || 'Failed to load credits');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  useEffect(() => {
    const onRefresh = () => refresh();
    window.addEventListener('editor-credits-refresh', onRefresh);
    return () => window.removeEventListener('editor-credits-refresh', onRefresh);
  }, [refresh]);

  const isTeamWorkspace = isTeamWorkspaceType(workspaceType);
  const editorPoolCredits = isTeamWorkspace ? Number(workspaceCredits ?? 0) : Number(personalCredits ?? 0);
  const totalCredits = Number(personalCredits ?? 0) + Number(workspaceCredits ?? 0);

  return {
    personalCredits,
    workspaceCredits,
    workspaceType,
    isTeamWorkspace,
    editorPoolCredits,
    totalCredits,
    loading,
    error,
    refresh,
  };
}

export default useEditorCredits;
