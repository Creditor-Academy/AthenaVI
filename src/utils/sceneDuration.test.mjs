#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  countScriptWords,
  roundSceneDuration,
  estimateHeygenSceneDuration,
  applyDurationToSceneClips,
  buildSceneDurationPatch,
  durationFromVideoMetadata,
} from './sceneDuration.js'

describe('sceneDuration', () => {
  it('counts words and rounds duration to half seconds', () => {
    assert.equal(countScriptWords('  Hello there world  '), 3)
    assert.equal(countScriptWords(''), 0)
    assert.equal(roundSceneDuration(3.2), 3.5)
    assert.equal(roundSceneDuration(0), 3)
  })

  it('estimates HeyGen duration from script length and voice speed', () => {
    assert.equal(estimateHeygenSceneDuration(''), 8)
    const slow = estimateHeygenSceneDuration('one two three four five six seven eight nine ten', { speed: 0.5 })
    const fast = estimateHeygenSceneDuration('one two three four five six seven eight nine ten', { speed: 2 })
    assert.ok(slow > fast)
    assert.ok(slow >= 3 && slow <= 60)
  })

  it('stretches start-at-zero clips to the new duration', () => {
    const clips = applyDurationToSceneClips(
      [
        { id: 'a', startTime: 0, endTime: 4 },
        { id: 'b', startTime: 2, endTime: 20 },
      ],
      10
    )
    assert.equal(clips[0].endTime, 10)
    assert.equal(clips[1].endTime, 10)
  })

  it('builds a duration patch from script and reads metadata duration', () => {
    const patch = buildSceneDurationPatch({
      script: 'Hello world',
      clips: [{ id: 'a', startTime: 0, endTime: 1 }],
    })
    assert.equal(patch.durationFromScript, true)
    assert.ok(patch.duration >= 3)
    assert.equal(durationFromVideoMetadata({ duration: 12.2 }), 12.5)
    assert.equal(durationFromVideoMetadata({}), null)
  })
})
