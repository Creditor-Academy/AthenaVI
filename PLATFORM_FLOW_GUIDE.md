# AthenaVI — Platform Flow (Login → Render)

## 1. Login
1. Open the landing page (`/`)
2. Click **Log in** in the navbar
3. Sign in with **email/password** or **Continue with Google**
4. Session is saved (JWT + refresh cookie)
5. You are redirected to **Dashboard** (`/dashboard`)

## 2. Dashboard
1. Profile loads automatically
2. Choose where to start:
   - **Home** → Create button
   - **Videos** → Create button
   - **Workspace** → Create in a folder
   - **Templates** → Use template

## 3. Create Project (Wizard)
1. **Step 1 — Canvas Size:** Pick aspect ratio (16:9, 9:16, 1:1, 4:5, or custom)
2. **Step 2 — Template:** Select a template or skip
3. **Step 3 — Details:** Enter title, tags, workspace, and folder
4. Click **Create** → project is created in the workspace
5. Editor opens at `/create`

## 4. Editor Setup
1. For new/blank projects, **Quick Create** opens first
2. Set avatar look, voice, and script for the first scene
3. Existing projects load saved scenes from the server

## 5. Build the Video
1. Add or edit **scenes** (duration, transitions, background)
2. Add **layers** — text, images, video, shapes, audio
3. **Upload media** (files must finish uploading before export)
4. Configure **presenter** per scene — avatar, voice, script
5. Edits **auto-save** every few seconds

## 6. Generate Avatar Clips (per scene)
1. Open **Scene Settings** for a scene
2. Confirm avatar look, voice, and script are set
3. Click **Generate**
4. Wait until status is **completed** (polls in background)
5. Repeat for every scene that has a presenter

## 7. Preview
1. Click **Preview** in the top bar
2. Review scenes, layers, and avatar clips
3. Close and fix anything needed

## 8. Export & Render
1. Click **Download** in the top bar
2. Enter filename and confirm
3. App saves project → starts full render on server
4. Wait for render to finish (progress shown in modal)

## 9. Download Final Video
1. Render completes → download modal opens
2. Click **Download MP4**
3. Final stitched video saves to your device

---

**Critical path:** Login → Create project → Edit scenes → Generate all avatar clips → Preview → Export → Download MP4

**Re-open later:** Dashboard → Videos or Workspace → click project → continues in editor at step 5
