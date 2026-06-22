export const helpCategories = [
  { id: 'start', label: 'Getting Started', subtitle: 'Dashboard layout, first project, and where things live in AthenaVI.' },
  { id: 'workspace', label: 'Workspaces & Projects', subtitle: 'Personal vs team workspaces, folders, credits, exports, and collaboration.' },
  { id: 'editor', label: 'Editor & Export', subtitle: 'Scenes, inserts, AI presenters, saving, and final MP4 renders.' },
  { id: 'assets', label: 'Library & Assets', subtitle: 'Uploads, stock media, storage quota, and workspace asset rules.' },
  { id: 'presenters', label: 'Avatars & Voices', subtitle: 'AI presenters, voice design, cloning, and narration.' },
  { id: 'billing', label: 'Credits & Storage', subtitle: 'Credit pools, transfers, storage footprint, and billing settings.' },
  { id: 'contact', label: 'Contact Support', subtitle: 'Email our team or save a support note locally until ticketing is connected.' },
]

export const helpArticles = {
  start: [
    {
      title: 'Navigate the dashboard',
      readTime: '2 min',
      tag: 'Beginner',
      body: `The left sidebar is your home base:

• **Home** — quick actions and recent activity
• **Workspace** — folders and video projects
• **My videos** — completed final exports (not drafts)
• **Library** — workspace images, video, and audio uploads
• **Avatars / Voices** — manage AI presenters and narration
• **Settings** — appearance, security, and billing

The storage meter at the bottom of the sidebar shows your account quota. Open **Settings → Billing** for the full breakdown.`,
    },
    {
      title: 'Create your first video project',
      readTime: '3 min',
      tag: 'Beginner',
      body: `1. Click **Create Video** from Home or Workspace.
2. Pick a **workspace** and optional folder.
3. Choose a template or start blank — you land in the **editor**.
4. Add scenes, insert media, and configure an AI presenter if needed.
5. **Save** the project to the workspace, then **Export / Download** when ready.

Projects stay in **Workspace → Folders**. Finished MP4 renders appear under **My videos** and the workspace **Exports** tab.`,
    },
    {
      title: 'Personal vs team workspaces',
      readTime: '3 min',
      tag: 'Beginner',
      body: `**Private (personal) workspace** — only you can access projects and uploads.

**Team workspace** — members share folders and projects. The **owner** holds the credit pool and storage quota. Members can create and export depending on role (Owner, Admin, Member).

Team owners can open **Credits & Usage** inside a workspace to review pool balance and per-member usage.`,
    },
  ],
  workspace: [
    {
      title: 'Folders and video projects',
      readTime: '3 min',
      tag: 'Beginner',
      body: `Inside **Workspace**, open a workspace to see its folders. Each folder holds **video projects** (editable timelines), not final MP4 files.

Use the row/tile toggle and sort controls at the top. Click a project to open it in the editor.`,
    },
    {
      title: 'Team Videos / My Videos (exports tab)',
      readTime: '2 min',
      tag: 'Reference',
      body: `Inside a workspace, open the **My Videos** or **Team Videos** tab to see **completed final renders** for that workspace.

• Owners see **My Videos** — exports count toward their storage.
• Members see **Team Videos** — same list; **Rendered by** shows who triggered the export.

The dashboard **My videos** page aggregates exports across workspaces you own.`,
    },
    {
      title: 'Invite members and roles',
      readTime: '4 min',
      tag: 'Intermediate',
      body: `Team workspace owners can invite collaborators by email and assign **Owner**, **Admin**, or **Member**.

Admins and owners can manage contributors. Members can work in shared folders when permitted. Credits for renders in a team workspace are drawn from the **workspace pool** allocated by the owner.`,
    },
    {
      title: 'Move and organize projects',
      readTime: '2 min',
      tag: 'Tips',
      body: `From a folder, use project actions to rename, move between folders, or delete. Deleting a project removes the editable timeline — it does not automatically remove past export files from **My videos** until those renders are cleaned up separately.`,
    },
  ],
  editor: [
    {
      title: 'Scenes and the timeline',
      readTime: '4 min',
      tag: 'Beginner',
      body: `Each project is built from **scenes**. Select a scene in the strip to edit its canvas.

Add layers with **Insert** — images, video, text, graphics, or uploads. Drag image layers onto the canvas or into frames. Use undo/redo and zoom controls in the top bar.`,
    },
    {
      title: 'Uploads in the editor',
      readTime: '3 min',
      tag: 'Beginner',
      body: `Use **Insert → Upload** to add files from your device. Uploads are saved to the **workspace** when the project is tied to one.

Supported types: JPEG, PNG, WebP, MP4, MP3 (max **50 MB** per file). The editor stores **asset IDs** in project JSON — not raw S3 URLs — so assets stay linked after save.`,
    },
    {
      title: 'AI presenters',
      readTime: '5 min',
      tag: 'Intermediate',
      body: `Configure a presenter per scene: pick an avatar look, voice, and script. Scene-level avatar clips are generated per project.

Avatar scene MP4s count toward the **workspace owner's storage** footprint. Lip-sync export may wait for avatar clips to finish before the final render starts.`,
    },
    {
      title: 'Export a final MP4',
      readTime: '4 min',
      tag: 'Intermediate',
      body: `Save your project, then use **Download / Export** in the editor. AthenaVI renders the full composed video on the server.

You'll see progress while the render runs. When complete, download the MP4 or find it later under **My videos**. Exports use **credits** — team workspaces bill the shared pool.`,
    },
    {
      title: 'Templates',
      readTime: '2 min',
      tag: 'Tips',
      body: `Browse **Templates** from the dashboard to start from a designed layout. Template media may be uploaded into your workspace automatically when you export, so stock images become durable workspace assets.`,
    },
  ],
  assets: [
    {
      title: 'Library overview',
      readTime: '3 min',
      tag: 'Beginner',
      body: `**Library** lists workspace assets: photos, videos, and music. Pick a workspace from the dropdown at the top.

Filter by type, search by name, and upload in bulk. Stock imports appear alongside uploads with a **Stock** badge.`,
    },
    {
      title: 'Who can delete or rename assets',
      readTime: '3 min',
      tag: 'Reference',
      body: `**Private workspace** — you can manage your uploads.

**Team workspace** — only the **uploader**, workspace **Owner**, or **Admin** can rename or delete an asset. The uploader column helps owners see who used storage.

If an asset is referenced in a project, delete is blocked until you remove it from those projects.`,
    },
    {
      title: 'Storage quota and footprint',
      readTime: '3 min',
      tag: 'Reference',
      body: `Storage is billed to the **workspace owner**. It includes:

• Uploaded **assets**
• **Avatar scene** MP4s
• **Completed final renders**

Open a workspace to see owner quota and footprint breakdown. Extra storage is granted by an administrator — there is no self-serve purchase yet.`,
    },
    {
      title: 'Stock media',
      readTime: '2 min',
      tag: 'Tips',
      body: `In the editor, browse **stock** images and video, then import into the workspace. Imported stock items behave like uploads in the asset library and count toward storage.`,
    },
  ],
  presenters: [
    {
      title: 'Avatars page',
      readTime: '3 min',
      tag: 'Beginner',
      body: `**Avatars** lists your AI presenters and looks. Create or customize avatars, then use them inside the editor when configuring a scene presenter.`,
    },
    {
      title: 'Voices page',
      readTime: '3 min',
      tag: 'Beginner',
      body: `**Voices** holds narration voices for scripts and presenters. Design a voice, clone from audio (where enabled), or pick from available presets.`,
    },
    {
      title: 'Credits for generation',
      readTime: '2 min',
      tag: 'Reference',
      body: `Avatar and voice operations consume **credits** from your personal balance or team pool. The editor top bar shows remaining credits for the active workspace context.`,
    },
  ],
  billing: [
    {
      title: 'Personal vs workspace credits',
      readTime: '3 min',
      tag: 'Beginner',
      body: `**Personal credits** — used for private workspace work and personal generation.

**Workspace credits** — a pool for team workspaces. Owners **allocate** credits to the pool and can **return** unused credits to their personal balance from **Settings → Billing**.`,
    },
    {
      title: 'View usage history',
      readTime: '2 min',
      tag: 'Reference',
      body: `Billing settings show credit transactions and, separately, **storage history** (grants, initial allocation, etc.).

Team owners can review workspace credit history and usage-by-member inside the workspace **Credits & Usage** tab.`,
    },
    {
      title: 'Storage in billing settings',
      readTime: '2 min',
      tag: 'Reference',
      body: `The billing tab shows your storage quota bar, tier label, and workspace footprint when a workspace is selected. Contact your administrator to request more storage.`,
    },
  ],
  contact: [
    {
      title: 'Email support',
      readTime: '1 min',
      tag: 'Reference',
      body: `For account, billing, or technical issues, email **support@athenavi.com** with your workspace name, project title, and steps to reproduce.

Include screenshots or export IDs when reporting render failures.`,
    },
    {
      title: 'Support notes (this browser)',
      readTime: '1 min',
      tag: 'Tips',
      body: `Use **Create ticket** below to draft a support request. Notes are saved in this browser only until live ticketing is connected to the backend — they help you track what you sent by email.`,
    },
  ],
}

export const helpFaqs = [
  {
    q: 'Where are my finished videos?',
    a: 'Completed MP4 exports appear on **My videos** (dashboard) and under the workspace **My Videos / Team Videos** tab. Draft timelines stay in **Workspace → Folders**.',
  },
  {
    q: 'Why did my upload fail with a storage error?',
    a: 'The workspace owner exceeded their quota. Storage includes assets, avatar scene files, and completed renders. Ask an administrator for more storage or delete unused assets and old exports.',
  },
  {
    q: 'Why can’t I delete an asset?',
    a: 'It may still be used in a project JSON, or you may not have permission in a team workspace. Remove the asset from projects first, or ask the uploader, owner, or admin.',
  },
  {
    q: 'Do team member exports show up for the owner?',
    a: 'Yes. All completed renders appear in the shared workspace library. **Rendered by** is attribution only — not a filter.',
  },
  {
    q: 'What file types can I upload?',
    a: 'JPEG, PNG, WebP, MP4, and MP3 up to 50 MB per file in the Library and editor upload flows.',
  },
  {
    q: 'How do I get more credits or storage?',
    a: 'Team owners allocate credits from their personal balance. Storage tiers are assigned by a platform administrator — open **Settings → Billing** to review current usage.',
  },
]

export const helpQuickLinks = [
  { id: 'ticket', label: 'Create ticket', desc: 'Draft a support note' },
  { id: 'email', label: 'Email support', desc: 'support@athenavi.com' },
  { id: 'billing', label: 'Billing & storage', desc: 'Review usage in Settings' },
]
