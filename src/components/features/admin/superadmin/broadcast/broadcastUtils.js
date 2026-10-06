export function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function statusColor(status) {
  const s = (status || '').toLowerCase()
  if (s === 'sent' || s === 'completed') return '#4ade80'
  if (s === 'failed') return '#f87171'
  if (s === 'sending') return '#38bdf8'
  return 'var(--text-muted)'
}

export function generateDesignHtml({
  headline = '',
  bannerUrl = '',
  greeting = 'Hi there,',
  bodyText = '',
  highlights = [],
  ctaText = '',
  ctaUrl = '',
  ctaColor = '#111827',
  footerNote = ''
}) {
  const bodyStyle = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#374151"

  let html = ''

  if (bannerUrl && bannerUrl.trim()) {
    html += `<div style="margin:0 0 20px;border-radius:8px;overflow:hidden"><img src="${bannerUrl.trim()}" alt="Banner" style="width:100%;max-height:240px;object-fit:cover;display:block" /></div>`
  }

  if (headline && headline.trim()) {
    html += `<h2 style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#111827;line-height:1.3">${headline.trim()}</h2>`
  }

  if (greeting && greeting.trim()) {
    html += `<p style="margin:0 0 12px;${bodyStyle}">${greeting.trim()}</p>`
  }

  if (bodyText && bodyText.trim()) {
    const paragraphs = bodyText.split('\n').filter(Boolean)
    paragraphs.forEach((para) => {
      html += `<p style="margin:0 0 14px;${bodyStyle}">${para}</p>`
    })
  }

  if (highlights && highlights.length > 0) {
    const validHighlights = highlights.filter(h => h.title || h.desc)
    if (validHighlights.length > 0) {
      html += `<div style="display:flex;flex-direction:column;gap:10px;margin:22px 0">`
      validHighlights.forEach((item, i) => {
        html += `<div style="display:flex;gap:12px;padding:12px 14px;background:#f9fafb;border-radius:8px;border:1px solid #f3f4f6">
          <div style="width:24px;height:24px;background:#111827;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;line-height:1">${i + 1}</div>
          <div>
            ${item.title ? `<p style="margin:0 0 2px;font-weight:700;font-size:14px;color:#111827">${item.title}</p>` : ''}
            ${item.desc ? `<p style="margin:0;font-size:13px;color:#6b7280;line-height:1.4">${item.desc}</p>` : ''}
          </div>
        </div>`
      })
      html += `</div>`
    }
  }

  if (ctaText && ctaText.trim() && ctaUrl && ctaUrl.trim()) {
    html += `<div style="margin:24px 0 20px;text-align:center">
      <a href="${ctaUrl.trim()}" style="display:inline-block;background:${ctaColor || '#111827'};color:#ffffff;font-size:14px;font-weight:600;padding:12px 26px;border-radius:8px;text-decoration:none;letter-spacing:0.02em" target="_blank">
        ${ctaText.trim()} →
      </a>
    </div>`
  }

  if (footerNote && footerNote.trim()) {
    html += `<div style="height:1px;background:#f3f4f6;margin:22px 0 16px"></div>
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5">${footerNote.trim()}</p>`
  }

  return html
}
