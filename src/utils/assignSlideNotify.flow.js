import { executeAssignSlide } from './assignmentFlow.js'
import {
  countUnreadUserFacingInboxNotifications,
  filterUserFacingInboxNotifications,
} from './inboxNotifications.js'
import { buildSlideAssignmentMetadata } from './slideAssignmentNotify.js'

/**
 * OWNER assigns a slide → dedicated PATCH → assignee inbox gets SLIDE_ASSIGNED.
 * Mirrors backend notifySlideAssigned; inject `api` (no live network).
 */
export async function runAssignSlideNotifyPath({
  api,
  workspaceId,
  presentationId,
  slideId,
  actor,
  assigneeId,
  slides,
  members,
  inbox,
} = {}) {
  const assign = await executeAssignSlide({
    updateSlideAssignee: api.updateSlideAssignee,
    workspaceId,
    presentationId,
    slideId,
    assigneeId,
    slides,
    members,
  })

  const slide = assign.result?.slide || { id: slideId, assignedToId: assigneeId, order: 0 }
  const project = api.project
  const workspace = api.workspace
  const item = {
    id: `n_${slideId}`,
    userId: assigneeId,
    type: 'SLIDE_ASSIGNED',
    category: 'collaboration',
    title: `${actor?.name || 'Someone'} assigned you Slide ${(slide.order || 0) + 1} in ${project?.name || 'a presentation'}`,
    message: `You were assigned a slide of "${project?.name}" in ${workspace?.name}.`,
    readAt: null,
    metadata: {
      ...buildSlideAssignmentMetadata({ slide, project, workspace, actor, frontendUrl: api.frontendUrl }),
      audience: 'assignee',
    },
  }
  inbox.push(item)

  const visible = filterUserFacingInboxNotifications(inbox.filter((n) => n.userId === assigneeId))
  return {
    assign,
    inboxItem: item,
    visible,
    unread: countUnreadUserFacingInboxNotifications(visible),
  }
}
