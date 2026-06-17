import { useState, useEffect } from 'react';
import { TEMPLATE_BUNDLE_SOURCES } from '../constants/templateRegistry';

/**
 * Fetches template bundles from JSON (Pitch, Product Launch, Course Module, Sales Demo, Social Short, Podcast).
 */
const useTemplateBundles = (category) => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      setError(null);
      try {
        const { default: fetchTemplateBundles } = await import('../utils/fetchTemplateBundles');
        const allBundles = await fetchTemplateBundles();
        const cat = String(category || 'all').toLowerCase();

        if (cat === 'all') {
          setBundles(allBundles);
        } else {
          const source = TEMPLATE_BUNDLE_SOURCES.find(
            (item) =>
              item.category.toLowerCase() === cat ||
              item.label.toLowerCase() === cat ||
              item.file === cat ||
              item.file.replace('_template', '') === cat.replace(/\s+/g, '_')
          );
          const filtered = source
            ? allBundles.filter((bundle) => bundle.file === source.file)
            : allBundles.filter((bundle) => bundle.category.toLowerCase() === cat);

          if (filtered.length === 0) {
            throw new Error(`Failed to fetch templates for category: ${category}`);
          }
          setBundles(filtered);
        }
      } catch (err) {
        console.error('Error fetching template bundles:', err);
        setError(err.message);
        setBundles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, [category]);

  return { bundles, loading, error };
};

export default useTemplateBundles;
