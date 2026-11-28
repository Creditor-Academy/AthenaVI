import { createRoot } from 'react-dom/client'
import '../index.css'
import '../pages/Slides/AIPptGenerator.css'
import '../pages/Slides/AIPptComponents/pptEditorExtras.css'
import PresentEvalApp from './PresentEvalApp'

createRoot(document.getElementById('root')).render(<PresentEvalApp />)
