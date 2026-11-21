/**
 * Real URLs for the public header and footer. Trailing slashes match the URL the server
 * answers with 200, so a click does not pass through the /page → /page/ redirect.
 * Placeholder pages (/technology, /about-us, /news, /resources) are intentionally absent.
 */

export const HREF = {
  home: '/',
  products: '/products/',
  visualAiAgents: '/products/#visual-ai-agents',
  creativeReality: '/products/#creative-reality-studio',
  videoTranslate: '/products/#video-translate',
  videoCampaigns: '/products/#video-campaigns',
  personalAvatars: '/products/#personal-avatars',
  aiAvatars: '/ai-avatars-videos/',
  marketing: '/marketing-suite/',
  sales: '/sales-suite/',
  customerExperience: '/customer-experience/',
  learning: '/learning-development/',
  aiVideos: '/ai-videos/',
  useCases: '/use-cases/',
  ethics: '/ethics/',
  help: '/help/',
  privacy: '/privacy/',
  login: '/login/',
  signup: '/signup/',
  athenaLms: 'https://lmsathena.com',
}

const PRODUCT_HREFS = {
  'Visual AI Agents': HREF.visualAiAgents,
  'Creative Reality™ Studio': HREF.creativeReality,
  'Video Translate': HREF.videoTranslate,
  'Video Campaigns': HREF.videoCampaigns,
  'Personal Avatars': HREF.personalAvatars,
  'AI Avatars & Videos': HREF.aiAvatars,
}

const SOLUTION_HREFS = {
  'Marketing Suite': HREF.marketing,
  'Sales Solutions': HREF.sales,
  'Customer Experience': HREF.customerExperience,
  'Learning & Development': HREF.learning,
  'AI Videos': HREF.aiVideos,
}

const COMPANY_HREFS = {
  Ethics: HREF.ethics,
  'Privacy Policy': HREF.privacy,
  'Help Center': HREF.help,
}

export function hrefForProduct(title) {
  return PRODUCT_HREFS[title] || HREF.products
}

export function hrefForSolution(title) {
  return SOLUTION_HREFS[title] || HREF.useCases
}

export function hrefForCompany(title) {
  return COMPANY_HREFS[title] || HREF.home
}

/** A normal left click. Modified clicks keep the browser's new-tab / new-window behaviour. */
export function isPlainLeftClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}
