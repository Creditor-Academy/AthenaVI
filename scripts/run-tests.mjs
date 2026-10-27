/**
 * `npm test`: run every src test file plus @athena/contracts unit tests
 * (except FE/BE parity, which needs the backend layout catalog).
 * Collects files itself so it doesn't depend on node --test glob support (Node 21+).
 */
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function collect(dir) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...collect(full))
    else if (entry.name.endsWith('.test.mjs')) found.push(path.relative(root, full))
  }
  return found
}

function collectDefault() {
  const src = collect(path.join(root, 'src'))
  const contractsDir = path.join(root, 'packages', 'athena-contracts', 'test')
  const contracts = collect(contractsDir).filter(
    (file) => !file.replaceAll('\\', '/').endsWith('content-contract-parity.test.mjs')
  )
  return [...src, ...contracts].sort()
}

const files = process.argv.length > 2 ? process.argv.slice(2) : collectDefault()

const result = spawnSync(
  process.execPath,
  ['--import', './scripts/test-resolve-hook.mjs', '--test', ...files],
  { cwd: root, stdio: 'inherit' }
)
process.exit(result.status ?? 1)
