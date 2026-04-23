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

    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const cat = category.toLowerCase();
        
        if (cat === 'all') {
          const files = ['marketing', 'educational', 'corporate', 'social', 'personal'];
          const responses = await Promise.all(
            files.map(file => 
              fetch(`/templates/${file}.json`)
                .then(res => res.ok ? res.json() : { scenes: [] })
                .catch(() => ({ scenes: [] }))
            )
          );
          
          // Merge all scenes into a single flattened array
          const allScenes = responses.flatMap(data => data.scenes || []);
          setTemplates(allScenes);
        } else {
          const response = await fetch(`/templates/${cat}.json`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch templates for category: ${category}`);
          }

          const data = await response.json();
          setTemplates(data.scenes || []);
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
