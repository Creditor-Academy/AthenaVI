import { useEffect } from 'react'
import {
  MdClose, MdAdd,
} from 'react-icons/md'
import TemplateBundlePicker from './TemplateBundlePicker'
import useTemplateBundles from '../../../../hooks/useTemplateBundles'
import { fetchTemplateAvatarLookSet, TEMPLATE_AVATAR_LOOK_COUNT } from '../../../../utils/templateAvatarPreview'
import './TemplateModal.css'

const TemplateModal = ({
  showTemplateModal,
  setShowTemplateModal,
  handleAddTemplateScene,
  handleApplyTemplateBundle,
  handleAddBlankScene,
}) => {
  const { bundles, loading, refetch } = useTemplateBundles('All')

  useEffect(() => {
    if (!showTemplateModal) return;
    refetch();
    fetchTemplateAvatarLookSet(TEMPLATE_AVATAR_LOOK_COUNT).catch(() => {});
  }, [showTemplateModal, refetch]);

  if (!showTemplateModal) return null

  return (
    <div className="modal-overlay template-selector-overlay">
      <div className="template-modal-clean">
        <header className="template-clean__header">
          <div className="template-clean__title">
            <h2>Choose a template</h2>
            <p>Start from a bundle, or add a blank scene.</p>
          </div>
          <div className="template-clean__actions">
            <button
              type="button"
              className="template-clean__blank-btn"
              onClick={() => handleAddBlankScene?.()}
              title="Add blank scene"
            >
              <MdAdd size={18} />
              Blank scene
            </button>
            <button className="close-btn" onClick={() => setShowTemplateModal(false)} aria-label="Close">
              <MdClose size={22} />
            </button>
          </div>
        </header>

        <div className="template-clean__body premium-scrollbar">
          <TemplateBundlePicker
            bundles={bundles}
            loading={loading}
            searchQuery=""
            activeLayout="All Layouts"
            onSelectScene={(scene) => {
              handleAddTemplateScene(scene)
              setShowTemplateModal(false)
            }}
            onApplyBundle={(bundle) => {
              handleApplyTemplateBundle?.(bundle)
              setShowTemplateModal(false)
            }}
          />
        </div>
      </div>
    </div>
  )
}
export default TemplateModal
