// Shared blue-purple header gradient used by every template
const HDR = `background:linear-gradient(135deg,#0284c7,#7c3aed);padding:40px 32px;text-align:center`
const BTN = `display:inline-block;background:linear-gradient(135deg,#0284c7,#7c3aed);color:#fff;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:700;font-size:14px`
const WRAP = `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden`
const FOOT = `<div style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center"><p style="margin:0;color:#9ca3af;font-size:12px">You're receiving this because you have an Athena VI account. © Athena VI</p></div>`

function header(title, sub) {
  return `<div style="${HDR}"><h1 style="margin:0;color:#fff;font-size:27px;font-weight:800;letter-spacing:-0.5px">${title}</h1><p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:15px">${sub}</p></div>`
}

function cta(label, url = '[URL]') {
  return `<div style="text-align:center;margin-top:28px"><a href="${url}" style="${BTN}">${label}</a></div>`
}

export const EMAIL_TEMPLATES = [
  // ── 1. Welcome ──────────────────────────────────────────────────────────────
  {
    id: 'welcome',
    label: 'Welcome',
    description: 'Greet new users and walk them through first steps',
    accentColor: '#38bdf8',
    subject: 'Welcome to Athena VI 👋',
    html: `<div style="${WRAP}">${header('Welcome to Athena VI', "We're glad you're here")}
<div style="padding:32px">
<p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6">Hi there,</p>
<p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6">Welcome to Athena VI — your AI-powered virtual instructor platform. Here's how to hit the ground running:</p>
<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:8px">
${[['Create your workspace','Organise all your projects in one place.'],['Pick an avatar &amp; voice','Choose from a library of HeyGen avatars and natural voices.'],['Build your first project','Use the editor to compose scenes and generate your first AI video.']].map(([t,d],i)=>`<div style="display:flex;gap:12px;padding:14px;background:#f8fafc;border-radius:8px"><div style="width:28px;height:28px;background:#dbeafe;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#1d4ed8;flex-shrink:0">${i+1}</div><div><strong style="color:#111827;font-size:14px">${t}</strong><p style="margin:4px 0 0;color:#6b7280;font-size:13px">${d}</p></div></div>`).join('')}
</div>
${cta('Get started','[APP_URL]')}
</div>${FOOT}</div>`,
  },

  // ── 2. Feature announcement ──────────────────────────────────────────────────
  {
    id: 'announcement',
    label: 'Feature announcement',
    description: 'Launch a new feature or product update',
    accentColor: '#a78bfa',
    subject: '✨ Introducing [Feature Name]',
    html: `<div style="${WRAP}">${header('Introducing [Feature Name]','Something new is here')}
<div style="padding:32px">
<p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6">Hi there,</p>
<p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6">We're excited to share <strong>[Feature Name]</strong> — [one sentence description of what it does and why it matters].</p>
<p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6">[Add 2–3 sentences or bullet points about key benefits.]</p>
${cta('Try it now','[CTA_URL]')}
<p style="margin:24px 0 0;color:#6b7280;font-size:14px;line-height:1.6">Questions? Just reply to this email.</p>
</div>${FOOT}</div>`,
  },

  // ── 3. Avatar video tips ─────────────────────────────────────────────────────
  {
    id: 'avatar_tips',
    label: 'Avatar video tips',
    description: 'Help users create better AI videos',
    accentColor: '#818cf8',
    subject: 'Get the most out of your Athena VI avatar videos',
    html: `<div style="${WRAP}">${header('Create Better Avatar Videos','Tips to get the best results')}
<div style="padding:32px">
<p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6">Hi there,</p>
<p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6">Here are a few tips to help you get the most out of avatar video generation on Athena VI:</p>
<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:8px">
${['Keep scripts under 500 words per scene for faster renders','Choose a voice that matches your brand tone','Use the scene editor to split long content into multiple scenes','Preview renders before final export to catch issues early','Organise projects in folders to keep your workspace tidy'].map((tip,i)=>`<div style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:#f8fafc;border-radius:8px;border-left:3px solid #6366f1"><span style="color:#6366f1;font-weight:800;font-size:13px;flex-shrink:0">${i+1}</span><p style="margin:0;color:#374151;font-size:14px;line-height:1.5">${tip}</p></div>`).join('')}
</div>
${cta('Open the editor','[APP_URL]')}
</div>${FOOT}</div>`,
  },

  // ── 5. Workspace tips ────────────────────────────────────────────────────────
  {
    id: 'workspace_tips',
    label: 'Workspace tips',
    description: 'Help users collaborate and stay organised',
    accentColor: '#22d3ee',
    subject: 'Make the most of your Athena VI workspace',
    html: `<div style="${WRAP}">${header('Your Workspace, Your Way','Collaborate and create at scale')}
<div style="padding:32px">
<p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6">Hi there,</p>
<p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6">Did you know your Athena VI workspace has powerful collaboration features? Here's what you can do:</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px">
${[['Invite team members','Add colleagues as Owner, Admin, or Member.'],['Shared credit pool','Team workspaces share a credit balance.'],['Folder organisation','Group projects in nested folders.'],['Role-based access','Control who can edit or view projects.']].map(([t,d])=>`<div style="padding:14px;background:#f8fafc;border-radius:8px;border:1px solid #e5e7eb"><p style="margin:0 0 4px;font-weight:700;color:#111827;font-size:13px">${t}</p><p style="margin:0;color:#6b7280;font-size:12px;line-height:1.4">${d}</p></div>`).join('')}
</div>
${cta('Go to workspace','[WORKSPACE_URL]')}
</div>${FOOT}</div>`,
  },

  // ── 6. Maintenance ───────────────────────────────────────────────────────────
  {
    id: 'maintenance',
    label: 'Maintenance notice',
    description: 'Scheduled downtime or service interruption',
    accentColor: '#fb923c',
    subject: 'Scheduled maintenance – [Date]',
    html: `<div style="${WRAP}">${header('Scheduled Maintenance','Brief downtime coming up')}
<div style="padding:32px">
<p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6">Hi there,</p>
<p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6">We have scheduled maintenance coming up. During this window Athena VI will be temporarily unavailable.</p>
<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px 20px;margin-bottom:20px">
<p style="margin:0 0 7px;color:#9a3412;font-size:14px"><strong>Date:</strong> [Date]</p>
<p style="margin:0 0 7px;color:#9a3412;font-size:14px"><strong>Time:</strong> [Start] – [End] [Timezone]</p>
<p style="margin:0;color:#9a3412;font-size:14px"><strong>Expected duration:</strong> [Duration]</p>
</div>
<p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6">We recommend saving your work beforehand. We'll send a follow-up once maintenance is complete.</p>
</div>${FOOT}</div>`,
  },

  // ── 7. Blank ─────────────────────────────────────────────────────────────────
  {
    id: 'custom',
    label: 'Blank',
    description: 'Start from a clean slate',
    accentColor: 'var(--text-muted)',
    subject: '',
    html: '',
  },
]
