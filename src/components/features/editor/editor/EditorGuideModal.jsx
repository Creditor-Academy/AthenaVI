import { MdClose, MdLightbulbOutline } from 'react-icons/md'

const TIPS = [
  {
    title: 'Scenes & timeline',
    body: 'Each scene is a slide in your video. Use the timeline to reorder scenes, trim duration, and pick the active scene.',
  },
  {
    title: 'Layers',
    body: 'Select elements on the canvas to edit text, images, avatars, and graphics in the properties panel on the right.',
  },
  {
    title: 'Avatar video',
    body: 'Generate avatar narration from scene settings. Voice plays from the generated video during preview and export.',
  },
  {
    title: 'Insert media',
    body: 'Use Insert → Images or Videos to add stock assets or upload your own files to the canvas.',
  },
]

const EditorGuideModal = ({ onClose }) => (
  <div className="editor-guide-overlay" onClick={onClose} role="presentation">
    <div
      className="editor-guide-modal"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label="Editor guide"
    >
      <header className="editor-guide-modal__header">
        <div className="editor-guide-modal__title-wrap">
          <MdLightbulbOutline size={22} aria-hidden />
          <h2>Editor guide</h2>
        </div>
        <button type="button" className="editor-guide-modal__close" onClick={onClose} aria-label="Close">
          <MdClose size={20} />
        </button>
      </header>
      <div className="editor-guide-modal__body premium-scrollbar">
        {TIPS.map((tip) => (
          <article key={tip.title} className="editor-guide-modal__tip">
            <h3>{tip.title}</h3>
            <p>{tip.body}</p>
          </article>
        ))}
      </div>
    </div>
  </div>
)

export default EditorGuideModal
