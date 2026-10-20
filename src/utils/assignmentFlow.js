/**
 * Project / scene / slide assignee flows.
 * Workflow tags only — they never change who can open or edit.
 * Dedicated assignee endpoints only; do not piggyback onto generic PATCH bodies.
 */

/** TEAM OWNER/ADMIN only. Personal workspaces and MEMBER cannot assign. */
export function canManageAssignment(workspace) {
  const role = String(workspace?.userRole || '').toUpperCase()
  return workspace?.type === 'workspace' && (role === 'OWNER' || role === 'ADMIN')
}

export function assignmentRequest(assigneeId) {
  return { assigneeId: assigneeId ?? null }
}

export function currentAssigneeId(entity) {
  return entity?.assignee?.id || entity?.assignedToId || null
}

export function resolveMemberUserId(member) {
  if (!member || typeof member !== 'object') return null
  return member.userId || member.user?.id || member.user?._id || member.id || null
}

export function optimisticAssigneeFromMembers(members, userId) {
  if (!userId) return null
  const member = (members || []).find((m) => resolveMemberUserId(m) === userId)
  if (!member) return null
  if (member.user && typeof member.user === 'object') return member.user
  return {
    id: resolveMemberUserId(member),
    name: member.name || null,
    email: member.email || null,
  }
}

export function applyAssigneePatch(list, id, patch) {
  return (list || []).map((item) => (item.id === id ? { ...item, ...patch } : item))
}

export function beginAssignSlide(slides, slideId, assigneeId, members) {
  const previous = (slides || []).find((s) => s.id === slideId)
  const previousAssignee = previous?.assignee ?? null
  const optimistic = assigneeId
    ? optimisticAssigneeFromMembers(members, assigneeId) || previousAssignee
    : null
  return {
    previousAssignee,
    slides: applyAssigneePatch(slides, slideId, { assignee: optimistic }),
  }
}

export function rollbackAssignSlide(slides, slideId, previousAssignee) {
  return applyAssigneePatch(slides, slideId, { assignee: previousAssignee })
}

export function finishAssignSlide(slides, slideId, assigneeId, optimisticUser) {
  return applyAssigneePatch(slides, slideId, {
    assignee: assigneeId ? optimisticUser : null,
    assignedBy: null,
    assignedAt: null,
  })
}

export function sceneAssigneePatch(updatedScene) {
  return {
    assignee: updatedScene?.assignee ?? null,
    assignedBy: updatedScene?.assignedBy ?? null,
    assignedAt: updatedScene?.assignedAt ?? null,
  }
}

export async function executeAssignProject({
  updateProjectAssignee,
  workspaceId,
  projectId,
  assigneeId,
} = {}) {
  if (!workspaceId || !projectId) {
    const error = new Error('Missing workspace or project')
    error.skipped = true
    throw error
  }
  return updateProjectAssignee(workspaceId, projectId, assigneeId ?? null)
}

export async function executeAssignScene({
  updateSceneAssignee,
  workspaceId,
  projectId,
  sceneId,
  assigneeId,
} = {}) {
  if (!workspaceId || !projectId || !sceneId) {
    const error = new Error('Missing workspace, project or scene')
    error.skipped = true
    throw error
  }
  const updated = await updateSceneAssignee(workspaceId, projectId, sceneId, assigneeId ?? null)
  return sceneAssigneePatch(updated)
}

export async function executeAssignSlide({
  updateSlideAssignee,
  workspaceId,
  presentationId,
  slideId,
  assigneeId,
  slides = [],
  members = [],
} = {}) {
  if (!workspaceId || !presentationId || !slideId) {
    const error = new Error('Missing workspace, presentation or slide')
    error.skipped = true
    throw error
  }
  const started = beginAssignSlide(slides, slideId, assigneeId, members)
  try {
    const result = await updateSlideAssignee(
      workspaceId,
      presentationId,
      slideId,
      assigneeId ?? null
    )
    return { ...started, result, rolledBack: false }
  } catch (err) {
    err.rolledBackSlides = rollbackAssignSlide(started.slides, slideId, started.previousAssignee)
    throw err
  }
}
