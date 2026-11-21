import { createRoot } from 'react-dom/client'
import '../index.css'
import '../pages/Slides/AIPptGenerator.css'
import '../pages/Slides/ensurePlayfairFont.js'
import '../pages/Slides/AIPptComponents/pptEditorExtras.css'
import './exportRender.css'
import ExportRenderApp from './ExportRenderApp'

createRoot(document.getElementById('root')).render(<ExportRenderApp />)
