import { useCallback, useEffect, useState } from 'react';
import storageService from '../services/storageService.js';
import { STORAGE_REFRESH_EVENT } from '../utils/storageQuota.js';

export function useStorageQuota() {
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await storageService.getPersonalQuota();
      setQuota(data);
    } catch (err) {
      setError(err.message || 'Failed to load storage');
      setQuota(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onRefresh = () => refresh();
    window.addEventListener(STORAGE_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(STORAGE_REFRESH_EVENT, onRefresh);
  }, [refresh]);

  return { quota, loading, error, refresh };
}

export function useWorkspaceStorage(workspaceId) {
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!workspaceId) {
      setStorage(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await storageService.getWorkspaceStorage(workspaceId);
      setStorage(data);
    } catch (err) {
      setError(err.message || 'Failed to load workspace storage');
      setStorage(null);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onRefresh = () => refresh();
    window.addEventListener(STORAGE_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(STORAGE_REFRESH_EVENT, onRefresh);
  }, [refresh]);

  return { storage, loading, error, refresh };
}

export default useStorageQuota;
