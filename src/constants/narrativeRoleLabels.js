/** Mirrors backend narrativeSlideBlueprints ROLE_LABELS for Blueprint UI. */
export const NARRATIVE_ROLE_LABELS = {
  hero_title: 'Hero / Title',
  agenda_overview: 'Agenda / Overview',
  introduction: 'Introduction',
  context_background: 'Context / Background',
  problem_statement: 'Problem / Context',
  market_overview: 'Market / Industry Overview',
  research_data: 'Research / Data',
  key_insight: 'Key Insight / Insights',
  key_data: 'Key Data / Statistics',
  audience_profile: 'User / Audience Profile',
  pain_points: 'Challenges / Pain Points',
  solution_overview: 'Solution / Main Content',
  strategy_framework: 'Solution / Strategy / Framework',
  process_workflow: 'Process / Workflow',
  feature_breakdown: 'Feature / Component Breakdown',
  comparison_options: 'Comparison / Alternatives',
  implementation_roadmap: 'Implementation / Roadmap',
  results_impact: 'Results / Impact / Metrics',
  case_study: 'Case Study / Example',
  key_takeaways: 'Key Takeaways',
  summary_cta: 'Summary / Conclusion / CTA',
}

const ROLE_GROUPS = {
  open: new Set(['hero_title', 'agenda_overview', 'introduction']),
  story: new Set([
    'context_background',
    'problem_statement',
    'market_overview',
    'audience_profile',
    'pain_points',
  ]),
  evidence: new Set(['research_data', 'key_insight', 'key_data', 'case_study', 'results_impact']),
  solution: new Set([
    'solution_overview',
    'strategy_framework',
    'process_workflow',
    'feature_breakdown',
    'comparison_options',
    'implementation_roadmap',
  ]),
  close: new Set(['key_takeaways', 'summary_cta']),
}

export function narrativeRoleGroup(role) {
  const key = String(role || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
  for (const [group, set] of Object.entries(ROLE_GROUPS)) {
    if (set.has(key)) return group
  }
  return 'story'
}

export function formatNarrativeRole(role) {
  const key = String(role || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
  if (!key) return { key: '', label: '', group: 'story' }
  return {
    key,
    label: NARRATIVE_ROLE_LABELS[key] || key.replace(/_/g, ' '),
    group: narrativeRoleGroup(key),
  }
}
