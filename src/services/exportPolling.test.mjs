#!/usr/bin/env node
/** Run: node scripts/run-tests.mjs src/services/exportPolling.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import presentationService from './presentationService.js'

function stubStatuses(steps) {
  const calls = []
  presentationService.getExportStatus = async () => {
    const step = steps[Math.min(calls.length, steps.length - 1)]
    calls.push(step)
    if (step instanceof Error) throw step
    return step
  }
  return calls
}

const httpError = (status) => Object.assign(new Error(`HTTP ${status}`), { status })

describe('waiting for an export', () => {
  it('a dropped connection or a 502 on one check does not fail a running export', async () => {
    const calls = stubStatuses([
      { status: 'RENDERING' },
      new TypeError('Failed to fetch'),
      httpError(502),
      { status: 'RENDERING' },
      { status: 'READY', presignedUrl: 'https://x/file.pptx' },
    ])
    const ready = await presentationService.pollExportUntilReady('w', 'p', 'e', { intervalMs: 1 })
    assert.equal(ready.status, 'READY')
    assert.equal(calls.length, 5)
  })

  it('a real error stops at once: failed export, 404, or 401', async () => {
    stubStatuses([{ status: 'FAILED', error: 'Export rendering timed out' }])
    await assert.rejects(
      presentationService.pollExportUntilReady('w', 'p', 'e', { intervalMs: 1 }),
      /Export rendering timed out/
    )
    for (const code of [404, 401, 403]) {
      const calls = stubStatuses([httpError(code), { status: 'READY' }])
      await assert.rejects(presentationService.pollExportUntilReady('w', 'p', 'e', { intervalMs: 1 }))
      assert.equal(calls.length, 1, `${code} is not retried`)
    }
  })

  it('gives up after repeated network failures', async () => {
    const calls = stubStatuses([httpError(503)])
    await assert.rejects(presentationService.pollExportUntilReady('w', 'p', 'e', { intervalMs: 1 }))
    assert.equal(calls.length, 6)
  })
})
