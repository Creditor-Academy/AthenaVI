import { useMemo, useState } from 'react'
import {
  MdUndo,
  MdRedo,
  MdPlayArrow,
  MdCloudUpload,
  MdMicNone,
  MdStop,
} from 'react-icons/md'

const avatarUrl =
  'https://media.istockphoto.com/id/1480023591/video/creating-a-female-video-game-character.jpg?s=640x640&k=20&c=S1LW6oZZDQYgsqp4GRL0bj9wE1oRIaBfQSV-UQXv2II='

const styles = `
.create-shell {
  min-height: 100vh;
  background: #f7f9fc;
  display: grid;
  grid-template-rows: auto 1fr;
}

.create-topbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
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
}

.top-center {
  display: flex;
  gap: 10px;
  align-items: center;
}

.icon-btn {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 10px;
  padding: 8px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
}

.top-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.primary-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #2d6cf6 0%, #5cc6ff 100%);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.1);
}

.creator-wrap {
  display: grid;
  grid-template-columns: 240px 1fr 300px;
  gap: 16px;
  align-items: start;
  padding: 16px;
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
}

.canvas {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  min-height: 420px;
  background: #ffffff;
  display: grid;
  place-items: center;
  padding: 16px;
}

.canvas img {
  max-height: 320px;
}

.timeline {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  min-height: 130px;
  display: grid;
  gap: 8px;
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
      },
      {
        id: 's2',
        title: 'Scene 2',
        duration: '00:10',
        script: 'Add your key points here and keep them concise.',
      },
    ],
    []
  )

  const [scenes, setScenes] = useState(initialScenes)
  const [activeId, setActiveId] = useState(initialScenes[0].id)

  const activeScene = scenes.find((s) => s.id === activeId) || scenes[0]

  const addScene = () => {
    const idx = scenes.length + 1
    const newScene = {
      id: `s${idx}`,
      title: `Scene ${idx}`,
      duration: '00:08',
      script: 'New scene script...',
    }
    setScenes((prev) => [...prev, newScene])
    setActiveId(newScene.id)
  }

  const updateScript = (text) => {
    setScenes((prev) => prev.map((s) => (s.id === activeId ? { ...s, script: text } : s)))
  }

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
            <button className="icon-btn">Avatar</button>
            <button className="icon-btn">Text</button>
            <button className="icon-btn">Shape</button>
            <button className="icon-btn">Media</button>
            <button className="icon-btn">Element</button>
            <button className="icon-btn">Record</button>
          </div>
          <div className="top-right">
            <button className="icon-btn">
              <MdPlayArrow /> Preview
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
            <div className="canvas">
              <img src={avatarUrl} alt="Avatar preview" />
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
          </aside>
        </div>
      </div>
    </>
  )
}

export default Create

