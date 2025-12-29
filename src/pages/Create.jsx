import { useMemo, useState, useEffect, useRef } from 'react'
import {
  MdUndo,
  MdRedo,
  MdPlayArrow,
  MdCloudUpload,
  MdMicNone,
  MdStop,
  MdPerson,
  MdTextFields,
  MdCropFree,
  MdPhotoLibrary,
  MdCategory,
  MdMic,
  MdPlayCircleOutline,
} from 'react-icons/md'

const avatarUrl =
  'https://media.istockphoto.com/id/1480023591/video/creating-a-female-video-game-character.jpg?s=640x640&k=20&c=S1LW6oZZDQYgsqp4GRL0bj9wE1oRIaBfQSV-UQXv2II='
const localAvatar = '/public/Avatar.png'

const styles = `
.create-shell {
  min-height: 100vh;
  height: 100vh;
  background: #f7f9fc;
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
  box-sizing: border-box;
}

.create-topbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.07);
  border-radius: 0 0 12px 12px;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.doc-title {
  border: none;
  font-weight: 800;
  font-size: 16px;
  outline: none;
  background: transparent;
  min-width: 140px;
}

.top-center {
  display: flex;
  gap: 12px;
  align-items: center;
}

.icon-btn {
  border: 1px solid #e5e7eb;
  background: linear-gradient(145deg, #ffffff, #f6f8fb);
  border-radius: 14px;
  padding: 10px 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-shadow:
    0 6px 14px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  min-width: 44px;
  justify-content: center;
  font-size: 16px;
}

.icon-btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 8px 16px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}
.top-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.primary-btn {
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-weight: 800;
  letter-spacing: 0.01em;
  cursor: pointer;
  background: linear-gradient(135deg, #2d6cf6 0%, #5cc6ff 100%);
  color: #ffffff;
  box-shadow:
    0 10px 22px rgba(15, 23, 42, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 12px 26px rgba(15, 23, 42, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.creator-wrap {
  display: grid;
  grid-template-columns: 240px 1fr 300px;
  gap: 16px;
  align-items: start;
  padding: 12px 16px 16px;
  max-height: calc(100vh - 72px);
  overflow: hidden;
  box-sizing: border-box;
}

.creator-left {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 10px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}

.scene-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px;
  background: #ffffff;
  display: grid;
  gap: 6px;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.05);
  cursor: pointer;
}

.scene-card.active {
  border-color: #2d6cf6;
  box-shadow: 0 8px 18px rgba(45, 108, 246, 0.2);
}

.scene-thumb {
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  height: 90px;
}

.creator-main {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 10px;
  min-width: 0;
  overflow: hidden;
}

.canvas {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  min-height: 420px;
  background: #ffffff;
  display: grid;
  place-items: center;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.canvas img {
  max-height: 320px;
}

.hero-layout {
  width: 100%;
  height: 100%;
  position: relative;
  background: #ffffff;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  align-items: center;
  padding: 24px;
}

.text-wrapper {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-move {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2d6cf6;
  color: #ffffff;
  display: grid;
  place-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  cursor: move;
}

.hero-title {
  font-size: 34px;
  font-weight: 800;
  margin: 0;
  color: #0f172a;
  background: transparent;
  border: none;
  padding: 6px 10px;
  min-width: 200px;
}

.hero-subtitle {
  margin: 0;
  color: #475467;
  font-size: 15px;
  background: transparent;
  border: none;
  padding: 6px 10px;
  min-width: 200px;
}

.hero-avatar {
  position: absolute;
  transform: translate(-50%, -50%);
  max-height: 320px;
  object-fit: contain;
}

.avatar-wrapper {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: move;
  user-select: none;
}

.resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #ffffff;
  border: 1px solid #2d6cf6;
  border-radius: 3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.handle-tl { top: -10px; left: -10px; cursor: nwse-resize; }
.handle-tr { top: -10px; right: -10px; cursor: nesw-resize; }
.handle-bl { bottom: -10px; left: -10px; cursor: nesw-resize; }
.handle-br { bottom: -10px; right: -10px; cursor: nwse-resize; }
.handle-top { top: -10px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
.handle-bottom { bottom: -10px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
.handle-left { left: -10px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }
.handle-right { right: -10px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }

.drag-handle {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translate(-50%, 0);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #2d6cf6;
  color: #fff;
  font-size: 12px;
  display: grid;
  place-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  cursor: move;
}

.crop-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #2d6cf6;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.crop-top { top: -6px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
.crop-bottom { bottom: -6px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
.crop-left { left: -6px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }
.crop-right { right: -6px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }
}

.split-layout {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 220px;
  background: #ffffff;
}

.split-top {
  padding: 22px 24px;
  display: grid;
  gap: 8px;
}

.split-title {
  font-size: 30px;
  font-weight: 800;
  margin: 0;
}

.split-subtitle {
  margin: 0;
  color: #475467;
}

.split-bottom {
  background: #f1f3f5;
  border-top: 1px solid #e5e7eb;
  display: grid;
  place-items: center;
  position: relative;
}

.split-avatar {
  max-height: 180px;
}

.timeline {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  min-height: 130px;
  display: grid;
  gap: 8px;
  overflow: hidden;
}

.script-input {
  width: 100%;
  min-height: 80px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
  font-size: 14px;
  resize: vertical;
}

.creator-right {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 12px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}

.panel {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
  background: #ffffff;
  display: grid;
  gap: 6px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pill:hover {
  border-color: #cbd5e1;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.05);
}

.transport {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px 10px;
}

.transport .time {
  font-weight: 700;
  color: #0f172a;
}

.ctx-menu {
  position: fixed;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.16);
  z-index: 20;
  min-width: 200px;
  padding: 6px 0;
  overflow: hidden;
}

.ctx-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 700;
  color: #0f172a;
  transition: background 0.12s ease;
}

.ctx-item:hover {
  background: #f5f7fb;
}
`

function Create({ onBack }) {
  const initialScenes = useMemo(
    () => [
      {
        id: 's1',
        title: 'Scene 1',
        duration: '00:08',
        script:
          'Start your video by greeting your audience and introducing your topic. Create a clear title and give more context with a subheadline.',
        layout: 'hero',
        titleText: 'Insert your video title here',
        subtitleText: 'Add sub-headline here',
        showAvatar: true,
        avatarSrc: localAvatar,
        avatarWidth: 260,
        avatarHeight: 320,
        avatarX: 65,
        avatarY: 55,
        cropTop: 0,
        cropRight: 0,
        cropBottom: 0,
        cropLeft: 0,
        titleX: 35,
        titleY: 42,
        subtitleX: 35,
        subtitleY: 52,
      },
    ],
    []
  )

  const [scenes, setScenes] = useState(initialScenes)
  const [activeId, setActiveId] = useState(initialScenes[0].id)
  const [clipboard, setClipboard] = useState(null)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, sceneId: null })
  const [dragState, setDragState] = useState({
    mode: null,
    corner: null,
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
    startPosX: 0,
    startPosY: 0,
    startCropTop: 0,
    startCropRight: 0,
    startCropBottom: 0,
    startCropLeft: 0,
    textKey: null,
    startTextX: 0,
    startTextY: 0,
  })
  const [cropMode, setCropMode] = useState(false)
  const canvasRef = useRef(null)

  const activeScene = scenes.find((s) => s.id === activeId) || scenes[0]

  const addScene = () => {
    const idx = scenes.length + 1
    const newScene = {
      id: `s${idx}`,
      title: `Scene ${idx}`,
      duration: '00:08',
      script: 'New scene script...',
      layout: 'split',
      titleText: 'Insert your video title here',
      subtitleText: 'Add sub-headline here',
      showAvatar: true,
      avatarSrc: localAvatar,
      avatarWidth: 200,
      avatarHeight: 200,
      avatarX: 50,
      avatarY: 50,
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
      cropLeft: 0,
      titleX: 50,
      titleY: 15,
      subtitleX: 50,
      subtitleY: 24,
    }
    setScenes((prev) => [...prev, newScene])
    setActiveId(newScene.id)
  }

  const updateScript = (text) => {
    setScenes((prev) => prev.map((s) => (s.id === activeId ? { ...s, script: text } : s)))
  }

  const updateTitle = (text) => {
    setScenes((prev) => prev.map((s) => (s.id === activeId ? { ...s, titleText: text } : s)))
  }

  const updateSubtitle = (text) => {
    setScenes((prev) => prev.map((s) => (s.id === activeId ? { ...s, subtitleText: text } : s)))
  }

  const toggleAvatar = (val) => {
    setScenes((prev) => prev.map((s) => (s.id === activeId ? { ...s, showAvatar: val } : s)))
  }

  const updateAvatarProp = (key, val) => {
    setScenes((prev) => prev.map((s) => (s.id === activeId ? { ...s, [key]: val } : s)))
  }

  const applyTemplate = (template) => {
    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeId
          ? {
              ...s,
              layout: template === 'hero' ? 'hero' : 'split',
              titleText: 'Insert your video title here',
              subtitleText: 'Add sub-headline here',
              showAvatar: true,
              avatarSrc: localAvatar,
              avatarWidth: template === 'hero' ? 260 : 200,
              avatarHeight: template === 'hero' ? 320 : 200,
              avatarX: template === 'hero' ? 65 : 50,
              avatarY: template === 'hero' ? 55 : 50,
              cropTop: 0,
              cropRight: 0,
              cropBottom: 0,
              cropLeft: 0,
            }
          : s
      )
    )
  }

  const deleteScene = (id) => {
    setScenes((prev) => {
      if (prev.length === 1) return prev
      const next = prev.filter((s) => s.id !== id)
      if (activeId === id && next.length) setActiveId(next[0].id)
      return next
    })
  }

  const duplicateScene = (id) => {
    setScenes((prev) => {
      const index = prev.findIndex((s) => s.id === id)
      if (index === -1) return prev
      const source = prev[index]
      const newScene = { ...source, id: `s${prev.length + 1}`, title: `${source.title} copy` }
      const next = [...prev]
      next.splice(index + 1, 0, newScene)
      return next
    })
  }

  const copyScene = (id) => {
    const scene = scenes.find((s) => s.id === id)
    if (scene) setClipboard({ ...scene, copied: true })
  }

  const cutScene = (id) => {
    const scene = scenes.find((s) => s.id === id)
    if (!scene) return
    setClipboard({ ...scene, copied: false })
    deleteScene(id)
  }

  const pasteScene = (afterId) => {
    if (!clipboard) return
    setScenes((prev) => {
      const index = prev.findIndex((s) => s.id === afterId)
      const insertAt = index >= 0 ? index + 1 : prev.length
      const newScene = { ...clipboard, id: `s${prev.length + 1}`, title: `${clipboard.title} (pasted)` }
      const next = [...prev]
      next.splice(insertAt, 0, newScene)
      return next
    })
    if (!clipboard.copied) {
      setClipboard(null)
    }
  }

  const replaceLayout = (id) => {
    setScenes((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              layout: s.layout === 'hero' ? 'split' : 'hero',
              titleX: s.layout === 'hero' ? 50 : 35,
              titleY: s.layout === 'hero' ? 15 : 42,
              subtitleX: s.layout === 'hero' ? 50 : 35,
              subtitleY: s.layout === 'hero' ? 24 : 52,
            }
          : s
      )
    )
  }

  const handleContextMenu = (e, sceneId) => {
    e.preventDefault()
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, sceneId })
  }

  const beginTextDrag = (e, textKey) => {
    e.stopPropagation()
    const canvas = canvasRef.current
    if (!canvas || !activeScene) return
    const rect = canvas.getBoundingClientRect()
    setDragState({
      ...dragState,
      mode: 'text',
      textKey,
      startX: e.clientX,
      startY: e.clientY,
      startTextX: activeScene[`${textKey}X`] || 0,
      startTextY: activeScene[`${textKey}Y`] || 0,
      rect,
    })
  }

  const beginDrag = (e, mode, corner = null) => {
    e.stopPropagation()
    const canvas = canvasRef.current
    if (!canvas || !activeScene) return
    const rect = canvas.getBoundingClientRect()
    setDragState({
      mode,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startW: activeScene.avatarWidth || 0,
      startH: activeScene.avatarHeight || 0,
      startPosX: activeScene.avatarX || 0,
      startPosY: activeScene.avatarY || 0,
      startCropTop: activeScene.cropTop || 0,
      startCropRight: activeScene.cropRight || 0,
      startCropBottom: activeScene.cropBottom || 0,
      startCropLeft: activeScene.cropLeft || 0,
      rect,
    })
  }

  useEffect(() => {
    const onMove = (e) => {
      if (!dragState.mode || !activeScene || !dragState.rect) return
      const { rect } = dragState
      const dx = e.clientX - dragState.startX
      const dy = e.clientY - dragState.startY
      if (dragState.mode === 'drag') {
        const newX = dragState.startPosX + (dx / rect.width) * 100
        const newY = dragState.startPosY + (dy / rect.height) * 100
        updateAvatarProp('avatarX', Math.min(100, Math.max(0, newX)))
        updateAvatarProp('avatarY', Math.min(100, Math.max(0, newY)))
      }
    if (dragState.mode === 'text') {
      const newX = dragState.startTextX + (dx / rect.width) * 100
      const newY = dragState.startTextY + (dy / rect.height) * 100
      const keyX = `${dragState.textKey}X`
      const keyY = `${dragState.textKey}Y`
      setScenes((prev) =>
        prev.map((s) =>
          s.id === activeId
            ? {
                ...s,
                [keyX]: Math.min(100, Math.max(0, newX)),
                [keyY]: Math.min(100, Math.max(0, newY)),
              }
            : s
        )
      )
    }
      if (dragState.mode === 'resize') {
        let newW = dragState.startW
        let newH = dragState.startH
        let newX = dragState.startPosX
        let newY = dragState.startPosY
        const pctX = (dx / rect.width) * 100
        const pctY = (dy / rect.height) * 100
        const pxW = dragState.startW + pctX * 3
        const pxH = dragState.startH + pctY * 3
        if (dragState.corner === 'br') {
          newW = Math.max(40, pxW)
          newH = Math.max(40, pxH)
        } else if (dragState.corner === 'bl') {
          newW = Math.max(40, dragState.startW - pctX * 3)
          newH = Math.max(40, pxH)
          newX = dragState.startPosX + pctX
        } else if (dragState.corner === 'tr') {
          newW = Math.max(40, pxW)
          newH = Math.max(40, dragState.startH - pctY * 3)
          newY = dragState.startPosY + pctY
        } else if (dragState.corner === 'tl') {
          newW = Math.max(40, dragState.startW - pctX * 3)
          newH = Math.max(40, dragState.startH - pctY * 3)
          newX = dragState.startPosX + pctX
          newY = dragState.startPosY + pctY
        }
        if (dragState.corner === 'top') {
          newH = Math.max(40, dragState.startH - pctY * 3)
          newY = dragState.startPosY + pctY
        } else if (dragState.corner === 'bottom') {
          newH = Math.max(40, pxH)
        } else if (dragState.corner === 'left') {
          newW = Math.max(40, dragState.startW - pctX * 3)
          newX = dragState.startPosX + pctX
        } else if (dragState.corner === 'right') {
          newW = Math.max(40, pxW)
        }
        updateAvatarProp('avatarWidth', newW)
        updateAvatarProp('avatarHeight', newH)
        updateAvatarProp('avatarX', Math.min(100, Math.max(0, newX)))
        updateAvatarProp('avatarY', Math.min(100, Math.max(0, newY)))
      }
      if (dragState.mode === 'crop') {
        const pctX = (dx / rect.width) * 100
        const pctY = (dy / rect.height) * 100
        if (dragState.corner === 'top') {
          updateAvatarProp('cropTop', Math.min(90, Math.max(0, dragState.startCropTop + pctY)))
        } else if (dragState.corner === 'bottom') {
          updateAvatarProp('cropBottom', Math.min(90, Math.max(0, dragState.startCropBottom - pctY)))
        } else if (dragState.corner === 'left') {
          updateAvatarProp('cropLeft', Math.min(90, Math.max(0, dragState.startCropLeft + pctX)))
        } else if (dragState.corner === 'right') {
          updateAvatarProp('cropRight', Math.min(90, Math.max(0, dragState.startCropRight - pctX)))
        }
      }
    }
    const onUp = () => setDragState((s) => ({ ...s, mode: null, corner: null, textKey: null }))
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragState, activeScene])

  useEffect(() => {
    const closeMenu = () => setContextMenu((m) => ({ ...m, visible: false }))
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [])

  return (
    <>
      <style>{styles}</style>
      <div className="create-shell">
        <div className="create-topbar">
          <div className="top-left">
            <button className="icon-btn" onClick={onBack}>
              ←
            </button>
            <input className="doc-title" defaultValue="Untitled" />
            <button className="icon-btn">
              <MdUndo />
            </button>
            <button className="icon-btn">
              <MdRedo />
            </button>
          </div>
          <div className="top-center">
            <button className="icon-btn" title="Avatar">
              <MdPerson />
            </button>
            <button className="icon-btn" title="Text">
              <MdTextFields />
            </button>
            <button className="icon-btn" title="Shape">
              <MdCropFree />
            </button>
            <button className="icon-btn" title="Media">
              <MdPhotoLibrary />
            </button>
            <button className="icon-btn" title="Element">
              <MdCategory />
            </button>
            <button className="icon-btn" title="Record">
              <MdMic />
            </button>
          </div>
          <div className="top-right">
            <button className="icon-btn" title="Preview">
              <MdPlayCircleOutline /> Preview
            </button>
            <button className="primary-btn">Generate</button>
          </div>
        </div>

        <div className="creator-wrap">
          <aside className="creator-left">
            <button className="pill" style={{ justifyContent: 'center' }} onClick={addScene}>
              + Add scene
            </button>
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className={`scene-card ${scene.id === activeId ? 'active' : ''}`}
                onClick={() => setActiveId(scene.id)}
                onContextMenu={(e) => handleContextMenu(e, scene.id)}
              >
                <div
                  className="scene-thumb"
                  style={{ backgroundImage: `url('${avatarUrl}')` }}
                />
                <strong>{scene.title}</strong>
                <span className="card-meta">{scene.duration}</span>
              </div>
            ))}
          </aside>

          <section className="creator-main">
            <div className="canvas" ref={canvasRef}>
              {activeScene?.layout === 'hero' ? (
                <div className="hero-layout">
                  <div
                    className="text-wrapper"
                    style={{
                      top: `${activeScene?.titleY || 40}%`,
                      left: `${activeScene?.titleX || 35}%`,
                    }}
                  >
                    <span className="text-move" onMouseDown={(e) => beginTextDrag(e, 'title')}>
                      ⤧
                    </span>
                    <input
                      className="hero-title"
                      value={activeScene?.titleText || ''}
                      onChange={(e) => updateTitle(e.target.value)}
                    />
                  </div>
                  <div
                    className="text-wrapper"
                    style={{
                      top: `${activeScene?.subtitleY || 50}%`,
                      left: `${activeScene?.subtitleX || 35}%`,
                    }}
                  >
                    <span className="text-move" onMouseDown={(e) => beginTextDrag(e, 'subtitle')}>
                      ⤧
                    </span>
                    <input
                      className="hero-subtitle"
                      value={activeScene?.subtitleText || ''}
                      onChange={(e) => updateSubtitle(e.target.value)}
                    />
                  </div>
                  {activeScene?.showAvatar && (
                    <div
                      className="avatar-wrapper"
                      style={{
                        top: `${activeScene?.avatarY || 50}%`,
                        left: `${activeScene?.avatarX || 50}%`,
                      }}
                      onMouseDown={(e) => beginDrag(e, 'drag')}
                    >
                      <div className="drag-handle" onMouseDown={(e) => beginDrag(e, 'drag')}>⤧</div>
                      <img
                        src={activeScene?.avatarSrc || localAvatar}
                        alt="Avatar"
                        className="hero-avatar"
                        style={{
                          width: `${activeScene?.avatarWidth || 260}px`,
                          height: `${activeScene?.avatarHeight || 320}px`,
                          clipPath: `inset(${activeScene?.cropTop || 0}% ${activeScene?.cropRight || 0}% ${
                            activeScene?.cropBottom || 0
                          }% ${activeScene?.cropLeft || 0}%)`,
                          pointerEvents: 'none',
                        }}
                      />
                      <span className="resize-handle handle-tl" onMouseDown={(e) => beginDrag(e, 'resize', 'tl')} />
                      <span className="resize-handle handle-tr" onMouseDown={(e) => beginDrag(e, 'resize', 'tr')} />
                      <span className="resize-handle handle-bl" onMouseDown={(e) => beginDrag(e, 'resize', 'bl')} />
                      <span className="resize-handle handle-br" onMouseDown={(e) => beginDrag(e, 'resize', 'br')} />
                      <span className="resize-handle handle-top" onMouseDown={(e) => beginDrag(e, 'resize', 'top')} />
                      <span className="resize-handle handle-bottom" onMouseDown={(e) => beginDrag(e, 'resize', 'bottom')} />
                      <span className="resize-handle handle-left" onMouseDown={(e) => beginDrag(e, 'resize', 'left')} />
                      <span className="resize-handle handle-right" onMouseDown={(e) => beginDrag(e, 'resize', 'right')} />
                      {cropMode && (
                        <>
                          <span className="crop-handle crop-top" onMouseDown={(e) => beginDrag(e, 'crop', 'top')} />
                          <span className="crop-handle crop-bottom" onMouseDown={(e) => beginDrag(e, 'crop', 'bottom')} />
                          <span className="crop-handle crop-left" onMouseDown={(e) => beginDrag(e, 'crop', 'left')} />
                          <span className="crop-handle crop-right" onMouseDown={(e) => beginDrag(e, 'crop', 'right')} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="split-layout">
                  <div className="split-top">
                    <div
                      className="text-wrapper"
                      style={{
                        top: `${activeScene?.titleY || 15}%`,
                        left: `${activeScene?.titleX || 50}%`,
                        position: 'relative',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <span className="text-move" onMouseDown={(e) => beginTextDrag(e, 'title')}>
                        ⤧
                      </span>
                      <input
                        className="split-title"
                        value={activeScene?.titleText || ''}
                        onChange={(e) => updateTitle(e.target.value)}
                      />
                    </div>
                    <div
                      className="text-wrapper"
                      style={{
                        top: `${activeScene?.subtitleY || 24}%`,
                        left: `${activeScene?.subtitleX || 50}%`,
                        position: 'relative',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <span className="text-move" onMouseDown={(e) => beginTextDrag(e, 'subtitle')}>
                        ⤧
                      </span>
                      <input
                        className="split-subtitle"
                        value={activeScene?.subtitleText || ''}
                        onChange={(e) => updateSubtitle(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="split-bottom">
                    {activeScene?.showAvatar && (
                      <div
                        className="avatar-wrapper"
                        style={{
                          top: `${activeScene?.avatarY || 50}%`,
                          left: `${activeScene?.avatarX || 50}%`,
                        }}
                        onMouseDown={(e) => beginDrag(e, 'drag')}
                      >
                        <div className="drag-handle" onMouseDown={(e) => beginDrag(e, 'drag')}>⤧</div>
                        <img
                          src={activeScene?.avatarSrc || localAvatar}
                          alt="Avatar"
                          className="split-avatar"
                          style={{
                            width: `${activeScene?.avatarWidth || 200}px`,
                            height: `${activeScene?.avatarHeight || 200}px`,
                            clipPath: `inset(${activeScene?.cropTop || 0}% ${activeScene?.cropRight || 0}% ${
                              activeScene?.cropBottom || 0
                            }% ${activeScene?.cropLeft || 0}%)`,
                            pointerEvents: 'none',
                          }}
                        />
                        <span className="resize-handle handle-tl" onMouseDown={(e) => beginDrag(e, 'resize', 'tl')} />
                        <span className="resize-handle handle-tr" onMouseDown={(e) => beginDrag(e, 'resize', 'tr')} />
                        <span className="resize-handle handle-bl" onMouseDown={(e) => beginDrag(e, 'resize', 'bl')} />
                        <span className="resize-handle handle-br" onMouseDown={(e) => beginDrag(e, 'resize', 'br')} />
                        <span className="resize-handle handle-top" onMouseDown={(e) => beginDrag(e, 'resize', 'top')} />
                        <span className="resize-handle handle-bottom" onMouseDown={(e) => beginDrag(e, 'resize', 'bottom')} />
                        <span className="resize-handle handle-left" onMouseDown={(e) => beginDrag(e, 'resize', 'left')} />
                        <span className="resize-handle handle-right" onMouseDown={(e) => beginDrag(e, 'resize', 'right')} />
                        {cropMode && (
                          <>
                            <span className="crop-handle crop-top" onMouseDown={(e) => beginDrag(e, 'crop', 'top')} />
                            <span className="crop-handle crop-bottom" onMouseDown={(e) => beginDrag(e, 'crop', 'bottom')} />
                            <span className="crop-handle crop-left" onMouseDown={(e) => beginDrag(e, 'crop', 'left')} />
                            <span className="crop-handle crop-right" onMouseDown={(e) => beginDrag(e, 'crop', 'right')} />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="transport">
              <button className="icon-btn">
                <MdStop />
              </button>
              <button className="icon-btn">
                <MdPlayArrow />
              </button>
              <span className="time">00:00</span>
              <button className="icon-btn">
                <MdMicNone /> EN
              </button>
            </div>
            <div className="timeline">
              <strong>Script</strong>
              <textarea
                className="script-input"
                value={activeScene?.script || ''}
                onChange={(e) => updateScript(e.target.value)}
              />
            </div>
          </section>

          <aside className="creator-right">
            <div className="panel">
              <strong>Scene layout</strong>
              <button className="pill" style={{ justifyContent: 'center' }}>
                Replace
              </button>
              <label className="card-meta">Template</label>
              <select
                value={activeScene?.layout || 'hero'}
                onChange={(e) => applyTemplate(e.target.value)}
              >
                <option value="hero">Hero (text + avatar)</option>
                <option value="split">Split (text top, avatar band)</option>
              </select>
            </div>
            <div className="panel">
              <strong>Theme</strong>
              <select>
                <option>Theme 1</option>
                <option>Theme 2</option>
              </select>
            </div>
            <div className="panel">
              <strong>Color</strong>
              <input type="color" defaultValue="#FFFFFF" />
            </div>
            <div className="panel">
              <strong>Background media</strong>
              <button className="pill" style={{ justifyContent: 'center' }}>
                <MdCloudUpload /> Upload
              </button>
            </div>
            <div className="panel">
              <strong>Music</strong>
              <button className="pill" style={{ justifyContent: 'center' }}>
                Select track
              </button>
            </div>
            <div className="panel">
              <strong>Scene transition</strong>
              <select>
                <option>None</option>
                <option>Fade</option>
              </select>
            </div>
            <div className="panel">
              <strong>After this scene</strong>
              <select>
                <option>Next scene</option>
              </select>
            </div>
            <div className="panel">
              <strong>Avatar</strong>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={!!activeScene?.showAvatar}
                  onChange={(e) => toggleAvatar(e.target.checked)}
                />
                Show avatar
              </label>
              <button
                className="pill"
                style={{ justifyContent: 'center' }}
                onClick={() =>
                  setScenes((prev) =>
                    prev.map((s) => (s.id === activeId ? { ...s, avatarSrc: localAvatar } : s))
                  )
                }
              >
                Reset avatar
              </button>
              <label className="card-meta">Width (px)</label>
              <input
                type="number"
                value={activeScene?.avatarWidth || 0}
                onChange={(e) => updateAvatarProp('avatarWidth', Number(e.target.value || 0))}
              />
              <label className="card-meta">Height (px)</label>
              <input
                type="number"
                value={activeScene?.avatarHeight || 0}
                onChange={(e) => updateAvatarProp('avatarHeight', Number(e.target.value || 0))}
              />
              <label className="card-meta">Position X (%)</label>
              <input
                type="number"
                value={activeScene?.avatarX || 0}
                onChange={(e) => updateAvatarProp('avatarX', Number(e.target.value || 0))}
              />
              <label className="card-meta">Position Y (%)</label>
              <input
                type="number"
                value={activeScene?.avatarY || 0}
                onChange={(e) => updateAvatarProp('avatarY', Number(e.target.value || 0))}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={cropMode}
                  onChange={(e) => setCropMode(e.target.checked)}
                />
                Crop mode
              </label>
              <label className="card-meta">Crop top (%)</label>
              <input
                type="number"
                value={activeScene?.cropTop || 0}
                onChange={(e) => updateAvatarProp('cropTop', Number(e.target.value || 0))}
              />
              <label className="card-meta">Crop right (%)</label>
              <input
                type="number"
                value={activeScene?.cropRight || 0}
                onChange={(e) => updateAvatarProp('cropRight', Number(e.target.value || 0))}
              />
              <label className="card-meta">Crop bottom (%)</label>
              <input
                type="number"
                value={activeScene?.cropBottom || 0}
                onChange={(e) => updateAvatarProp('cropBottom', Number(e.target.value || 0))}
              />
              <label className="card-meta">Crop left (%)</label>
              <input
                type="number"
                value={activeScene?.cropLeft || 0}
                onChange={(e) => updateAvatarProp('cropLeft', Number(e.target.value || 0))}
              />
            </div>
          </aside>
        </div>
        {contextMenu.visible && (
          <div
            className="ctx-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="ctx-item"
              onClick={() => {
                addScene()
                setContextMenu({ ...contextMenu, visible: false })
              }}
            >
              + Add scene
            </button>
            <button
              className="ctx-item"
              onClick={() => {
                cutScene(contextMenu.sceneId)
                setContextMenu({ ...contextMenu, visible: false })
              }}
            >
              ✂ Cut
            </button>
            <button
              className="ctx-item"
              onClick={() => {
                copyScene(contextMenu.sceneId)
                setContextMenu({ ...contextMenu, visible: false })
              }}
            >
              📋 Copy
            </button>
            <button
              className="ctx-item"
              onClick={() => {
                pasteScene(contextMenu.sceneId)
                setContextMenu({ ...contextMenu, visible: false })
              }}
            >
              📥 Paste
            </button>
            <button
              className="ctx-item"
              onClick={() => {
                deleteScene(contextMenu.sceneId)
                setContextMenu({ ...contextMenu, visible: false })
              }}
            >
              🗑 Delete
            </button>
            <button
              className="ctx-item"
              onClick={() => {
                duplicateScene(contextMenu.sceneId)
                setContextMenu({ ...contextMenu, visible: false })
              }}
            >
              ⧉ Duplicate
            </button>
            <button
              className="ctx-item"
              onClick={() => {
                replaceLayout(contextMenu.sceneId)
                setContextMenu({ ...contextMenu, visible: false })
              }}
            >
              ↺ Replace layout
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default Create

