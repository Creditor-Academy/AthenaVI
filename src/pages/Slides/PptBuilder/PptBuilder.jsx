import React, { useState } from 'react'
import TemplateSelector from './components/TemplateSelector'
import AIPptEditor from '../AIPptComponents/AIPptEditor'
import presentationService from '../../../services/presentationService'
import { isInsufficientCreditsError } from '../../../services/creditsService'
import { resolvePresentationWorkspaceContext } from '../../../utils/presentationContext'
import { extractPresentationId, toApiThemeId } from '../../../utils/presentationHelpers'
import './PptBuilder.css'
import '../AIPptGenerator.css'

export default function PptBuilder({
  onBack,
  onOpenEditor,
  initialWorkspaceId,
  initialFolderId,
  createContext = null,
}) {
  // createContext ({ optionId, workspaceId, folderId }) — optional fallback from create-flow chrome
  const preferredWorkspaceId =
    initialWorkspaceId || createContext?.workspaceId || createContext?.initialWorkspaceId || null
  const preferredFolderId =
    initialFolderId || createContext?.folderId || createContext?.initialFolderId || null

  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)

  const handleSelect = async (template) => {
    setCreating(true)
    setError('')
    try {
      const ctx = await resolvePresentationWorkspaceContext({
        preferredWorkspaceId,
        preferredFolderId,
      })
      const isBlank = template.id === 'blank' || template.createMode === 'blank'
      const isPack = template.createMode === 'pack'
      const brandKitId = template.brandKitId || null

      let body
      if (isPack) {
        body = {
          title: `${template.name || 'Pack'} Deck`,
          folderId: ctx.folderId,
          locale: 'en',
          aspectRatio: '16:9',
          createMode: 'pack',
          packId: template.packId || template.id,
          ...(brandKitId ? { brandKitId } : {}),
        }
      } else if (isBlank) {
        body = {
          title: 'Untitled Presentation',
          folderId: ctx.folderId,
          locale: 'en',
          aspectRatio: '16:9',
          createMode: 'blank',
          ...(brandKitId ? { brandKitId } : {}),
        }
      } else {
        body = {
          title: `${template.name || 'Template'} Deck`,
          folderId: ctx.folderId,
          locale: 'en',
          aspectRatio: '16:9',
          createMode: 'template',
          templateId: template.id || template.templateId,
          ...(brandKitId ? { brandKitId } : {}),
        }
      }

      // Local preview ids are not backend catalog theme ids, so only forward verified ones.
      if (isBlank && template.themeId && template.fromCatalog) {
        body.themeId = toApiThemeId(template.themeId)
      }
      if (isPack && template.themeId) {
        body.themeId = toApiThemeId(template.themeId)
      }

      const created = await presentationService.createPresentation(ctx.workspaceId, body)
      const presentationId = extractPresentationId(created)
      if (!presentationId) throw new Error('Presentation created but no id returned')

      // Ensure blank decks have at least one slide (packs already return multi-slide skeletons)
      if (isBlank) {
        try {
          await presentationService.addSlide(ctx.workspaceId, presentationId, {})
        } catch {
          // Some backends may auto-create the first slide
        }
      }

      const nextSession = {
        workspaceId: ctx.workspaceId,
        folderId: ctx.folderId,
        presentationId,
        config: {
          title: body.title,
          theme: toApiThemeId(template.themeId || template.id) || 'petrol',
          workspaceId: ctx.workspaceId,
          presentationId,
          brandKitId,
          packId: isPack ? body.packId : null,
        },
      }

      setSession(nextSession)
      setSelectedTemplate(template)

      if (onOpenEditor) {
        onOpenEditor({
          outline: [],
          config: nextSession.config,
          workspaceId: nextSession.workspaceId,
          presentationId: nextSession.presentationId,
          folderId: nextSession.folderId,
        })
      }
    } catch (err) {
      if (isInsufficientCreditsError(err)) {
        setError(err.message || 'Insufficient credits')
      } else {
        setError(err.message || 'Failed to create presentation')
      }
    } finally {
      setCreating(false)
    }
  }

  if (!selectedTemplate || !session) {
    return (
      <div className="aig-container">
        <div className="aig-bg-sky">
          <div className="aig-bg-wave aig-bg-wave-1"></div>
          <div className="aig-bg-wave aig-bg-wave-2"></div>
          <div className="aig-bg-wave aig-bg-wave-3"></div>
        </div>
        {error && (
          <div className="aig-flow-error" role="alert">
            {error}
            <button type="button" onClick={() => setError('')}>
              Dismiss
            </button>
          </div>
        )}
        {creating && (
          <div className="aig-flow-error" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            Creating presentation…
          </div>
        )}
        <TemplateSelector
          onSelect={handleSelect}
          onBack={onBack}
          disabled={creating}
          initialWorkspaceId={preferredWorkspaceId}
          initialFolderId={preferredFolderId}
        />
      </div>
    )
  }

  return (
    <AIPptEditor
      outline={[]}
      config={session.config}
      workspaceId={session.workspaceId}
      presentationId={session.presentationId}
      onBack={() => {
        setSelectedTemplate(null)
        setSession(null)
      }}
    />
  )
}
