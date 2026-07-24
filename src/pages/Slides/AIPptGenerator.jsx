import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import './AIPptGenerator.css'

// Sub-components
import AIPptWizard from './AIPptComponents/AIPptWizard'
import AIPptOutline from './AIPptComponents/AIPptOutline'
import AIPptGenerating from './AIPptComponents/AIPptGenerating'
import AIPptEditor from './AIPptComponents/AIPptEditor'

export default function AIPptGenerator({ onBack, onComplete }) {
  // 'wizard' | 'outline' | 'generating' | 'editor'
  const [stage, setStage] = useState('wizard')
  
  // Shared State
  const [outlineData, setOutlineData] = useState([])
  const [config, setConfig] = useState({})

  const handleWizardComplete = (generatedOutline, generatorConfig) => {
    setOutlineData(generatedOutline)
    setConfig(generatorConfig)
    setStage('outline')
  }

  const handleOutlineComplete = (finalOutline) => {
    setOutlineData(finalOutline)
    setStage('generating')
  }

  const handleGenerationComplete = () => {
    if (onComplete) {
      onComplete({ outline: outlineData, config: config })
    }
  }

  return (
    <div className="aig-container">
      {/* Background stays persistent across all non-editor stages */}
      {stage !== 'editor' && (
        <div className="aig-bg-sky">
          <div className="aig-bg-wave aig-bg-wave-1"></div>
          <div className="aig-bg-wave aig-bg-wave-2"></div>
          <div className="aig-bg-wave aig-bg-wave-3"></div>
        </div>
      )}
      
      {/* Shared Header for Wizard & Outline */}
      {(stage === 'wizard' || stage === 'outline') && (
        <header className="aig-header-floating fade-in">
          <button className="aig-home-btn" onClick={onBack}>
            <ChevronLeft size={18} /> Home
          </button>
        </header>
      )}

      {/* Stage Router */}
      {stage === 'wizard' && (
        <AIPptWizard onComplete={handleWizardComplete} />
      )}

      {stage === 'outline' && (
        <AIPptOutline 
          initialOutline={outlineData} 
          onGenerate={handleOutlineComplete}
          onBack={() => setStage('wizard')}
        />
      )}

      {stage === 'generating' && (
        <AIPptGenerating onComplete={handleGenerationComplete} />
      )}
    </div>
  )
}
