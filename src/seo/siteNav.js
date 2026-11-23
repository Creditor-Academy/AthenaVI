import { TRAILING_SLASH } from './seoRoutes.js'

/**
 * Href for a public path. When TRAILING_SLASH is on, this is the URL the server
 * answers with 200 (canonical), so crawlers and "open in new tab" hit that URL.
 */
export function pageHref(path) {
  const raw = String(path || '/')
  if (raw === '/') return '/'
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`
  const bare = withSlash.replace(/\/+$/, '') || '/'
  if (bare === '/') return '/'
  return TRAILING_SLASH ? `${bare}/` : bare
}

export const HOME_HREF = '/'
export const LOGIN_HREF = pageHref('/login')
export const SIGNUP_HREF = pageHref('/signup')
export const USE_CASES_HREF = pageHref('/use-cases')
export const ETHICS_HREF = pageHref('/ethics')
export const PRIVACY_HREF = pageHref('/privacy')
export const HELP_HREF = pageHref('/help')

/** Navbar product menu. Product sections share /products/; the handler still opens the section. */
export const PRODUCT_NAV = [
  { title: 'Visual AI Agents', href: pageHref('/products') },
  { title: 'Creative Reality™ Studio', href: pageHref('/products') },
  { title: 'Video Translate', href: pageHref('/products') },
  { title: 'Video Campaigns', href: pageHref('/products') },
  { title: 'Personal Avatars', href: pageHref('/products') },
  { title: 'AI Avatars & Videos', href: pageHref('/ai-avatars-videos') },
]

export const SOLUTION_NAV = [
  { title: 'Marketing Suite', href: pageHref('/marketing-suite') },
  { title: 'Sales Solutions', href: pageHref('/sales-suite') },
  { title: 'Customer Experience', href: pageHref('/customer-experience') },
  { title: 'Learning & Development', href: pageHref('/learning-development') },
  { title: 'AI Videos', href: pageHref('/ai-videos') },
]

/** Footer product column: the sections on /products/, not the avatars page. */
export const FOOTER_PRODUCT_NAV = PRODUCT_NAV.filter((item) => item.href === pageHref('/products'))

export const FOOTER_BOTTOM_NAV = [
  { title: 'Trust Center', href: ETHICS_HREF },
  { title: 'Privacy Policy', href: PRIVACY_HREF },
  { title: 'Help Center', href: HELP_HREF },
]

export const SOCIAL_NAV = [
  { title: 'LinkedIn', href: 'https://www.linkedin.com/company/lmsathena' },
  { title: 'Instagram', href: 'https://www.instagram.com/athena.lms' },
  { title: 'YouTube', href: 'https://www.youtube.com/@LMSAthena' },
  { title: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61590841915126' },
]

/**
 * Anchors written into each prerendered public page. Same targets as the navbar
 * and footer, so a crawler that does not run JavaScript still sees them.
 */
export function crawlableNavAnchors() {
  return [
    { title: 'Home', href: HOME_HREF },
    ...PRODUCT_NAV,
    ...SOLUTION_NAV,
    { title: 'Use Cases', href: USE_CASES_HREF },
    { title: 'See all Use Cases', href: USE_CASES_HREF },
    { title: 'Log in', href: LOGIN_HREF },
    { title: 'Get Started', href: SIGNUP_HREF },
    ...FOOTER_PRODUCT_NAV,
    ...SOLUTION_NAV,
    ...FOOTER_BOTTOM_NAV,
    ...SOCIAL_NAV,
  ]
}
