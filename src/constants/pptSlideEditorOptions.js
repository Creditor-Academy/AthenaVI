export const PPT_SLIDE_TRANSITIONS = [
  { id: 'none', label: 'None' },
  { id: 'continuity', label: 'Continuity' },
  { id: 'fade', label: 'Fade' },
  { id: 'slide-left', label: 'Slide left' },
  { id: 'slide-right', label: 'Slide right' },
  { id: 'slide-up', label: 'Slide up' },
  { id: 'slide-down', label: 'Slide down' },
]

export const PPT_PROGRESS_STATUSES = [
  {
    id: null,
    label: 'None',
    code: 'NONE',
    hint: 'No workflow mark on this slide',
  },
  {
    id: 'TODO',
    label: 'Todo',
    code: 'TODO',
    hint: 'Needs work or review',
  },
  {
    id: 'IN_PROGRESS',
    label: 'In progress',
    code: 'IN_PROGRESS',
    hint: 'Someone is actively editing',
  },
  {
    id: 'COMPLETED',
    label: 'Completed',
    code: 'COMPLETED',
    hint: 'Ready for the next stage',
  },
]

export const PPT_SLIDE_STATUSES = PPT_PROGRESS_STATUSES

/** Canonical workflow progress: null | TODO | IN_PROGRESS | COMPLETED */
export function normalizeProgressStatus(value) {
  if (value == null || value === '' || value === 'none' || value === 'NONE' || value === 'null') {
    return null
  }
  const raw = String(value).trim()
  const upper = raw.toUpperCase().replace(/-/g, '_')
  if (upper === 'TODO') return 'TODO'
  if (upper === 'IN_PROGRESS' || upper === 'INPROGRESS') return 'IN_PROGRESS'
  if (upper === 'COMPLETED' || upper === 'DONE') return 'COMPLETED'
  const lower = raw.toLowerCase()
  if (lower === 'todo') return 'TODO'
  if (lower === 'in-progress' || lower === 'in_progress') return 'IN_PROGRESS'
  if (lower === 'done' || lower === 'completed') return 'COMPLETED'
  return null
}

/** Read progress from slide row (API) or legacy contributorStatus fields. */
export function resolveSlideProgressStatus(slide) {
  if (!slide || typeof slide !== 'object') return null
  if (Object.prototype.hasOwnProperty.call(slide, 'progressStatus')) {
    return normalizeProgressStatus(slide.progressStatus)
  }
  return normalizeProgressStatus(
    slide.contributorStatus ||
      slide.slideStatus ||
      slide.elements?.progressStatus ||
      slide.elements?.contributorStatus
  )
}

export function progressStatusLabel(status) {
  const key = normalizeProgressStatus(status)
  return PPT_PROGRESS_STATUSES.find((o) => o.id === key)?.label || 'None'
}

export function progressStatusDotClass(status) {
  return normalizeProgressStatus(status) || 'NONE'
}
