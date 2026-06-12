import { useState, useEffect } from 'react';

/**
 * useTemplates Hook
 * Fetches template data based on a category from a JSON file.
 * 
 * @param {string} category - The category of templates to fetch (e.g., 'corporate', 'social', 'educational')
 * @returns {Array} An array of template objects (scenes)
 */
const useTemplates = (category) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Prevent fetching if no category is provided
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
        const allFiles = ['marketing', 'educational', 'corporate', 'social', 'personal', 'pitch_template'];
        const categoryFile = cat === 'pitch' ? 'pitch_template' : cat;

        if (cat === 'all') {
          const responses = await Promise.all(allFiles.map(fetchTemplateFile));
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
