/**
 * Key events for Google Tag Manager (container GTM-M4CC43NS, loaded by the build: see
 * vite.config.js). Each is pushed to `window.dataLayer` as `{ event: <name>, ...params }`; GTM
 * forwards them to GA4. Without GTM (local development) the pushes are harmless.
 *
 *   sign_up              { method: 'email' | 'google', signup_source?: 'early_access' }
 *   login                { method: 'email' | 'google' }
 *   early_access_submit  { method }   a sign-up that started on /early-access
 *   file_download        { file_extension, link_domain, page_path }
 *
 * No personal data is sent: no email, name, user id or file name.
 */

export const ANALYTICS_EVENTS = {
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  EARLY_ACCESS_SUBMIT: 'early_access_submit',
  FILE_DOWNLOAD: 'file_download',
}

const SIGNUP_SOURCE_KEY = 'athenavi:signupSource'

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined' || !name) return
  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: name, ...params })
  } catch {
    // analytics never breaks the app
  }
}

function session() {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  } catch {
    return null
  }
}

/**
 * Note where a visit started, so a sign-up from /early-access can be reported as an early-access
 * submission. The app moves /early-access to /login straight away, so this runs before it renders.
 */
export function rememberSignupSource(pathname = typeof window !== 'undefined' ? window.location.pathname : '') {
  const path = String(pathname || '').replace(/\/+$/, '')
  if (path !== '/early-access') return
  try {
    session()?.setItem(SIGNUP_SOURCE_KEY, 'early_access')
  } catch {
    // not remembered
  }
}

function takeSignupSource() {
  const store = session()
  if (!store) return null
  try {
    const source = store.getItem(SIGNUP_SOURCE_KEY)
    store.removeItem(SIGNUP_SOURCE_KEY)
    return source || null
  } catch {
    return null
  }
}

/** A new account (email sign-up, or a Google sign-in that created the account). */
export function trackSignUp(method) {
  const source = takeSignupSource()
  trackEvent(ANALYTICS_EVENTS.SIGN_UP, { method, ...(source ? { signup_source: source } : {}) })
  if (source === 'early_access') trackEvent(ANALYTICS_EVENTS.EARLY_ACCESS_SUBMIT, { method })
}

export function trackLogin(method) {
  trackEvent(ANALYTICS_EVENTS.LOGIN, { method })
}

/** Google sign-in reports once per page load (its "done" step can run twice). */
let googleAuthTracked = false

/** After Google sign-in: `newUser` comes from the redirect (`#new_user=1`). */
export function trackGoogleAuth(newUser) {
  if (googleAuthTracked) return
  googleAuthTracked = true
  if (newUser) trackSignUp('google')
  else trackLogin('google')
}

/** What a download link says about the file, without its name or the link's query (signed URLs). */
export function downloadDetails(anchor, pageLocation = typeof window !== 'undefined' ? window.location : null) {
  const name = String(anchor?.getAttribute?.('download') || '')
  const href = String(anchor?.href || anchor?.getAttribute?.('href') || '')
  let linkDomain = ''
  let pathPart = ''
  if (/^blob:/i.test(href)) {
    linkDomain = 'blob'
  } else if (/^data:/i.test(href)) {
    linkDomain = 'data'
  } else {
    try {
      const url = new URL(href, pageLocation?.href || 'https://invalid.local/')
      linkDomain = url.hostname
      pathPart = url.pathname
    } catch {
      linkDomain = ''
    }
  }
  const ext = (name.match(/\.([a-z0-9]{1,8})$/i) || pathPart.match(/\.([a-z0-9]{1,8})$/i) || [])[1] || ''
  return {
    file_extension: ext.toLowerCase(),
    link_domain: linkDomain,
    page_path: pageLocation?.pathname || '',
  }
}

/**
 * Report every file download: any click on an `<a download>` link, including the ones the app
 * creates and clicks itself (presentation exports, videos, images, brand kits). Runs after the
 * app's own handlers, so a link whose click the app takes over (and then downloads through
 * another link) counts once. Returns a function that stops it.
 */
export function installDownloadTracking(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc?.addEventListener) return () => {}
  const onClick = (event) => {
    if (event.defaultPrevented) return
    const anchor = event.target?.closest?.('a[download]')
    if (!anchor) return
    trackEvent(ANALYTICS_EVENTS.FILE_DOWNLOAD, downloadDetails(anchor))
  }
  doc.addEventListener('click', onClick)
  return () => doc.removeEventListener('click', onClick)
}

/** Tests: forget the once-per-page Google flag. */
export function resetAnalyticsForTests() {
  googleAuthTracked = false
}
