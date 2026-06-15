import { useState, useEffect } from 'react';

const BUNDLE_FILES = ['pitch_template', 'product_launch_template', 'course_module_template', 'sales_demo_template', 'social_short_template'];

const CATEGORY_FILE_MAP = {
  pitch: 'pitch_template',
  'product launch': 'product_launch_template',
  product_launch: 'product_launch_template',
  'course module': 'course_module_template',
  course_module: 'course_module_template',
  'sales demo': 'sales_demo_template',
  sales_demo: 'sales_demo_template',
  'social short': 'social_short_template',
  social_short: 'social_short_template',
};

/**
 * useTemplates Hook
 * Fetches template bundle scenes from JSON (Pitch, Product Launch, Course Module, Sales Demo, Social Short).
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
          const responses = await Promise.all(BUNDLE_FILES.map(fetchTemplateFile));
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
