/**
 * Which public pages search engines should index, their canonical URLs and meta descriptions.
 *
 * Used by the build (scripts/render-postbuild.mjs writes tags into each page's HTML), by the
 * app (applySeoHead keeps them right after in-app navigation), and by the tests that check
 * public/sitemap.xml against this list.
 */
import { HELP_FAQS } from './helpFaqs.js'

/**
 * Trailing slash: every page is served from its own folder (dist/products/index.html), so the
 * web server answers /products with a 301 to /products/. A canonical must point at the URL that
 * answers 200, so canonical and sitemap URLs end in a slash. If the server is changed to serve
 * /products without the redirect, set TRAILING_SLASH to false and update public/sitemap.xml.
 */

export const SITE_URL = 'https://virtualstudio.lmsathena.com'

export const TRAILING_SLASH = true

/** Public marketing pages: indexable, with a self-referencing canonical. */
export const INDEXABLE_PATHS = [
  '/',
  '/products',
  '/marketing-suite',
  '/sales-suite',
  '/customer-experience',
  '/learning-development',
  '/use-cases',
  // '/technology', // hidden for now (not linked from the site navigation)
  '/ai-videos',
  '/ai-avatars-videos',
  // '/about-us', // hidden for now (not linked from the site navigation)
  // '/news', // hidden for now (not linked from the site navigation)
  // '/resources', // hidden for now (not linked from the site navigation)
  '/ethics',
  '/help',
  '/privacy',
  // /download is not here: it is the signed-in app's download hand-off (visitors get the
  // sign-in form), so it is noindex like the rest of the app.
]

/**
 * Public pages kept out of search: `noindex, follow` and no canonical. /early-access is the
 * old waitlist link and now shows the sign-up form, so it is treated like /signup.
 */
export const NOINDEX_PUBLIC_PATHS = ['/login', '/signup', '/early-access']

export const BRAND = 'Athena Virtual Studio'

/** The title of the signed-in app and of any page not listed below. */
export const DEFAULT_TITLE = BRAND

/**
 * <title> per page: the page's primary keyword from the marketing sheet, then the brand.
 * Kept to about 60 characters so search results show it in full.
 */
/** Kept under 60 characters so the full title shows in search results. */
export const PAGE_TITLES = {
  '/': `AI Video Generator | ${BRAND}`,
  '/products': `AI Avatar & Video Tools | ${BRAND}`,
  '/marketing-suite': `AI Marketing Videos | ${BRAND}`,
  '/sales-suite': `AI Sales Video Tools | ${BRAND}`,
  '/customer-experience': `AI Customer Experience | ${BRAND}`,
  '/learning-development': `AI Training Video Maker | ${BRAND}`,
  '/use-cases': `AI Video Use Cases | ${BRAND}`,
  '/technology': `AI Learning Technology | ${BRAND}`,
  '/ai-videos': `Text to Video AI | ${BRAND}`,
  '/ai-avatars-videos': `AI Avatar Video Maker | ${BRAND}`,
  '/about-us': `About Us | ${BRAND}`,
  '/news': `News & Updates | ${BRAND}`,
  '/resources': `Online Learning Resources | ${BRAND}`,
  '/ethics': `Responsible AI Ethics | ${BRAND}`,
  '/help': `Help Center | ${BRAND}`,
  '/privacy': `Privacy Policy | ${BRAND}`,
  '/login': `Log In | ${BRAND}`,
  '/signup': `Sign Up | ${BRAND}`,
  '/early-access': `Early Access | ${BRAND}`,
}

export const NOT_FOUND_TITLE = `Page not found | ${BRAND}`

export const OG_IMAGE_PATH = '/og-image.png'
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`

export const SOCIAL_PROFILES = [
  'https://www.linkedin.com/company/lmsathena',
  'https://www.instagram.com/athena.lms',
  'https://www.youtube.com/@LMSAthena',
  'https://www.facebook.com/profile.php?id=61590841915126',
]

/**
 * The page's one <h1>, exactly as the page renders it. The build also writes it into the HTML
 * (with the meta description) so crawlers that don't run JavaScript see it; the app replaces it
 * when it starts. If a page's heading changes, change it here too.
 */
export const PAGE_H1 = {
  '/': 'Create AI-Powered Videos That Speak Your Language',
  '/products': 'Create AI Agents That Know Everything About Your Business',
  '/marketing-suite': 'Personalized AI Marketing Suite',
  '/sales-suite': 'Transform Your Sales Strategy with AI',
  '/customer-experience': 'Revolutionize Customer Experience with Interactive AI Humans',
  '/learning-development': 'E-Learning & Corporate Training Videos Powered by AI',
  '/use-cases': 'Universal Applications for Visual AI',
  '/ai-videos': 'Create Engaging Videos with AI',
  '/ai-avatars-videos': 'AI Avatars for Real-Time Video & Human Interaction',
  '/ethics': 'Ethical Pledge for Synthetic Media',
  '/help': 'Help Center',
  '/privacy': 'Privacy Policy',
  '/login': 'Your studio awaits',
  '/signup': "Lights, camera — let's go",
  '/early-access': 'Get early access',
}

/** Unique meta descriptions, each under 160 characters. */
export const PAGE_DESCRIPTIONS = {
  '/': 'Create AI avatar videos and presentations from a script. Athena Virtual Studio is an AI video generator for training, marketing, sales and support.',
  '/products': 'AI avatar and video tools for business: photo-to-avatar, video translation, campaigns and personal avatars in one studio.',
  '/marketing-suite': 'AI marketing video generator for campaigns, launches and personalized content. Create on-brand avatar videos for every channel.',
  '/sales-suite': 'AI sales enablement videos and avatar presentations that help teams pitch, follow up and explain products to buyers.',
  '/customer-experience': 'Interactive AI humans for customer experience. Avatar videos and agents that answer, guide and support customers in your brand voice.',
  '/learning-development': 'AI training video creation for learning and development teams. Turn scripts and courses into avatar-led e-learning videos.',
  '/use-cases': 'AI video and avatar use cases for marketing, sales, customer experience and corporate training, across teams and industries.',
  '/technology': 'Learn about the technology behind Athena Virtual Studio and explore how AI-powered capabilities support digital content creation and engaging learning experiences.',
  '/ai-videos': 'Text-to-video AI that turns a script into an engaging avatar video. Create training, marketing and explainer videos in minutes.',
  '/ai-avatars-videos': 'AI avatar video maker with photo-to-avatar presenters. Turn a script into a spokesperson video for training, sales and support.',
  '/about-us': 'Get to know Athena Virtual Studio, our platform and our approach to helping people create digital content and engaging online learning experiences.',
  '/news': 'Read the latest news and updates from Athena Virtual Studio, including platform announcements, product developments and company updates.',
  '/resources': 'Explore resources from Athena Virtual Studio for creating digital content, developing online courses and improving learning experiences.',
  '/ethics': 'Ethical pledge for synthetic media at Athena Virtual Studio. How we design and use AI avatars and AI videos responsibly.',
  '/help': 'Help Center for Athena Virtual Studio. Answers on creating AI avatar videos, voices, export formats, languages and your account.',
  '/privacy': 'Privacy policy for Athena Virtual Studio. How we collect, use, store and protect information when you create AI videos with us.',
  '/download': 'Get the Athena Virtual Studio app or downloads and find the information you need to access the platform on your device.',
  '/early-access': "Request early access to Athena Virtual Studio and be among the first to explore the platform's tools for creating digital content and learning experiences.",
}

export const ROBOTS_INDEX = 'index, follow'
export const ROBOTS_NOINDEX = 'noindex, follow'

/** `/products/` → `/products`; `''` → `/`. Query and hash are dropped. */
export function normalizeSeoPath(pathname = '/') {
  let path = String(pathname || '/').split('?')[0].split('#')[0].trim()
  if (!path.startsWith('/')) path = `/${path}`
  path = path.replace(/\/{2,}/g, '/')
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  return path || '/'
}

export function canonicalUrl(pathname) {
  const path = normalizeSeoPath(pathname)
  if (path === '/') return `${SITE_URL}/`
  return `${SITE_URL}${path}${TRAILING_SLASH ? '/' : ''}`
}

/** Signed-in app and one-off links. These keep the plain brand title, not a 404 title. */
const APP_EXACT = new Set([
  '/download', '/profile', '/settings', '/support', '/hub', '/create', '/products/choose',
])
const APP_PREFIXES = [
  '/dashboard', '/slides', '/create', '/share', '/invitations', '/invite',
  '/reset-password', '/auth', '/oauth',
]

export function isAppShellPath(pathname) {
  const path = normalizeSeoPath(pathname)
  if (APP_EXACT.has(path)) return true
  return APP_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

/**
 * The tags a page should carry. Indexable pages: a self-referencing canonical. Everything else
 * (sign-in, the app behind sign-in, shared links, unknown paths): `noindex, follow`, no canonical.
 */
export function seoForPath(pathname) {
  const path = normalizeSeoPath(pathname)
  const indexable = INDEXABLE_PATHS.includes(path)
  // Pages with their own title, description and H1; the app and hidden pages get the defaults.
  const listed = indexable || NOINDEX_PUBLIC_PATHS.includes(path)
  // A shared presentation names its own tab; leave it alone.
  const ownTitle = /^\/p\//.test(path)
  let title = null
  if (!ownTitle) {
    if (listed) title = PAGE_TITLES[path] || DEFAULT_TITLE
    else if (isAppShellPath(path)) title = DEFAULT_TITLE
    else title = NOT_FOUND_TITLE
  }
  return {
    indexable,
    canonical: indexable ? canonicalUrl(path) : null,
    robots: indexable ? ROBOTS_INDEX : ROBOTS_NOINDEX,
    title,
    description: (listed && PAGE_DESCRIPTIONS[path]) || null,
    h1: (listed && PAGE_H1[path]) || null,
  }
}

/** Open Graph and Twitter Card tags for an indexable page. */
export function openGraphTags(seo) {
  if (!seo?.indexable || !seo.title) return []
  const tags = [
    { attr: 'property', name: 'og:title', content: seo.title },
    { attr: 'property', name: 'og:description', content: seo.description || '' },
    { attr: 'property', name: 'og:type', content: 'website' },
    { attr: 'property', name: 'og:site_name', content: BRAND },
    { attr: 'property', name: 'og:url', content: seo.canonical || '' },
    { attr: 'property', name: 'og:image', content: OG_IMAGE_URL },
    { attr: 'property', name: 'og:image:width', content: '1200' },
    { attr: 'property', name: 'og:image:height', content: '630' },
    { attr: 'property', name: 'og:image:alt', content: `${BRAND} — AI videos, avatars and presentations` },
    { attr: 'name', name: 'twitter:card', content: 'summary_large_image' },
    { attr: 'name', name: 'twitter:title', content: seo.title },
    { attr: 'name', name: 'twitter:description', content: seo.description || '' },
    { attr: 'name', name: 'twitter:image', content: OG_IMAGE_URL },
  ]
  return tags.filter((tag) => tag.content)
}

function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/icon-512.png`,
    sameAs: SOCIAL_PROFILES,
  }
}

function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND,
    url: `${SITE_URL}/`,
    publisher: { '@type': 'Organization', name: BRAND, url: `${SITE_URL}/` },
  }
}

function softwareLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: BRAND,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    url: `${SITE_URL}/`,
    description: PAGE_DESCRIPTIONS['/'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free to start',
    },
  }
}

function faqLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HELP_FAQS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

/** JSON-LD blocks for a path. FAQPage only on the Help Center, which has real questions. */
export function jsonLdForPath(pathname) {
  const path = normalizeSeoPath(pathname)
  if (path === '/') return [organizationLd(), websiteLd(), softwareLd()]
  if (path === '/help') return [faqLd()]
  return []
}
