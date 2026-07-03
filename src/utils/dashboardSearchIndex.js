import { mainDashboardSidebarGroups } from '../constants/dashboardNav.jsx';
import { helpCategories, helpArticles } from '../pages/UserHelp/helpContent.js';

/** @typedef {'pages'|'videos'|'workspaces'|'avatars'|'voices'|'library'|'templates'|'help'|'settings'} SearchCategory */

export const SEARCH_CATEGORIES = [
  { id: 'pages', label: 'Pages' },
  { id: 'videos', label: 'Videos' },
  { id: 'workspaces', label: 'Workspaces' },
  { id: 'avatars', label: 'Avatars' },
  { id: 'voices', label: 'Voices' },
  { id: 'library', label: 'Library' },
  { id: 'templates', label: 'Templates' },
  { id: 'help', label: 'Help' },
  { id: 'settings', label: 'Settings' },
];

const EXTRA_PAGES = [
  { id: 'templates', label: 'Templates', keywords: ['template', 'bundles', 'scenes'] },
  { id: 'brandkits', label: 'Brand Kits', keywords: ['brand', 'colors', 'fonts'] },
  { id: 'profile', label: 'Profile', keywords: ['account', 'user'] },
  { id: 'help', label: 'Help & Support', keywords: ['support', 'guide', 'faq'] },
  { id: 'credits', label: 'Credits & Billing', keywords: ['billing', 'credits', 'storage'] },
];

const SETTINGS_TABS = [
  { id: 'preferences', label: 'Appearance', keywords: ['theme', 'dark', 'light', 'appearance'] },
  { id: 'notifications', label: 'Notifications', keywords: ['email', 'alerts'] },
  { id: 'security', label: 'Security', keywords: ['password', '2fa', 'login'] },
  { id: 'billing', label: 'Billing', keywords: ['credits', 'storage', 'payment', 'invoice'] },
];

const POPULAR_HELP_TITLES = [
  'Create your first video project',
  'Navigate the dashboard',
  'Export a final MP4',
  'Storage quota and footprint',
];

/**
 * @param {object} params
 * @returns {import('./dashboardSearchNavigate.js').DashboardSearchResult}
 */
export function createSearchResult({
  id,
  category,
  title,
  location,
  keywords = [],
  action,
}) {
  return {
    id,
    category,
    title: String(title || '').trim() || 'Untitled',
    location: String(location || '').trim() || 'Dashboard',
    keywords: keywords.filter(Boolean).map((k) => String(k).toLowerCase()),
    action,
  };
}

export function buildStaticSearchIndex() {
  const results = [];

  for (const group of mainDashboardSidebarGroups) {
    for (const item of group.items || []) {
      results.push(
        createSearchResult({
          id: `page-${item.id}`,
          category: 'pages',
          title: item.label,
          location: group.label ? `Dashboard · ${group.label}` : 'Dashboard',
          keywords: [item.label, group.label, item.id].filter(Boolean),
          action: { type: 'navigate', section: item.id },
        })
      );
    }
  }

  for (const page of EXTRA_PAGES) {
    results.push(
      createSearchResult({
        id: `page-${page.id}`,
        category: 'pages',
        title: page.label,
        location: 'Dashboard',
        keywords: [page.label, ...(page.keywords || [])],
        action: { type: 'navigate', section: page.id },
      })
    );
  }

  for (const tab of SETTINGS_TABS) {
    results.push(
      createSearchResult({
        id: `settings-${tab.id}`,
        category: 'settings',
        title: tab.label,
        location: 'Settings',
        keywords: [tab.label, ...(tab.keywords || [])],
        action: { type: 'openSettings', tab: tab.id },
      })
    );
  }

  const categoryById = Object.fromEntries(helpCategories.map((c) => [c.id, c.label]));

  for (const [categoryId, articles] of Object.entries(helpArticles)) {
    if (categoryId === 'contact') continue;
    for (const article of articles) {
      results.push(
        createSearchResult({
          id: `help-${categoryId}-${article.title}`,
          category: 'help',
          title: article.title,
          location: `Help · ${categoryById[categoryId] || categoryId}`,
          keywords: [article.title, article.tag, categoryById[categoryId], article.body?.slice(0, 200)],
          action: {
            type: 'openHelpArticle',
            categoryId,
            articleTitle: article.title,
          },
        })
      );
    }
  }

  return results;
}

export function buildDefaultSuggestions(staticIndex = []) {
  const pages = staticIndex.filter((r) => r.category === 'pages');
  const home = pages.find((p) => p.action?.section === 'home');
  const workspace = pages.find((p) => p.action?.section === 'workspace');
  const videos = pages.find((p) => p.action?.section === 'videos');
  const help = pages.find((p) => p.action?.section === 'help');

  const popularHelp = staticIndex.filter(
    (r) => r.category === 'help' && POPULAR_HELP_TITLES.includes(r.title)
  );

  const seen = new Set();
  const ordered = [home, workspace, videos, help, ...popularHelp].filter(Boolean);
  return ordered.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

function scoreField(text, query) {
  const hay = String(text || '').toLowerCase();
  const q = query.toLowerCase();
  if (!q) return 0;
  if (hay === q) return 100;
  if (hay.startsWith(q)) return 80;
  if (hay.includes(q)) return 60;
  const words = q.split(/\s+/).filter(Boolean);
  if (words.every((w) => hay.includes(w))) return 40;
  return 0;
}

function scoreResult(result, query) {
  const titleScore = scoreField(result.title, query) * 2;
  const locationScore = scoreField(result.location, query);
  const keywordScore = Math.max(0, ...(result.keywords || []).map((k) => scoreField(k, query)));
  return titleScore + locationScore + keywordScore;
}

/**
 * @param {import('./dashboardSearchNavigate.js').DashboardSearchResult[]} index
 * @param {string} query
 * @param {{ maxPerCategory?: number }} [options]
 */
export function matchSearchResults(index, query, { maxPerCategory = 5 } = {}) {
  const q = query.trim();
  if (!q) return [];

  const byCategory = {};
  for (const result of index) {
    const score = scoreResult(result, q);
    if (score <= 0) continue;
    if (!byCategory[result.category]) byCategory[result.category] = [];
    byCategory[result.category].push({ ...result, score });
  }

  const grouped = {};
  for (const cat of SEARCH_CATEGORIES) {
    const hits = (byCategory[cat.id] || [])
      .sort((a, b) => b.score - a.score)
      .slice(0, maxPerCategory)
      .map(({ score, ...rest }) => rest);
    if (hits.length) grouped[cat.id] = hits;
  }
  return grouped;
}

export function flattenGroupedResults(grouped) {
  const flat = [];
  for (const cat of SEARCH_CATEGORIES) {
    for (const item of grouped[cat.id] || []) {
      flat.push(item);
    }
  }
  return flat;
}
