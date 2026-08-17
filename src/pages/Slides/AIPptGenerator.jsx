import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import './AIPptGenerator.css'

import AIPptWizard from './AIPptComponents/AIPptWizard'
import AIPptOutline from './AIPptComponents/AIPptOutline'
import AIPptGenerating from './AIPptComponents/AIPptGenerating'
import presentationService, { PresentationConflictError } from '../../services/presentationService'
import { isInsufficientCreditsError } from '../../services/creditsService'
import {
  buildPresentationGenerationPayload,
  buildWizardThemeTokens,
  outlineCardsToApiPayload,
  toApiThemeId,
} from '../../utils/presentationHelpers'

export default function AIPptGenerator({
  onBack,
  onComplete, createContext: _createContext = null,
  initialWorkspaceId,
  initialFolderId,
}) {
  const [stage, setStage] = useState('wizard')
  const [outlineData, setOutlineData] = useState([])
  const [config, setConfig] = useState({})
  const [session, setSession] = useState(null) // { workspaceId, presentationId, folderId }
  const [creditEstimate, setCreditEstimate] = useState(null)
  const [flowError, setFlowError] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  // _createContext ({ optionId, workspaceId, folderId }) reserved for a future name/save step.

  const handleWizardComplete = (generatedOutline, generatorConfig, apiSession) => {
    setOutlineData(generatedOutline)
    setConfig(generatorConfig)
    setSession(apiSession)
    setCreditEstimate(apiSession?.creditEstimate || null)
    setFlowError('')
    setStage('outline')
  }

  const handleOutlineComplete = async (finalOutline) => {
    if (!session?.workspaceId || !session?.presentationId) {
      setFlowError('Missing presentation session. Go back and generate the outline again.')
      return
    }

    setIsBusy(true)
    setFlowError('')
    try {
      await presentationService.updateOutline(
        session.workspaceId,
        session.presentationId,
        outlineCardsToApiPayload(finalOutline, {
          title: config.title,
          density: config.textAmount,
          locale: config.locale || 'en',
        })
      )

      const wizardThemeTokens = buildWizardThemeTokens(
        config.theme,
        config.availableOptions?.colorThemes
      )
      const paletteMode =
        config.themeMode === 'palette' ||
        (!config.themeMode && !config.brandKitId && !config.packId)
      if (paletteMode && wizardThemeTokens) {
        await presentationService.setTheme(session.workspaceId, session.presentationId, {
          themeId: config.theme || undefined,
          themeTokens: wizardThemeTokens,
        })
      } else if (toApiThemeId(config.backendThemeId)) {
        await presentationService.setTheme(session.workspaceId, session.presentationId, {
          themeId: toApiThemeId(config.backendThemeId),
        })
      }

      await presentationService.startGenerate(
        session.workspaceId,
        session.presentationId,
        buildPresentationGenerationPayload(config, {
          finalOutline,
          overwriteManualEdits: false,
        })
      )
      setOutlineData(finalOutline)
      setStage('generating')
    } catch (error) {
      if (isInsufficientCreditsError(error)) {
        setFlowError(error.message || 'Insufficient credits to generate this presentation.')
      } else if (error instanceof PresentationConflictError) {
        setFlowError(
          error.message ||
            'This deck is still generating. Wait for it to finish, or start a new presentation from the wizard.'
        )
      } else {
        setFlowError(error.message || 'Failed to start generation.')
      }
    } finally {
      setIsBusy(false)
    }
  }

  const handleGenerationComplete = (statusPayload) => {
    if (onComplete) {
      onComplete({
        outline: outlineData,
        config,
        workspaceId: session?.workspaceId,
        presentationId: session?.presentationId,
        folderId: session?.folderId,
        status: statusPayload,
      })
    }
  }

  return (
    <div className="aig-container">
      {stage !== 'editor' && (
        <div className="aig-bg-sky">
          <div className="aig-bg-wave aig-bg-wave-1"></div>
          <div className="aig-bg-wave aig-bg-wave-2"></div>
          <div className="aig-bg-wave aig-bg-wave-3"></div>
        </div>
      )}

      {(stage === 'wizard' || stage === 'outline') && (
        <header className="aig-header-floating fade-in">
          <button className="aig-home-btn" onClick={onBack}>
            <ChevronLeft size={18} /> Home
          </button>
        </header>
      )}

      {flowError && (
        <div className="aig-flow-error" role="alert">
          {flowError}
          <button type="button" onClick={() => setFlowError('')}>
            Dismiss
          </button>
        </div>
      )}

      {stage === 'wizard' && (
        <AIPptWizard
          initialWorkspaceId={initialWorkspaceId}
          initialFolderId={initialFolderId}
          onComplete={handleWizardComplete}
        />
      )}

      {stage === 'outline' && (
        <AIPptOutline
          initialOutline={outlineData}
          creditEstimate={creditEstimate}
          isSubmitting={isBusy}
          onGenerate={handleOutlineComplete}
          onBack={() => setStage('wizard')}
        />
      )}

      {stage === 'generating' && (
        <AIPptGenerating
          workspaceId={session?.workspaceId}
          presentationId={session?.presentationId}
          expectedSlideCount={outlineData?.length || config?.slides}
          onComplete={handleGenerationComplete}
          onError={(message) => {
            setFlowError(message)
            setStage('outline')
          }}
        />
      )}
    </div>
  )
}
