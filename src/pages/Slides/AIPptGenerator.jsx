import { useState } from 'react'
import './AIPptGenerator.css'

import AIPptWizard from './AIPptComponents/AIPptWizard'
import AIPptOutline from './AIPptComponents/AIPptOutline'
import AIPptGenerating from './AIPptComponents/AIPptGenerating'
import PptHistorySidebar from './AIPptComponents/PptHistorySidebar'
import PptHistoryPreview from './AIPptComponents/PptHistoryPreview'
import customFloat1 from '../../assets/Template_Image/custom_float_1.png'
import customFloat2 from '../../assets/Template_Image/custom_float_2.png'
import customFloat3 from '../../assets/Template_Image/custom_float_3.png'
import customFloat4 from '../../assets/Template_Image/custom_float_4.png'
import aiMascot from '../../assets/slides_icons/ai_mascot.png'
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
  onComplete: _onComplete,
  onOpenPresentation,
  createContext: _createContext = null,
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
  const [flowNonce, setFlowNonce] = useState(0)
  const [wizardStep, setWizardStep] = useState(1)
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

  const handleGenerationComplete = () => {
    setStage('preview')
  }

  const handleNewPresentation = () => {
    setStage('wizard')
    setOutlineData([])
    setConfig({})
    setSession(null)
    setCreditEstimate(null)
    setFlowError('')
    setIsBusy(false)
    setFlowNonce((value) => value + 1)
  }

  const handleOpenHistoryItem = (item) => {
    if (!item?.id || !item?.workspaceId) return
    setSession({
      workspaceId: item.workspaceId,
      presentationId: item.id,
      folderId: item.folderId || null,
      title: item.title || 'Untitled Presentation',
      themeId: item.themeId || null,
    })
    setConfig({
      title: item.title || 'Untitled Presentation',
      theme: item.themeId || 'petrol',
      workspaceId: item.workspaceId,
      presentationId: item.id,
    })
    setFlowError('')
    setStage('preview')
  }

  const handleEditPreview = (data) => {
    onOpenPresentation?.(data)
  }

  const showHistorySidebar = stage === 'preview' || (stage === 'wizard' && wizardStep === 1)

  return (
    <div className={`aig-container ${showHistorySidebar ? 'aig-container--with-history' : ''}`}>
      {stage !== 'editor' && (
        <>
          <div className="aig-bg-sky">
            <div className="aig-bg-wave aig-bg-wave-1"></div>
            <div className="aig-bg-wave aig-bg-wave-2"></div>
            <div className="aig-bg-wave aig-bg-wave-3"></div>
          </div>
          <div className="aig-floating-bg">
            <img src={customFloat1} className="aig-float-img img-1" alt="" aria-hidden="true" />
            <img src={customFloat2} className="aig-float-img img-2" alt="" aria-hidden="true" />
            <img src={customFloat4} className="aig-float-img img-3" alt="" aria-hidden="true" />
            <img src={customFloat3} className="aig-float-img img-4" alt="" aria-hidden="true" />
            <img src={customFloat2} className="aig-float-img img-5" alt="" aria-hidden="true" />
            <img src={customFloat1} className="aig-float-img img-6" alt="" aria-hidden="true" />
            <img src={customFloat3} className="aig-float-img img-7" alt="" aria-hidden="true" />
            <img src={customFloat4} className="aig-float-img img-8" alt="" aria-hidden="true" />
          </div>
          <img
            src={aiMascot}
            alt=""
            className="aig-mascot-slide"
            aria-hidden="true"
          />
        </>
      )}

      {showHistorySidebar && (
        <PptHistorySidebar
          activePresentationId={session?.presentationId}
          onOpenPresentation={handleOpenHistoryItem}
          onNewPresentation={handleNewPresentation}
          onHome={onBack}
        />
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
          key={flowNonce}
          initialWorkspaceId={initialWorkspaceId}
          initialFolderId={initialFolderId}
          onComplete={handleWizardComplete}
          onStepChange={setWizardStep}
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

      {stage === 'preview' && session?.workspaceId && session?.presentationId && (
        <PptHistoryPreview
          key={session.presentationId}
          workspaceId={session.workspaceId}
          presentationId={session.presentationId}
          folderId={session.folderId || null}
          title={session.title || config.title}
          themeId={session.themeId || config.theme}
          onEdit={handleEditPreview}
        />
      )}
    </div>
  )
}
