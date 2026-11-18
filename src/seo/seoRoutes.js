/**
 * Which public pages search engines should index, their canonical URLs and meta descriptions.
 *
 * Used by the build (scripts/render-postbuild.mjs writes a canonical / robots tag into each
 * page's HTML), by the app (applySeoHead keeps them right after in-app navigation), and by the
 * tests that check public/sitemap.xml against this list. Plain JS with no imports, so Node can
 * load it too.
 *
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
  '/technology',
  '/ai-videos',
  '/ai-avatars-videos',
  '/about-us',
  '/news',
  '/resources',
  '/ethics',
  '/help',
  '/privacy',
  '/download',
]

/**
 * Public pages kept out of search: `noindex, follow` and no canonical. /early-access is the
 * old waitlist link and now shows the sign-up form, so it is treated like /signup.
 */
export const NOINDEX_PUBLIC_PATHS = ['/login', '/signup', '/early-access']

/** Meta descriptions from the digital marketing team's sheet ("Meta Description_virtual-studio"). */
export const PAGE_DESCRIPTIONS = {
  '/': 'Create engaging online courses with Athena Virtual Studio. Explore AI-powered tools for course creation, interactive learning content and digital training.',
  '/products': 'Explore Athena Virtual Studio products for creating digital learning experiences. Discover course authoring, AI content tools and solutions for training teams.',
  '/marketing-suite': "Discover Athena's marketing suite for creating and managing digital marketing content. Explore tools designed to support campaigns, content and audience engagement.",
  '/sales-suite': "Explore Athena's sales suite and discover digital tools that help sales teams present solutions, share content and support customer conversations.",
  '/customer-experience': 'Explore Athena solutions designed to support customer experiences with engaging digital content, helpful resources and interactive communication.',
  '/learning-development': 'Discover Athena Virtual Studio for learning and development. Create engaging training content and digital learning experiences for employees and learners.',
  '/use-cases': 'See how Athena Virtual Studio can support different use cases, from online course creation to employee training and interactive digital learning.',
  '/technology': 'Learn about the technology behind Athena Virtual Studio and explore how AI-powered capabilities support digital content creation and engaging learning experiences.',
  '/ai-videos': 'Create engaging videos with AI using Athena Virtual Studio. Explore video creation capabilities that help turn ideas and learning content into video experiences.',
  '/ai-avatars-videos': 'Create presenter-style videos with AI avatars using Athena Virtual Studio. Explore ways to turn scripts and ideas into engaging video content.',
  '/about-us': 'Get to know Athena Virtual Studio, our platform and our approach to helping people create digital content and engaging online learning experiences.',
  '/news': 'Read the latest news and updates from Athena Virtual Studio, including platform announcements, product developments and company updates.',
  '/resources': 'Explore resources from Athena Virtual Studio for creating digital content, developing online courses and improving learning experiences.',
  '/ethics': "Learn about Athena's approach to ethics and responsible technology. Read the principles that guide the responsible use of AI and digital learning tools.",
  '/help': 'Find help and guidance for using Athena Virtual Studio. Explore support information and answers to common questions about the platform.',
  '/privacy': 'Read the Athena Virtual Studio privacy policy to understand how information is collected, used, stored and protected when you use our services.',
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

/**
 * The tags a page should carry. Indexable pages: a self-referencing canonical. Everything else
 * (sign-in, the app behind sign-in, shared links, unknown paths): `noindex, follow`, no canonical.
 */
export function seoForPath(pathname) {
  const path = normalizeSeoPath(pathname)
  const description = PAGE_DESCRIPTIONS[path] || null
  if (INDEXABLE_PATHS.includes(path)) {
    return { indexable: true, canonical: canonicalUrl(path), robots: ROBOTS_INDEX, description }
  }
  return { indexable: false, canonical: null, robots: ROBOTS_NOINDEX, description }
}
