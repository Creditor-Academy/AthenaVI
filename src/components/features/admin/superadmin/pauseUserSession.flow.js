import { executePauseUser } from './userLifecycle.js'

const SESSION_EXPIRED = { status: 401, message: 'Session expired' }
const ACCOUNT_PAUSED = { status: 403, message: 'Your account has been paused. Please contact support.' }

/**
 * In-memory stand-in for pause → logoutAllDevices → auth middleware / login.
 * Live Redis session is gone (401). Paused user cannot sign in (403).
 */
export function createPausedSessionWorld(target) {
  const user = {
    id: target.id,
    email: target.email,
    name: target.name,
    isPlatformSuperadmin: Boolean(target.isPlatformSuperadmin),
    pausedAt: target.pausedAt || null,
    pauseReason: target.pauseReason || null,
  }
  const sessions = new Map()

  function issueSession() {
    const sessionId = `sess_${user.id}`
    sessions.set(user.id, new Set([sessionId]))
    return sessionId
  }

  async function pauseUser(userId, payload) {
    if (userId !== user.id) throw new Error('User not found')
    user.pausedAt = new Date().toISOString()
    user.pauseReason = payload?.reason || null
    sessions.delete(userId)
    return { user: { ...user } }
  }

  function requestWithSession(sessionId) {
    const live = sessions.get(user.id)
    if (!live || !live.has(sessionId)) {
      const error = new Error(SESSION_EXPIRED.message)
      error.status = SESSION_EXPIRED.status
      throw error
    }
    if (user.pausedAt) {
      const error = new Error(ACCOUNT_PAUSED.message)
      error.status = ACCOUNT_PAUSED.status
      throw error
    }
    return { ok: true }
  }

  function login() {
    if (user.pausedAt) {
      const error = new Error(ACCOUNT_PAUSED.message)
      error.status = ACCOUNT_PAUSED.status
      throw error
    }
    return issueSession()
  }

  function clearClientAuth(auth) {
    auth.accessToken = null
    auth.user = null
    return auth
  }

  return { user, sessions, issueSession, pauseUser, requestWithSession, login, clearClientAuth }
}

/**
 * Admin pause control → target's live session dies → they cannot keep working or sign in.
 */
export async function runPauseUserSessionDies({
  world,
  target,
  currentUserId,
  reason,
  auth = { accessToken: 'live', user: { id: target.id } },
} = {}) {
  const sessionId = world.issueSession()
  const before = world.requestWithSession(sessionId)

  const paused = await executePauseUser({
    pauseUser: world.pauseUser,
    user: target,
    reason,
    currentUserId,
  })

  let nextRequest
  try {
    world.requestWithSession(sessionId)
    nextRequest = { ok: true }
  } catch (err) {
    nextRequest = { status: err.status, message: err.message }
    world.clearClientAuth(auth)
  }

  let nextLogin
  try {
    world.login()
    nextLogin = { ok: true }
  } catch (err) {
    nextLogin = { status: err.status, message: err.message }
  }

  return { before, paused, nextRequest, nextLogin, auth }
}
