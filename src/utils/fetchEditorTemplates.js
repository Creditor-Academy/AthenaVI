const TEMPLATE_SOURCES = [
  { file: 'pitch_template', category: 'Pitch' },
  { file: 'product_launch_template', category: 'Product Launch' },
  { file: 'course_module_template', category: 'Course Module' },
  { file: 'sales_demo_template', category: 'Sales Demo' },
  { file: 'social_short_template', category: 'Social Short' },
];

export async function fetchEditorTemplateScenes() {
  const results = [];
  for (const { file, category } of TEMPLATE_SOURCES) {
    try {
      const res = await fetch(`/templates/${file}.json`);
      if (!res.ok) continue;
      const data = await res.json();
      (data.scenes || []).forEach((scene) => {
        results.push({
          ...scene,
          category,
          bundleFile: file,
        });
      });
    } catch {
      /* skip missing bundle */
    }
  }
  return results;
}

export default fetchEditorTemplateScenes;
