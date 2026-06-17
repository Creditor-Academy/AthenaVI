import { useState, useEffect } from 'react';
import { TEMPLATE_BUNDLE_FILES, CATEGORY_FILE_MAP } from '../constants/templateRegistry';

/**
 * @deprecated Prefer useTemplateBundles for grouped template UX.
 * Fetches flat scene lists from template JSON bundles.
 */
const useTemplates = (category) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!category) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    const fetchTemplateFile = async (file) => {
      try {
        const response = await fetch(`/templates/${file}.json`);
        if (!response.ok) return { scenes: [] };
        const data = await response.json();
        return { scenes: data.scenes || [] };
      } catch {
        return { scenes: [] };
      }
    };

    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const cat = category.toLowerCase();
        const categoryFile = CATEGORY_FILE_MAP[cat] || cat;

        if (cat === 'all') {
          const responses = await Promise.all(TEMPLATE_BUNDLE_FILES.map(fetchTemplateFile));
          const allScenes = responses.flatMap((data) => data.scenes || []);
          setTemplates(allScenes);
        } else {
          const response = await fetchTemplateFile(categoryFile);
          const scenes = response.scenes || [];

          if (scenes.length === 0) {
            throw new Error(`Failed to fetch templates for category: ${category}`);
          }

          setTemplates(scenes);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError(err.message);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [category]);

  return { templates, loading, error };
};

export default useTemplates;
