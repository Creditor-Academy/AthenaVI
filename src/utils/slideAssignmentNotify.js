/** Deep-link metadata for SLIDE_ASSIGNED — keep in sync with backend slideAssignment.js */

export function buildSlideAssignmentMetadata({
  slide,
  project,
  workspace,
  actor,
  frontendUrl = '',
} = {}) {
  const workspaceId = project?.workspaceId || workspace?.id
  const presentationId = project?.id
  const metadata = {
    workspaceId,
    workspaceName: workspace?.name || null,
    presentationId,
    projectId: presentationId,
    projectType: 'PRESENTATION',
    projectName: project?.name || 'Untitled',
    slideId: slide?.id,
    slideOrder: slide?.order != null ? slide.order + 1 : null,
    assignedByUserId: actor?.id || null,
    assignedByName: actor?.name || 'Someone',
  }

  if (workspaceId && presentationId && slide?.id) {
    metadata.actionUrl = `${frontendUrl}/workspaces/${workspaceId}/presentations/${presentationId}?slide=${slide.id}`
  }

  return metadata
}
