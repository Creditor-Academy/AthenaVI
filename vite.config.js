import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const contractsEsm = (file) => path.resolve(rootDir, 'packages/athena-contracts/esm', file)

/** Dev: resolve linked package to workspace ESM shims (avoids stale optimizeDeps pre-bundles). */
const athenaContractsAliases = {
  '@athena/contracts/contentContract.js': contractsEsm('contentContract.js'),
  '@athena/contracts/errors.js': contractsEsm('errors.js'),
  '@athena/contracts/textNormalize.js': contractsEsm('textNormalize.js'),
  '@athena/contracts/slotText.js': contractsEsm('slotText.js'),
  '@athena/contracts/slotGeometry.js': contractsEsm('slotGeometry.js'),
  '@athena/contracts/contentRepair.js': contractsEsm('contentRepair.js'),
  '@athena/contracts/graphicTheme.js': contractsEsm('graphicTheme.js'),
  '@athena/contracts/donutContextMetrics.js': contractsEsm('donutContextMetrics.js'),
}

const athenaContractsIds = Object.keys(athenaContractsAliases)
const athenaContractsRoot = path.resolve(rootDir, 'packages/athena-contracts')

/** Linked CJS package must be pre-bundled for the browser; rebuild when sources change. */
function athenaContractsOptimizePlugin() {
  return {
    name: 'athena-contracts-optimize',
    configureServer(server) {
      server.watcher.add(athenaContractsRoot)
      server.watcher.on('change', (file) => {
        if (!file.startsWith(athenaContractsRoot) || !file.endsWith('.js')) return
        server.config.logger.info(
          '[athena-contracts] source changed — restarting dev server to refresh optimized deps',
        )
        server.restart()
      })
    },
  }
}

/** The Google Tag Manager container from the marketing team. VITE_GTM_ID overrides it; "off" disables it. */
const DEFAULT_GTM_ID = 'GTM-M4CC43NS'

export function gtmIdFromEnv(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return DEFAULT_GTM_ID
  if (/^(off|false|0|none)$/i.test(value)) return null
  return /^GTM-[A-Z0-9]+$/.test(value) ? value : null
}

/** The Google tag snippet for a GTM container, as Google's "Set up a Google tag" page gives it. */
export function gtmSnippet(gtmId) {
  return [
    '<!-- Google tag (Google Tag Manager) -->',
    `<script async src="https://www.googletagmanager.com/gtm.js?id=${gtmId}"></script>`,
    '<script>',
    '  window.dataLayer = window.dataLayer || [];',
    '  function gtag(){dataLayer.push(arguments);}',
    "  gtag('js', new Date());",
    '</script>',
  ].join('\n    ')
}

/**
 * Google Tag Manager on the site's pages, right after <head> (as Google asks). Production builds
 * only, so local development doesn't send visits to Analytics; never on export-render.html (the
 * page the backend renders exports with).
 */
function googleTagManagerPlugin(gtmId) {
  return {
    name: 'google-tag-manager',
    apply: 'build',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!gtmId || path.basename(ctx.filename || '') !== 'index.html') return html
        return html.replace(/<head>/i, `<head>\n    ${gtmSnippet(gtmId)}`)
      },
    },
  }
}

// https://vite.dev/config/
function resolveDevApiTarget(raw) {
  const fallback = 'http://127.0.0.1:9000'
  if (!raw) return fallback
  try {
    const parsed = new URL(raw)
    // Node dual-stack lookup of "localhost" often hits ::1 first and
    // ECONNREFUSED when the API is only bound on IPv4.
    if (parsed.hostname === 'localhost') parsed.hostname = '127.0.0.1'
    return parsed.origin
  } catch {
    return fallback
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = resolveDevApiTarget(env.VITE_API_BASE_URL)

  return {
    base: '/',
    plugins: [react(), athenaContractsOptimizePlugin(), googleTagManagerPlugin(gtmIdFromEnv(env.VITE_GTM_ID))],
    resolve: {
      alias: athenaContractsAliases,
    },
    server: {
      fs: {
        allow: ['.'],
      },
      hmr: {
        host: 'localhost',
        port: 5173,
        clientPort: 5173,
      },
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          timeout: 1800000,
        },
      },
    },
    build: {
      // @athena/contracts is CommonJS linked from ./packages (outside node_modules).
      commonjsOptions: {
        include: [/node_modules/, /packages[\\/]athena-contracts/],
      },
      rollupOptions: {
        input: {
          main: path.resolve(rootDir, 'index.html'),
          // Headless page the backend uses to export presentations with the editor's renderer.
          exportRender: path.resolve(rootDir, 'export-render.html'),
        },
      },
    },
    optimizeDeps: {
      // ESM shims import CJS siblings; without pre-bundle, Vite serves raw `require()` to the browser.
      include: athenaContractsIds,
    },
  }
})
