import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, Image as ImageIcon, Download, Copy } from 'lucide-react';
import imageGenService from '../../../services/imageGenService.js';

export default function WorkspaceImageLibrary({ workspaceId, onImageClick }) {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!workspaceId) {
      setError("No workspace context provided.");
      setLoading(false);
      return;
    }

    const fetchGenerations = async () => {
      try {
        setLoading(true);
        const results = await imageGenService.listGenerations(workspaceId, { take: 100 });
        setGenerations(results || []);
      } catch (err) {
        console.error("Failed to load generations:", err);
        setError("Failed to load workspace images.");
      } finally {
        setLoading(false);
      }
    };

    fetchGenerations();
  }, [workspaceId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
        <Loader2 className="spinning" size={28} style={{ color: 'var(--primary, #2563eb)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', color: 'var(--text-secondary, #a0a0a0)' }}>
        <div style={{ padding: '16px 24px', background: 'var(--bg-surface, #f9fafb)', borderRadius: '16px', fontSize: '14px' }}>
          {error}
        </div>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', color: 'var(--text-secondary, #a0a0a0)' }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '50%', background: 'color-mix(in srgb, var(--primary, #2563eb) 10%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
        }}>
          <Sparkles size={28} style={{ color: 'var(--primary, #2563eb)' }} />
        </div>
        <div style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-main, #111827)', marginBottom: '8px' }}>It's quiet in here</div>
        <div style={{ fontSize: '14px', maxWidth: '250px', textAlign: 'center', lineHeight: '1.5' }}>Images you generate in this workspace will magically appear here.</div>
      </div>
    );
  }

  return (
    <div className="workspace-library-container" style={{ padding: '40px 48px', height: '100%', overflowY: 'auto', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .cute-library-card {
          border-radius: 20px;
          overflow: hidden;
          background: var(--bg-card, #ffffff);
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          display: flex;
          flex-direction: column;
          cursor: pointer;
          break-inside: avoid;
          margin-bottom: 28px;
          position: relative;
        }
        .cute-library-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }
        .cute-library-card-img-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: var(--bg-surface, #f3f4f6);
        }
        .cute-library-card-img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.5s ease;
        }
        .cute-library-card:hover .cute-library-card-img {
          transform: scale(1.05);
        }
        .cute-library-card-info {
        }
        .cute-library-card-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .cute-library-card:hover .cute-library-card-actions {
          opacity: 1;
        }
        .library-action-btn {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: transform 0.2s;
        }
        .library-action-btn:hover {
          transform: scale(1.1);
          background: #fff;
        }
      `}</style>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ padding: '8px 12px', background: 'color-mix(in srgb, var(--primary, #2563eb) 10%, transparent)', borderRadius: '12px', color: 'var(--primary, #2563eb)' }}>
          <ImageIcon size={20} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text-main, #111827)', margin: 0 }}>Workspace Library</h2>
      </div>

      <div style={{ 
        columnCount: 'auto', 
        columnWidth: '240px', 
        columnGap: '28px' 
      }}>
        {generations.map((gen, idx) => {
          const imgUrl = gen.url || gen.resultUrl;
          if (!imgUrl) return null;
          
          return (
            <div 
              key={gen.id || idx} 
              className="cute-library-card"
              onClick={() => onImageClick && gen.threadId && onImageClick(gen.threadId)}
              style={{ cursor: gen.threadId ? 'pointer' : 'default' }}
            >
              <div className="cute-library-card-img-wrapper">
                <img 
                  src={imgUrl} 
                  alt={gen.prompt || "Generated image"} 
                  className="cute-library-card-img"
                  loading="lazy"
                />
                <div className="cute-library-card-actions">
                  <button 
                    className="library-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      const a = document.createElement('a');
                      a.href = imgUrl;
                      a.download = `generation_${gen.id || idx}.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    title="Download Image"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    className="library-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(imgUrl);
                    }}
                    title="Copy Image URL"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
