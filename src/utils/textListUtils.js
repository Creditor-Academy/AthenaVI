/** Supported canvas text list marker styles */
export const TEXT_LIST_TYPES = ['bullet', 'numbered', 'star', 'check', 'dash']

const LIST_MARKER_PREFIX =
  /^\s*(?:•|·|●|○|◦|▪|▫|★|☆|✓|✔|✗|–|—|-|\*|\d+[.)])\s+/

export function splitTextLines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
}

export function stripLeadingListMarkers(text) {
  return splitTextLines(text)
    .map((line) => line.replace(LIST_MARKER_PREFIX, ''))
    .join('\n')
}

export function getListMarker(listType, index) {
  switch (listType) {
    case 'numbered':
      return `${index + 1}.`
    case 'star':
      return '★'
    case 'check':
      return '✓'
    case 'dash':
      return '–'
    case 'bullet':
    default:
      return '•'
  }
}
