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

  useEffect(() => {
    // Prevent fetching if no category is provided
    if (!category) {
      setTemplates([]);
      return;
    }

    const fetchTemplates = async () => {
      try {
        const response = await fetch(`/templates/${category.toLowerCase()}.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch templates for category: ${category}`);
        }

        const data = await response.json();
        
        // Data structure requirement: { scenes: [] }
        if (data && Array.isArray(data.scenes)) {
          setTemplates(data.scenes);
        } else {
          setTemplates([]);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        // Requirement: Handle errors gracefully, return empty array
        setTemplates([]);
      }
    };

    fetchTemplates();
  }, [category]);

  return templates;
};

export default useTemplates;
