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
export const PAGE_TITLES = {
  // The product is an AI avatar video generator for training videos, not a course-authoring suite.
  '/': `AI Avatar Video Generator for Training Videos | ${BRAND}`,
  '/products': `Online Course Creation Tools | ${BRAND}`,
  '/marketing-suite': `Marketing Suite: AI Marketing Tools | ${BRAND}`,
  '/sales-suite': `Sales Suite: Sales Enablement Tools | ${BRAND}`,
  '/customer-experience': `Customer Experience Solutions | ${BRAND}`,
  '/learning-development': `Learning & Development Tools | ${BRAND}`,
  '/use-cases': `Digital Learning Use Cases | ${BRAND}`,
  '/technology': `AI Learning Technology | ${BRAND}`,
  '/ai-videos': `AI Video Creation | ${BRAND}`,
  '/ai-avatars-videos': `AI Avatar Video Creation | ${BRAND}`,
  '/about-us': `About Us | ${BRAND}`,
  '/news': `News & Updates | ${BRAND}`,
  '/resources': `Online Learning Resources | ${BRAND}`,
  '/ethics': `AI Ethics & Responsible AI | ${BRAND}`,
  '/help': `Help Center | ${BRAND}`,
  '/privacy': `Privacy Policy | ${BRAND}`,
  '/login': `Log In | ${BRAND}`,
  '/signup': `Sign Up | ${BRAND}`,
  '/early-access': `Early Access | ${BRAND}`,
}

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

/** Meta descriptions from the digital marketing team's sheet ("Meta Description_virtual-studio"). */
export const PAGE_DESCRIPTIONS = {
  '/': 'Create training videos with AI avatars in Athena Virtual Studio. Turn a script into a presenter-led video for courses, employee training and digital learning.',
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

/**
 * Placeholder URLs. They stay out of the sitemap and the header/footer until they have real
 * content. They are not routes, so the server answers 404 with the noindex Not Found page.
 */
export const PLACEHOLDER_PATHS = ['/technology', '/about-us', '/news', '/resources']

/** Share image for Open Graph. A product still, no overlaid claims. */
export const OG_IMAGE_PATH = '/og-cover.webp'
export const OG_IMAGE = `${SITE_URL}${OG_IMAGE_PATH}`

/** First hero frame. Preloaded on the home page so it can paint before the avatar videos. */
export const LCP_IMAGE_PATH = '/hero-posters/01.webp'

export const BREADCRUMB_LABELS = {
  '/': 'Home',
  '/products': 'Products',
  '/marketing-suite': 'Marketing Suite',
  '/sales-suite': 'Sales Suite',
  '/customer-experience': 'Customer Experience',
  '/learning-development': 'Learning and Development',
  '/use-cases': 'Use Cases',
  '/ai-videos': 'AI Videos',
  '/ai-avatars-videos': 'AI Avatars and Videos',
  '/ethics': 'Ethics',
  '/help': 'Help Center',
  '/privacy': 'Privacy Policy',
}

const ATHENA_LMS_URL = 'https://lmsathena.com'
const ORGANIZATION_ID = `${ATHENA_LMS_URL}/#organization`
const SOFTWARE_ID = `${SITE_URL}/#software`

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

/** Address-bar path for a public page: the trailing-slash URL the server answers with 200. */
export function browserPathFor(pathname) {
  const path = normalizeSeoPath(pathname)
  if (path === '/') return '/'
  if (INDEXABLE_PATHS.includes(path) || NOINDEX_PUBLIC_PATHS.includes(path)) return `${path}/`
  return path
}

export function openGraphForPath(pathname) {
  const seo = seoForPath(pathname)
  if (!seo.indexable || !seo.canonical) return null
  return {
    title: seo.title,
    description: seo.description,
    url: seo.canonical,
    image: OG_IMAGE,
    type: 'website',
    siteName: BRAND,
  }
}

export function jsonLdForPath(pathname) {
  const path = normalizeSeoPath(pathname)
  const seo = seoForPath(path)
  if (!seo.indexable || !seo.canonical) return null
  const crumbs = [{ name: 'Home', item: `${SITE_URL}/` }]
  if (path !== '/') {
    crumbs.push({ name: BREADCRUMB_LABELS[path] || seo.title, item: seo.canonical })
  }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'Athena LMS',
        url: ATHENA_LMS_URL,
        telephone: '+1 (425) 400-9246',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '12315 NE 97th Street',
          addressLocality: 'Kirkland',
          addressRegion: 'WA',
          addressCountry: 'US',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': SOFTWARE_ID,
        name: 'Athena Virtual Studio',
        alternateName: 'Virtual Studio',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        url: `${SITE_URL}/`,
        description: PAGE_DESCRIPTIONS['/'],
        publisher: { '@id': ORGANIZATION_ID },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.item,
        })),
      },
    ],
  }
}

/**
 * Indexable pages get a self-referencing canonical. Sign-in, the app, shared links and unknown
 * paths get `noindex, follow` and no canonical. `/__not-found__` is the static 404 document.
 */
export function seoForPath(pathname) {
  const path = normalizeSeoPath(pathname)
  if (path === '/__not-found__') {
    return {
      indexable: false,
      canonical: null,
      robots: ROBOTS_NOINDEX,
      title: `Page not found | ${BRAND}`,
      description: 'The page you requested is not on Athena Virtual Studio.',
      h1: 'Page not found',
    }
  }
  const indexable = INDEXABLE_PATHS.includes(path)
  // Pages with their own title, description and H1; the app and hidden pages get the defaults.
  const listed = indexable || NOINDEX_PUBLIC_PATHS.includes(path)
  // A shared presentation names its own tab; leave it alone.
  const ownTitle = /^\/p\//.test(path)
  return {
    indexable,
    canonical: indexable ? canonicalUrl(path) : null,
    robots: indexable ? ROBOTS_INDEX : ROBOTS_NOINDEX,
    title: ownTitle ? null : (listed && PAGE_TITLES[path]) || DEFAULT_TITLE,
    description: (listed && PAGE_DESCRIPTIONS[path]) || null,
    h1: (listed && PAGE_H1[path]) || null,
  }
}
