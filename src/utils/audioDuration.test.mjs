#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { probeAudioDuration, isAudioFile } from './audioDuration.js'

describe('audioDuration', () => {
  it('recognizes audio files by MIME type or extension', () => {
    assert.equal(isAudioFile({ type: 'audio/mpeg', name: 'v.mp3' }), true)
    assert.equal(isAudioFile({ type: '', name: 'voice.wav' }), true)
    assert.equal(isAudioFile({ type: 'image/png', name: 'pic.png' }), false)
    assert.equal(isAudioFile(null), false)
  })

  it('resolves null when there is no src to probe', async () => {
    assert.equal(await probeAudioDuration(''), null)
    assert.equal(await probeAudioDuration(null), null)
  })
})
