import { Fragment } from 'react'

function matchClosedInline(text, i) {
  const rest = text.slice(i)

  if (rest.startsWith('***')) {
    const end = text.indexOf('***', i + 3)
    if (end > i + 3) {
      return { type: 'strong-em', value: text.slice(i + 3, end), next: end + 3 }
    }
  }

  if (rest.startsWith('**')) {
    const end = text.indexOf('**', i + 2)
    if (end > i + 2) {
      return { type: 'strong', value: text.slice(i + 2, end), next: end + 2 }
    }
  }

  if (rest.startsWith('__')) {
    const end = text.indexOf('__', i + 2)
    if (end > i + 2) {
      return { type: 'strong', value: text.slice(i + 2, end), next: end + 2 }
    }
  }

  if (rest.startsWith('~~')) {
    const end = text.indexOf('~~', i + 2)
    if (end > i + 2) {
      return { type: 'strike', value: text.slice(i + 2, end), next: end + 2 }
    }
  }

  if (rest.startsWith('`')) {
    const end = text.indexOf('`', i + 1)
    if (end > i + 1) {
      return { type: 'code', value: text.slice(i + 1, end), next: end + 1 }
    }
  }

  if (rest[0] === '*' && rest[1] !== '*') {
    const end = text.indexOf('*', i + 1)
    if (end > i + 1 && text[end + 1] !== '*') {
      return { type: 'em', value: text.slice(i + 1, end), next: end + 1 }
    }
  }

  if (rest[0] === '_' && rest[1] !== '_' && (i === 0 || /[^A-Za-z0-9]/.test(text[i - 1]))) {
    const end = text.indexOf('_', i + 1)
    if (end > i + 1 && text[end + 1] !== '_') {
      return { type: 'em', value: text.slice(i + 1, end), next: end + 1 }
    }
  }

  if (rest[0] === '[') {
    const close = text.indexOf('](', i)
    const urlEnd = close !== -1 ? text.indexOf(')', close + 2) : -1
    if (close > i + 1 && urlEnd > close + 2) {
      return {
        type: 'link',
        value: text.slice(i + 1, close),
        href: text.slice(close + 2, urlEnd),
        next: urlEnd + 1,
      }
    }
  }

  return null
}

export function parseInlineTokens(text) {
  const tokens = []
  let i = 0
  let buf = ''
  const flush = () => {
    if (!buf) return
    tokens.push({ type: 'text', value: buf })
    buf = ''
  }
  while (i < text.length) {
    const hit = matchClosedInline(text, i)
    if (hit) {
      flush()
      tokens.push(hit)
      i = hit.next
      continue
    }
    buf += text[i]
    i += 1
  }
  flush()
  return tokens
}

function tokenToReact(token, key) {
  if (token.type === 'text') return <Fragment key={key}>{token.value}</Fragment>
  if (token.type === 'strong-em') {
    return (
      <strong key={key} className="aig-md-strong">
        <em className="aig-md-em">{token.value}</em>
      </strong>
    )
  }
  if (token.type === 'strong') {
    return (
      <strong key={key} className="aig-md-strong">
        {token.value}
      </strong>
    )
  }
  if (token.type === 'em') {
    return (
      <em key={key} className="aig-md-em">
        {token.value}
      </em>
    )
  }
  if (token.type === 'strike') {
    return (
      <s key={key} className="aig-md-strike">
        {token.value}
      </s>
    )
  }
  if (token.type === 'code') {
    return (
      <code key={key} className="aig-md-code">
        {token.value}
      </code>
    )
  }
  if (token.type === 'link') {
    return (
      <span key={key} className="aig-md-link">
        {token.value}
      </span>
    )
  }
  return null
}

function lineToReact(line, lineKey) {
  const heading = line.match(/^(#{1,6})\s+(.*)$/)
  if (heading) {
    return (
      <span key={lineKey} className={`aig-md-h aig-md-h${heading[1].length}`}>
        {parseInlineTokens(heading[2]).map((t, i) => tokenToReact(t, `${lineKey}-h-${i}`))}
      </span>
    )
  }
  const quote = line.match(/^>\s?(.*)$/)
  if (quote) {
    return (
      <span key={lineKey} className="aig-md-quote">
        {parseInlineTokens(quote[1]).map((t, i) => tokenToReact(t, `${lineKey}-q-${i}`))}
      </span>
    )
  }
  const list = line.match(/^([-*+]|\d+\.)\s+(.*)$/)
  if (list) {
    return (
      <span key={lineKey} className="aig-md-li">
        <span className="aig-md-bullet">{list[1]} </span>
        {parseInlineTokens(list[2]).map((t, i) => tokenToReact(t, `${lineKey}-li-${i}`))}
      </span>
    )
  }
  return parseInlineTokens(line).map((t, i) => tokenToReact(t, `${lineKey}-${i}`))
}

/** Read-only preview: closed markdown renders without showing the markers. */
export function highlightMarkdownSource(text) {
  if (!text) return null
  const lines = String(text).split('\n')
  return lines.map((line, i) => (
    <Fragment key={`ln-${i}`}>
      {i > 0 ? '\n' : null}
      {lineToReact(line, `ln-${i}`)}
    </Fragment>
  ))
}

const TAG_FOR = {
  strong: 'strong',
  em: 'em',
  strike: 's',
  code: 'code',
  link: 'span',
}

function appendTokenDom(parent, token) {
  const doc = parent.ownerDocument
  if (token.type === 'text') {
    parent.appendChild(doc.createTextNode(token.value))
    return
  }
  if (token.type === 'strong-em') {
    const strong = doc.createElement('strong')
    strong.dataset.md = 'strong-em'
    strong.className = 'aig-md-strong'
    const em = doc.createElement('em')
    em.className = 'aig-md-em'
    em.textContent = token.value
    strong.appendChild(em)
    parent.appendChild(strong)
    return
  }
  const el = doc.createElement(TAG_FOR[token.type] || 'span')
  el.dataset.md = token.type
  el.className = `aig-md-${token.type}`
  el.textContent = token.value
  if (token.type === 'link' && token.href) el.setAttribute('data-href', token.href)
  parent.appendChild(el)
}

export function appendInlineDom(parent, text) {
  for (const token of parseInlineTokens(text)) {
    appendTokenDom(parent, token)
  }
}

function appendLineDom(parent, line) {
  const doc = parent.ownerDocument
  const heading = line.match(/^(#{1,6})\s+(.*)$/)
  if (heading) {
    const el = doc.createElement('span')
    el.dataset.md = 'heading'
    el.dataset.level = String(heading[1].length)
    el.className = `aig-md-h aig-md-h${heading[1].length}`
    appendInlineDom(el, heading[2])
    parent.appendChild(el)
    return
  }
  const quote = line.match(/^>\s?(.*)$/)
  if (quote) {
    const el = doc.createElement('span')
    el.dataset.md = 'quote'
    el.className = 'aig-md-quote'
    appendInlineDom(el, quote[1])
    parent.appendChild(el)
    return
  }
  const list = line.match(/^([-*+]|\d+\.)\s+(.*)$/)
  if (list) {
    const el = doc.createElement('span')
    el.dataset.md = 'li'
    el.dataset.bullet = list[1]
    el.className = 'aig-md-li'
    const bullet = doc.createElement('span')
    bullet.className = 'aig-md-bullet'
    bullet.textContent = `${list[1]} `
    el.appendChild(bullet)
    appendInlineDom(el, list[2])
    parent.appendChild(el)
    return
  }
  appendInlineDom(parent, line)
}

export function applyMarkdownToEditor(root, md) {
  if (!root) return
  const doc = root.ownerDocument
  root.replaceChildren()
  const lines = String(md || '').split('\n')
  lines.forEach((line, i) => {
    if (i > 0) root.appendChild(doc.createElement('br'))
    appendLineDom(root, line)
  })
}

export function createMarkdownFragment(doc, md) {
  const holder = doc.createElement('div')
  applyMarkdownToEditor(holder, md)
  const frag = doc.createDocumentFragment()
  while (holder.firstChild) frag.appendChild(holder.firstChild)
  return frag
}

export function foldUnformattedTextNodes(root) {
  if (!root) return
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  for (const node of nodes) {
    if (!root.contains(node)) continue
    if (node.parentElement?.closest('[data-md]')) continue
    const text = node.textContent || ''
    if (!parseInlineTokens(text).some((token) => token.type !== 'text')) continue
    const holder = node.ownerDocument.createElement('span')
    appendInlineDom(holder, text)
    const frag = node.ownerDocument.createDocumentFragment()
    while (holder.firstChild) frag.appendChild(holder.firstChild)
    node.parentNode.replaceChild(frag, node)
  }
}

export function serializeEditorToMarkdown(root) {
  if (!root) return ''
  let out = ''

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent || ''
      return
    }
    if (node.nodeName === 'BR') {
      out += '\n'
      return
    }
    const md = node.dataset?.md
    const inner = node.textContent || ''
    if (md === 'strong-em') {
      out += `***${inner}***`
      return
    }
    if (md === 'heading') {
      out += `${'#'.repeat(Number(node.dataset.level) || 1)} `
      Array.from(node.childNodes).forEach(walk)
      return
    }
    if (md === 'quote') {
      out += '> '
      Array.from(node.childNodes).forEach(walk)
      return
    }
    if (md === 'li') {
      out += `${node.dataset.bullet || '-'} `
      Array.from(node.childNodes).forEach((child) => {
        if (child.classList?.contains('aig-md-bullet')) return
        walk(child)
      })
      return
    }
    if (md === 'strong') {
      out += `**${inner}**`
      return
    }
    if (md === 'em') {
      out += `*${inner}*`
      return
    }
    if (md === 'strike') {
      out += `~~${inner}~~`
      return
    }
    if (md === 'code') {
      out += `\`${inner}\``
      return
    }
    if (md === 'link') {
      const href = node.getAttribute('data-href') || ''
      out += `[${inner}](${href})`
      return
    }
    if (node.nodeName === 'DIV' || node.nodeName === 'P') {
      if (out && !out.endsWith('\n')) out += '\n'
    }
    Array.from(node.childNodes).forEach(walk)
  }

  Array.from(root.childNodes).forEach(walk)
  return out.replace(/\u00a0/g, ' ')
}

const FOLD_RULES = [
  { re: /\*\*([^*]+)\*\*$/, type: 'strong' },
  { re: /__([^_]+)__$/, type: 'strong' },
  { re: /~~([^~]+)~~$/, type: 'strike' },
  { re: /`([^`]+)`$/, type: 'code' },
  { re: /(?<!\*)\*([^*]+)\*$/, type: 'em' },
  { re: /(?<!_)_([^_]+)_$/, type: 'em' },
]

function placeCaretAfter(node) {
  const sel = node.ownerDocument.defaultView.getSelection()
  const range = node.ownerDocument.createRange()
  range.setStartAfter(node)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

export function placeCaretAtEnd(root) {
  if (!root) return
  const sel = root.ownerDocument.defaultView.getSelection()
  const range = root.ownerDocument.createRange()
  range.selectNodeContents(root)
  range.collapse(false)
  sel.removeAllRanges()
  sel.addRange(range)
}

export function foldClosedMarkdownAtCaret(root) {
  const sel = root.ownerDocument.defaultView.getSelection()
  if (!sel?.rangeCount) return false
  const range = sel.getRangeAt(0)
  if (!range.collapsed) return false
  const node = range.startContainer
  if (node.nodeType !== Node.TEXT_NODE) return false
  if (!root.contains(node)) return false
  if (node.parentElement?.closest('[data-md]')) return false

  const offset = range.startOffset
  const text = node.textContent || ''
  const before = text.slice(0, offset)
  const after = text.slice(offset)

  for (const rule of FOLD_RULES) {
    const match = before.match(rule.re)
    if (!match) continue
    const full = match[0]
    const inner = match[1]
    const start = offset - full.length
    if (start < 0 || !inner) continue

    node.textContent = before.slice(0, start)
    const el = root.ownerDocument.createElement(TAG_FOR[rule.type])
    el.dataset.md = rule.type
    el.className = `aig-md-${rule.type}`
    el.textContent = inner
    const parent = node.parentNode
    const next = node.nextSibling
    parent.insertBefore(el, next)
    if (after) parent.insertBefore(root.ownerDocument.createTextNode(after), el.nextSibling)
    if (!node.textContent) parent.removeChild(node)
    placeCaretAfter(el)
    return true
  }
  return false
}
