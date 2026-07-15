// ─────────────────────────────────────────────────────────────────────────────
// Email broadcast templates
//
// The backend already wraps every broadcast with:
//   • A dark header (Virtual Studio logo + title)
//   • A footer (Open VS button, manage preferences, copyright)
//
// Templates here should ONLY contain the middle body content.
// Do NOT add generic "Open the app" / "Get started" CTAs — the footer
// already has "Open Virtual Studio". Only include a CTA when it links
// somewhere specific (e.g. a direct workspace or credits page URL).
// ─────────────────────────────────────────────────────────────────────────────

const BODY = `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#374151`
const DIVIDER = `<div style="height:1px;background:#f3f4f6;margin:28px 0"></div>`

function p(text, extra = '') {
  return `<p style="margin:0 0 16px;${BODY}${extra ? ';' + extra : ''}">${text}</p>`
}

function stepList(items) {
  return `<div style="display:flex;flex-direction:column;gap:8px;margin:20px 0">${
    items.map(([title, desc], i) =>
      `<div style="display:flex;gap:14px;padding:14px 16px;background:#f9fafb;border-radius:8px;border:1px solid #f3f4f6">
        <div style="width:26px;height:26px;background:#111827;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;flex-shrink:0;line-height:1">${i + 1}</div>
        <div><p style="margin:0 0 3px;font-weight:700;font-size:14px;color:#111827">${title}</p><p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5">${desc}</p></div>
      </div>`
    ).join('')
  }</div>`
}

function tipList(items) {
  return `<div style="display:flex;flex-direction:column;gap:6px;margin:20px 0">${
    items.map((tip) =>
      `<div style="display:flex;align-items:flex-start;gap:12px;padding:11px 14px;background:#f9fafb;border-radius:7px;border:1px solid #f3f4f6">
        <span style="color:#111827;font-size:16px;flex-shrink:0;line-height:1.4">→</span>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.55">${tip}</p>
      </div>`
    ).join('')
  }</div>`
}

function grid2(items) {
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0">${
    items.map(([title, desc]) =>
      `<div style="padding:14px;background:#f9fafb;border-radius:8px;border:1px solid #f3f4f6">
        <p style="margin:0 0 4px;font-weight:700;font-size:13px;color:#111827">${title}</p>
        <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.45">${desc}</p>
      </div>`
    ).join('')
  }</div>`
}

function alertBox(lines) {
  return `<div style="background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin:20px 0">${
    lines.map(([label, val]) =>
      `<p style="margin:0 0 6px;font-size:14px;color:#374151"><strong style="color:#111827">${label}:</strong> ${val}</p>`
    ).join('')
  }</div>`
}

// ─────────────────────────────────────────────────────────────────────────────

export const EMAIL_TEMPLATES = [

  // ── 1. Welcome ──────────────────────────────────────────────────────────────
  {
    id: 'welcome',
    label: 'Welcome',
    description: 'Greet new users and walk them through first steps',
    accentColor: '#38bdf8',
    subject: 'Welcome to Virtual Studio 👋',
    html: `<div style="padding:32px 40px;max-width:600px;margin:0 auto">
${p('Hi there,')}
${p('Welcome to Virtual Studio — your AI-powered platform for creating professional avatar videos. We\'re glad you\'re here.')}
${p('Here\'s how to get started:', 'font-weight:600;color:#111827')}
${stepList([
  ['Create your workspace', 'Set up a workspace to organise all your projects and invite collaborators.'],
  ['Pick an avatar & voice', 'Browse the HeyGen avatar library and choose a voice that fits your brand.'],
  ['Build your first video', 'Use the scene editor to write your script, generate your video, and export.'],
])}
${p('If you have any questions, just reply to this email — we\'re always happy to help.', 'font-size:13px;color:#9ca3af;text-align:center')}
</div>`,
  },

  // ── 2. Feature announcement ──────────────────────────────────────────────────
  {
    id: 'announcement',
    label: 'Feature announcement',
    description: 'Launch a new feature or product update',
    accentColor: '#a78bfa',
    subject: '✨ Introducing [Feature Name]',
    html: `<div style="padding:32px 40px;max-width:600px;margin:0 auto">
${p('Hi there,')}
${p('We\'re excited to introduce <strong>[Feature Name]</strong> — [one sentence describing what it does and why it matters].')}
${p('[Add 2–3 sentences expanding on the key benefit. What problem does it solve? What can users do now that they couldn\'t before?]')}
${DIVIDER}
${p('Here\'s what\'s new:', 'font-weight:600;color:#111827;margin-bottom:12px')}
${tipList([
  '[Key benefit or capability #1]',
  '[Key benefit or capability #2]',
  '[Key benefit or capability #3]',
])}
${p('Questions? Just reply to this email — we read every one.', 'font-size:13px;color:#9ca3af;text-align:center')}
</div>`,
  },

  // ── 3. Avatar video tips ─────────────────────────────────────────────────────
  {
    id: 'avatar_tips',
    label: 'Avatar video tips',
    description: 'Help users get better results from AI videos',
    accentColor: '#818cf8',
    subject: 'Tips for better avatar videos on Virtual Studio',
    html: `<div style="padding:32px 40px;max-width:600px;margin:0 auto">
${p('Hi there,')}
${p('A few tips to help you get the best out of avatar video generation on Virtual Studio:')}
${tipList([
  '<strong>Keep scripts concise.</strong> Under 400 words per scene gives the cleanest renders and fastest processing.',
  '<strong>Match voice to content.</strong> Choose a voice tone that aligns with your audience — formal for training, conversational for marketing.',
  '<strong>Split long content into scenes.</strong> Multiple shorter scenes are easier to edit and re-render than one long take.',
  '<strong>Preview before final export.</strong> The in-editor preview catches script issues before you spend render credits.',
  '<strong>Use folders to stay organised.</strong> Group related projects in folders so your workspace stays easy to navigate.',
])}
</div>`,
  },

  // ── 4. Workspace tips ────────────────────────────────────────────────────────
  {
    id: 'workspace_tips',
    label: 'Workspace tips',
    description: 'Help users collaborate and stay organised',
    accentColor: '#22d3ee',
    subject: 'Get more from your Virtual Studio workspace',
    html: `<div style="padding:32px 40px;max-width:600px;margin:0 auto">
${p('Hi there,')}
${p('Your Virtual Studio workspace has features built for teams. Here\'s what\'s available:')}
${grid2([
  ['Invite team members', 'Add colleagues as Owner, Admin, or Member with different permission levels.'],
  ['Shared credit pool', 'Team workspaces share a credit balance across all members.'],
  ['Folder organisation', 'Group projects in folders to keep everything easy to find.'],
  ['Role-based access', 'Control who can view, edit, or manage projects in the workspace.'],
])}
${p('[Add any specific tip or call to action relevant to your team here.]', 'color:#9ca3af;font-size:14px')}
</div>`,
  },

  // ── 5. Maintenance notice ────────────────────────────────────────────────────
  {
    id: 'maintenance',
    label: 'Maintenance notice',
    description: 'Scheduled downtime or service interruption',
    accentColor: '#fb923c',
    subject: 'Scheduled maintenance – [Date]',
    html: `<div style="padding:32px 40px;max-width:600px;margin:0 auto">
${p('Hi there,')}
${p('We have scheduled maintenance coming up. During this window Virtual Studio will be temporarily unavailable. We\'ll keep it as brief as possible.')}
${alertBox([
  ['Date', '[Date, e.g. Tuesday 22 July 2026]'],
  ['Time', '[Start time] – [End time] [Timezone]'],
  ['Expected duration', '[e.g. ~2 hours]'],
  ['Affected services', 'All platform features including rendering, editor, and uploads'],
])}
${p('We recommend saving any open work before the maintenance window begins. You\'ll receive a follow-up email once everything is back online.')}
${p('Sorry for the inconvenience — this work will make the platform faster and more reliable.', 'color:#6b7280;font-size:14px')}
</div>`,
  },

  // ── 6. Blank ─────────────────────────────────────────────────────────────────
  {
    id: 'custom',
    label: 'Blank',
    description: 'Start from a clean slate',
    accentColor: 'var(--text-muted)',
    subject: '',
    html: '',
  },
]
