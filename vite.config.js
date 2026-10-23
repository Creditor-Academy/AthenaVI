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
    plugins: [react(), athenaContractsOptimizePlugin()],
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
    },
    optimizeDeps: {
      // ESM shims import CJS siblings; without pre-bundle, Vite serves raw `require()` to the browser.
      include: athenaContractsIds,
    },
  }
})
