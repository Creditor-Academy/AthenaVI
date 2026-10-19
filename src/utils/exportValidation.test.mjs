#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateExport } from './exportValidation.js'
import { ExportFailedError, MissingVoiceError, MissingAvatarError } from './exportErrors.js'

describe('exportValidation', () => {
  it('blocks export when there are no scenes', () => {
    assert.throws(() => validateExport({ scenes: [] }), ExportFailedError)
    assert.throws(() => validateExport({}), /at least one scene/)
  })

  it('requires a voice and avatar look when a scene has script', () => {
    assert.throws(
      () => validateExport({ scenes: [{ title: 'Open', script: 'Hello there' }] }),
      MissingVoiceError
    )
    assert.throws(
      () =>
        validateExport({
          scenes: [{ title: 'Open', script: 'Hello there', voiceId: 'v1' }],
        }),
      MissingAvatarError
    )
  })

  it('blocks while avatar video is still generating or missing', () => {
    const base = {
      title: 'Open',
      script: 'Hello there',
      voiceId: 'v1',
      avatarLookId: 'look_1',
    }
    assert.throws(
      () => validateExport({ scenes: [{ ...base, heygenStatus: 'processing' }] }),
      (err) => {
        assert.ok(err instanceof MissingAvatarError)
        assert.match(String(err.details?.details || ''), /still generating/)
        return true
      }
    )
    assert.throws(
      () => validateExport({ scenes: [{ ...base, heygenStatus: 'failed' }] }),
      (err) => {
        assert.ok(err instanceof MissingAvatarError)
        assert.match(String(err.details?.details || ''), /failed/)
        return true
      }
    )
    assert.throws(
      () => validateExport({ scenes: [base] }),
      (err) => {
        assert.ok(err instanceof MissingAvatarError)
        assert.match(String(err.details?.details || ''), /has not been generated/)
        return true
      }
    )
  })

  it('allows a scripted scene that has look, voice, and a HeyGen video id', () => {
    assert.doesNotThrow(() =>
      validateExport({
        scenes: [
          {
            title: 'Open',
            script: 'Hello there',
            voiceId: 'v1',
            avatarLookId: 'look_1',
            heygenVideoId: 'vid_1',
            heygenStatus: 'completed',
          },
        ],
      })
    )
  })

  it('allows silent scenes with no script', () => {
    assert.doesNotThrow(() => validateExport({ scenes: [{ title: 'B-roll' }] }))
  })
})
