import { useEffect } from 'react'
import {
  MdClose, MdAdd,
} from 'react-icons/md'
import TemplateBundlePicker from './TemplateBundlePicker'
import useTemplateBundles from '../../../../hooks/useTemplateBundles'
import { fetchTemplateAvatarLookSet, TEMPLATE_AVATAR_LOOK_COUNT } from '../../../../utils/templateAvatarPreview'

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

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .template-modal-clean {
          width: min(1120px, 92vw);
          height: min(84vh, 760px);
          background: #ffffff;
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .template-clean__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 20px;
          border-bottom: 1px solid #eef2f7;
          background: linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%);
        }

        .template-clean__title h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .template-clean__title p {
          margin: 4px 0 0;
          font-size: 13px;
          color: #64748b;
        }

        .template-clean__actions {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .template-clean__blank-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #0f172a;
          cursor: pointer;
          font-weight: 800;
          font-size: 13px;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }

        .template-clean__blank-btn:hover {
          transform: translateY(-1px);
          border-color: #cbd5e1;
          box-shadow: 0 10px 20px -14px rgba(0, 0, 0, 0.18);
        }

        .close-btn { background: transparent; border: none; cursor: pointer; color: #94a3b8; padding: 6px; border-radius: 10px; }
        .close-btn:hover { color: #0f172a; background: rgba(15, 23, 42, 0.06); }

        .template-clean__body {
          flex: 1;
          overflow-y: auto;
          padding: 18px 20px;
          background: #fafafa;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .template-card-modern {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .template-card-modern:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(0,0,0,0.1);
          border-color: #cbd5e1;
        }

        .preview-wrap {
          position: relative;
          aspect-ratio: 16/9;
          background: #f8fafc;
        }

        .hover-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 10;
        }

        .preview-wrap:hover .hover-overlay { opacity: 1; }

        .use-btn {
          background: #3b82f6;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transform: translateY(4px);
          transition: all 0.2s ease;
        }

        .preview-wrap:hover .use-btn {
          transform: translateY(0);
        }

        .duration-tag {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255, 255, 255, 0.9);
          color: #64748b;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          backdrop-filter: blur(4px);
          border: 1px solid #e2e8f0;
        }

        .card-info { padding: 12px; }

        .title-row { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          gap: 8px; 
        }
        
        .title-row h4 { 
          margin: 0; 
          font-size: 14px; 
          color: #0f172a; 
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
        
        .layout-badge {
          background: #f1f5f9;
          color: #64748b;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .loading-state, .empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes bundle-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 720px) {
          .template-modal-clean { width: 96vw; height: 92vh; border-radius: 16px; }
          .template-clean__header { padding: 14px 14px; }
          .template-clean__body { padding: 14px 14px; }
          .template-clean__title p { display: none; }
        }
      `}</style>
    </div>
  )
}
export default TemplateModal
