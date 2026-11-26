import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiError, classifyApiError, stripRawJson, toUserMessage } from './apiUserMessage.js'
import { sanitizeUserFacingMessage } from './userFacingMessage.js'
import {
  canUseMotionExpressiveness,
  finalizeVideoCreatePayload,
  formatAvatarEngineLabel,
  getLookDefaultEngine,
  getLookSupportedEngines,
  isLegacyV2Look,
  mapAvatarLook,
  normalizeAvatarEngine,
} from './heygenAvatars.js'
import { isTransientPollError } from './heygenVideo.js'

// ---- F1: no raw JSON for users ----

test('F1: a raw validation body becomes its first error, without braces', () => {
  const raw =
    'Failed to generate video: 400 - {"success":false,"message":"Validation error","errors":["\\"resolution\\" must be one of [1080p, 720p]"]}'
  const text = sanitizeUserFacingMessage(raw)
  assert.equal(text, '"resolution" must be one of [1080p, 720p]')
  assert.ok(!text.includes('{') && !text.includes('success'))
})

test('F1: stack traces are cut off', () => {
  assert.equal(stripRawJson('Boom happened\n    at foo (a.js:1:1)\n    at bar'), 'Boom happened')
})

test('F1: 402 credits vs 402 plan-gate are told apart', () => {
  assert.equal(classifyApiError(402, { message: 'Insufficient credits' }), 'credits')
  assert.equal(
    classifyApiError(402, { message: 'HeyGen error', errors: ['This avatar is available only with Avatar 6 Pro or Turbo'] }),
    'plan'
  )
  assert.equal(
    classifyApiError(400, { message: 'This avatar is available only with Avatar 6 Pro or Turbo' }),
    'plan'
  )
})

test('F1: 409 is "busy", never a red error; 5xx says not charged', () => {
  assert.equal(toUserMessage(new ApiError('x', { status: 409, body: {} })).kind, 'busy')
  const server = toUserMessage(new ApiError('x', { status: 502, body: {} }))
  assert.equal(server.kind, 'server')
  assert.match(server.text, /not been charged/)
})

test('F1: a generic 400 shows errors[0], else message', () => {
  const err = new ApiError('ignored', { status: 400, body: { message: 'Validation error', errors: ['"voiceId" is required'] } })
  assert.equal(toUserMessage(err).text, '"voiceId" is required')
})

// ---- F2: polling keeps going on transient errors ----

test('F2: 409 / 429 / 5xx / network are transient while polling; 400 / 404 are not', () => {
  assert.equal(isTransientPollError({ status: 409 }), true)
  assert.equal(isTransientPollError({ status: 503 }), true)
  assert.equal(isTransientPollError({ status: 429 }), true)
  assert.equal(isTransientPollError(new TypeError('Failed to fetch')), true)
  assert.equal(isTransientPollError({ status: 400 }), false)
  assert.equal(isTransientPollError({ status: 404 }), false)
})

// ---- F3: the look's engine is sent ----

test('F3: Avatar 6 engines are known, not collapsed to avatar_iv', () => {
  assert.equal(normalizeAvatarEngine('heygen-avatar-6-turbo'), 'heygen-avatar-6-turbo')
  assert.equal(normalizeAvatarEngine('heygen-avatar-6'), 'heygen-avatar-6')
  assert.equal(normalizeAvatarEngine('avatar_6_pro'), 'heygen-avatar-6')
  assert.equal(normalizeAvatarEngine(''), 'avatar_iv')
  assert.deepEqual(
    getLookSupportedEngines({ supportedApiEngines: ['heygen-avatar-6', 'heygen-avatar-6-turbo'] }),
    ['heygen-avatar-6-turbo', 'heygen-avatar-6']
  )
})

test('F3: an Avatar-6-only look is not legacy and generates with its own engine', () => {
  const look = {
    id: 'look_a6',
    avatar_type: 'studio_avatar',
    supportedApiEngines: ['heygen-avatar-6-turbo'],
    defaultAvatarEngine: 'heygen-avatar-6-turbo',
  }
  assert.equal(isLegacyV2Look(look), false)
  const mapped = mapAvatarLook(look)
  assert.equal(mapped.defaultAvatarEngine, 'heygen-avatar-6-turbo')
  assert.equal(mapped.generatableEngine, 'heygen-avatar-6-turbo')
  // A stale preference (avatar_iv) the look can't render is replaced by the look's engine.
  assert.equal(
    finalizeVideoCreatePayload({
      avatarId: look.id,
      avatarType: 'studio_avatar',
      avatarEngine: 'avatar_iv',
      supportedEngines: mapped.supportedEngines,
      defaultAvatarEngine: mapped.defaultAvatarEngine,
    }),
    'heygen-avatar-6-turbo'
  )
})

test('F3: an Avatar IV look still sends avatar_iv (studio looks are no longer forced to V)', () => {
  const engines = getLookSupportedEngines({ supported_api_engines: ['avatar_iv', 'avatar_v'] })
  assert.equal(
    finalizeVideoCreatePayload({ avatarId: 'l1', avatarType: 'studio_avatar', avatarEngine: 'avatar_iv', supportedEngines: engines }),
    'avatar_iv'
  )
  assert.equal(
    finalizeVideoCreatePayload({ avatarId: 'l1', avatarType: 'photo_avatar', avatarEngine: 'avatar_v', supportedEngines: engines }),
    'avatar_v'
  )
})

test('F3: backend defaultAvatarEngine wins over list order when no choice was made', () => {
  const look = { supportedApiEngines: ['avatar_v', 'heygen-avatar-6'], defaultAvatarEngine: 'heygen-avatar-6' }
  assert.equal(getLookDefaultEngine(look), 'heygen-avatar-6')
})

test('F3: calmer motion only for Avatar 6; badge labels', () => {
  assert.equal(canUseMotionExpressiveness('heygen-avatar-6-turbo'), true)
  assert.equal(canUseMotionExpressiveness('avatar_iv'), false)
  assert.equal(formatAvatarEngineLabel('heygen-avatar-6-turbo'), 'Avatar 6 Turbo')
  assert.equal(formatAvatarEngineLabel('heygen-avatar-6'), 'Avatar 6 Pro')
})
