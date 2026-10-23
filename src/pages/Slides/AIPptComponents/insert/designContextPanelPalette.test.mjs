#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'DesignContextPanel.jsx'), 'utf8')

function sectionParams(name) {
  const match = src.match(new RegExp(`function ${name}\\(\\{([\\s\\S]*?)\\}\\)`))
  assert.ok(match, `${name} exists`)
  return match[1]
}

describe('DesignContextPanel palette wiring', () => {
  it('ImageDesignSection takes palette so selecting an image cannot throw ReferenceError', () => {
    assert.match(sectionParams('ImageDesignSection'), /\bpalette\b/)
    assert.match(src, /<ImageDesignSection[\s\S]*?palette=\{palette\}/)
  })
})
