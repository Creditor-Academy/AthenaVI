#!/usr/bin/env node
/**
 * Lock shipped dashboard / editor URLs in App.jsx without mounting React.
 * If a path is removed from PATH_TO_VIEW_MAP, this test fails before Jenkins builds.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appSource = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'App.jsx'),
  'utf8'
)

function pathMapBlock(source) {
  const match = source.match(/const PATH_TO_VIEW_MAP = \{([\s\S]*?)\n\}/)
  assert.ok(match, 'PATH_TO_VIEW_MAP is missing from App.jsx')
  return match[1]
}

describe('App PATH_TO_VIEW_MAP', () => {
  const block = pathMapBlock(appSource)

  it('keeps the product URLs that open shipped editors and admin', () => {
    const required = [
      '/dashboard/canvas-editor',
      '/dashboard/image-ai',
      '/dashboard/image-editor',
      '/dashboard/ppt-ai',
      '/dashboard/editor',
      '/dashboard/admin-portal',
      '/dashboard/brandkits',
      '/dashboard/credits',
      '/dashboard/workspace',
      '/auth/google/callback',
      '/login',
      '/create',
    ]
    for (const route of required) {
      assert.ok(block.includes(`'${route}'`), `PATH_TO_VIEW_MAP is missing ${route}`)
    }
  })

  it('still routes those editor URLs into the dashboard shell', () => {
    assert.match(block, /'\/dashboard\/canvas-editor': 'dashboard'/)
    assert.match(block, /'\/dashboard\/image-ai': 'dashboard'/)
    assert.match(block, /'\/dashboard\/ppt-ai': 'dashboard'/)
    assert.match(block, /'\/dashboard\/editor': 'dashboard'/)
  })
})
