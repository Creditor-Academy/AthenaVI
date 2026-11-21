/**
 * Real routes for the marketing nav and footer.
 * Trailing slashes match the canonical URLs the server answers with 200.
 * Plain JS so Node (the build, the tests) can load it.
 */

export const HOME_HREF = '/'
export const LOGIN_HREF = '/login/'
export const SIGNUP_HREF = '/signup/'
export const PRODUCTS_HREF = '/products/'
export const USE_CASES_HREF = '/use-cases/'
export const ETHICS_HREF = '/ethics/'
export const HELP_HREF = '/help/'
export const PRIVACY_HREF = '/privacy/'

export const PRODUCT_LINKS = [
  { title: 'Visual AI Agents', desc: 'AI teaching avatars', href: '/products/#visual-ai-agents' },
  { title: 'Creative Reality™ Studio', desc: 'AI video studio', href: '/products/#creative-reality-studio' },
  { title: 'Video Translate', desc: 'Multilingual video', href: '/products/#video-translate' },
  { title: 'Video Campaigns', desc: 'Marketing videos', href: '/products/#video-campaigns' },
  { title: 'Personal Avatars', desc: 'Digital instructors', href: '/products/#personal-avatars' },
  { title: 'AI Avatars & Videos', desc: 'AI avatars and video demos', href: '/ai-avatars-videos/' },
]

export const SOLUTION_LINKS = [
  { title: 'Marketing Suite', desc: 'Campaign automation', href: '/marketing-suite/' },
  { title: 'Sales Solutions', desc: 'Video outreach', href: '/sales-suite/' },
  { title: 'Customer Experience', desc: 'Customer engagement', href: '/customer-experience/' },
  { title: 'Learning & Development', desc: 'Corporate training', href: '/learning-development/' },
  { title: 'AI Videos', desc: 'Automated comms', href: '/ai-videos/' },
]

export function hrefForProduct(title) {
  return PRODUCT_LINKS.find((item) => item.title === title)?.href || PRODUCTS_HREF
}

export function hrefForSolution(title) {
  return SOLUTION_LINKS.find((item) => item.title === title)?.href || USE_CASES_HREF
}

/** Left click without a modifier: the app navigates in place. Anything else follows href. */
export function isPlainLeftClick(event) {
  if (!event) return false
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}
