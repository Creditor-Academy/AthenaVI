import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

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
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          timeout: 1800000,
        },
      },
    },
  }
})
