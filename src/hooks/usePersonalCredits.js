import { useCallback, useEffect, useState } from 'react';
import creditsService from '../services/creditsService.js';

export function usePersonalCredits({ enabled = true } = {}) {
  const [personalCredits, setPersonalCredits] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!enabled) return null;
    setLoading(true);
    try {
      const data = await creditsService.getPersonalBalance();
      setPersonalCredits(data.personalCredits);
      setError('');
      return data.personalCredits;
    } catch (err) {
      setError(err.message || 'Failed to load credits');
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    personalCredits,
    loading,
    error,
    refresh,
  };
}

export default usePersonalCredits;
