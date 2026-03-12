import React, { useEffect, useRef, useState } from 'react';
import { FiLayers, FiMove, FiFileText, FiCloud, FiFilm, FiPlay } from 'react-icons/fi';

/* ── Feature data ── */
const features = [
    {
        title: "Scene-Based Editor",
        description: "Organize your video using scenes and manage each segment independently.",
        Icon: FiLayers,
        color: "#3b82f6",
        bg: "rgba(59,130,246,0.08)",
    },
    {
        title: "Drag & Drop Layout",
        description: "Easily position text, avatars, and images using a visual canvas editor.",
        Icon: FiMove,
        color: "#6366f1",
        bg: "rgba(99,102,241,0.08)",
    },
    {
        title: "Script Editor",
        description: "Write narration scripts for each scene that the AI avatar will speak automatically.",
        Icon: FiFileText,
        color: "#0ea5e9",
        bg: "rgba(14,165,233,0.08)",
    },
    {
        title: "Cloud Rendering",
        description: "Generate videos using scalable cloud infrastructure without slowing your device.",
        Icon: FiCloud,
        color: "#8b5cf6",
        bg: "rgba(139,92,246,0.08)",
    },
    {
        title: "HD Video Output",
        description: "Export high-quality videos in 720p and 1080p ready for distribution.",
        Icon: FiFilm,
        color: "#10b981",
        bg: "rgba(16,185,129,0.08)",
    },
];

/* ── Intersection Observer hook ── */
function useReveal(threshold = 0.12) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setVisible(true); },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

/* ── Styles ── */
const css = `
  .pf-section {
    padding: 100px 20px;
    background: #ffffff;
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    overflow: hidden;
  }

  /* Header */
  .pf-badge {
    display: inline-block;
    padding: 6px 18px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #6366f1;
    background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(59,130,246,0.08));
    border: 1px solid rgba(99,102,241,0.15);
    margin-bottom: 18px;
  }
  .pf-heading {
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
    margin: 0 0 14px;
  }
  .pf-heading span {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .pf-subtext {
    font-size: clamp(15px, 1.6vw, 17px);
    color: #64748b;
    max-width: 620px;
    margin: 0 auto;
    line-height: 1.7;
  }

  /* Two-column grid */
  .pf-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    max-width: 1060px;
    margin: 64px auto 0;
    align-items: center;
  }

  /* ── Left: Editor preview ── */
  .pf-preview {
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    background: linear-gradient(145deg, #f8fafc, #f1f5f9);
    box-shadow: 0 20px 60px rgba(0,0,0,0.06);
    overflow: hidden;
    transition: transform 0.5s ease, box-shadow 0.5s ease;
    opacity: 0;
    transform: translateX(-40px);
    animation: none;
  }
  .pf-preview.visible {
    opacity: 1;
    transform: translateX(0);
    transition: opacity 0.8s ease, transform 0.8s ease, box-shadow 0.5s ease;
  }
  .pf-preview:hover {
    transform: translateY(-4px);
    box-shadow: 0 28px 70px rgba(59,130,246,0.1);
  }

  /* toolbar */
  .pf-toolbar {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 13px 18px;
    border-bottom: 1px solid #e2e8f0;
    background: #fff;
  }
  .pf-dot { width: 10px; height: 10px; border-radius: 50%; }
  .pf-dot--r { background: #f87171; }
  .pf-dot--y { background: #fbbf24; }
  .pf-dot--g { background: #34d399; }
  .pf-toolbar-title {
    margin-left: 10px;
    font-size: 11px;
    color: #94a3b8;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }

  /* canvas area */
  .pf-canvas {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 340px;
  }

  .pf-canvas-row {
    display: flex;
    gap: 12px;
  }
  .pf-canvas-sidebar {
    width: 100px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .pf-canvas-sidebar-item {
    height: 36px;
    border-radius: 8px;
    background: #e2e8f0;
    border: 1px solid #cbd5e1;
  }
  .pf-canvas-sidebar-item.active {
    background: linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.08));
    border-color: rgba(59,130,246,0.3);
  }

  .pf-canvas-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .pf-canvas-video {
    flex: 1;
    border-radius: 14px;
    border: 2px dashed #cbd5e1;
    background: linear-gradient(135deg, rgba(59,130,246,0.03), rgba(99,102,241,0.03));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 160px;
  }
  .pf-canvas-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pf-canvas-icon svg { width: 22px; height: 22px; color: #fff; }
  .pf-canvas-label {
    font-size: 11px;
    color: #94a3b8;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }

  /* Timeline strip */
  .pf-strip {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .pf-strip-bar { height: 7px; border-radius: 4px; }
  .pf-strip-1 { width: 70px; background: linear-gradient(90deg, #3b82f6, #6366f1); }
  .pf-strip-2 { width: 45px; background: rgba(59,130,246,0.22); }
  .pf-strip-3 { width: 55px; background: rgba(99,102,241,0.17); }
  .pf-strip-4 { flex: 1; background: #e2e8f0; }

  /* Scene thumbnails */
  .pf-scenes {
    display: flex;
    gap: 8px;
  }
  .pf-scene-thumb {
    flex: 1;
    height: 48px;
    border-radius: 8px;
    background: #e2e8f0;
    border: 1px solid #cbd5e1;
  }

  /* ── Right: Feature list ── */
  .pf-features {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .pf-feature {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 18px 20px;
    border-radius: 14px;
    border: 1px solid #f1f5f9;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    cursor: default;
    opacity: 0;
    transform: translateX(30px);
    transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }
  .pf-feature.visible {
    opacity: 1;
    transform: translateX(0);
  }
  .pf-feature:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(59,130,246,0.08);
    border-color: rgba(59,130,246,0.2);
  }

  .pf-feature-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }
  .pf-feature:hover .pf-feature-icon {
    transform: scale(1.1);
  }
  .pf-feature-icon svg { width: 20px; height: 20px; }

  .pf-feature-text h4 {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px;
  }
  .pf-feature-text p {
    font-size: 13px;
    color: #64748b;
    line-height: 1.55;
    margin: 0;
  }

  /* ── Responsive ── */
  @media (max-width: 860px) {
    .pf-grid {
      grid-template-columns: 1fr;
      gap: 40px;
      max-width: 560px;
    }
    .pf-preview.visible { transform: translateX(0); }
  }
  @media (max-width: 540px) {
    .pf-section { padding: 64px 16px; }
    .pf-canvas { padding: 16px; min-height: 240px; }
    .pf-canvas-sidebar { width: 72px; }
  }
`;

const PlatformFeatures = () => {
    const [previewRef, previewVisible] = useReveal(0.1);
    const [featRef, featVisible] = useReveal(0.05);

    return (
        <>
            <style>{css}</style>
            <section className="pf-section">
                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <div className="pf-badge">Platform Features</div>
                    <h2 className="pf-heading">
                        Powerful AI Video <span>Creation Platform</span>
                    </h2>
                    <p className="pf-subtext">
                        Create professional AI-powered videos using an intuitive editor,
                        smart automation, and scalable cloud rendering.
                    </p>
                </div>

                {/* Two-column layout */}
                <div className="pf-grid">
                    {/* ── Left: Editor Preview ── */}
                    <div
                        ref={previewRef}
                        className={`pf-preview${previewVisible ? ' visible' : ''}`}
                    >
                        <div className="pf-toolbar">
                            <div className="pf-dot pf-dot--r" />
                            <div className="pf-dot pf-dot--y" />
                            <div className="pf-dot pf-dot--g" />
                            <span className="pf-toolbar-title">AthenaVI — Scene Editor</span>
                        </div>

                        <div className="pf-canvas">
                            <div className="pf-canvas-row" style={{ flex: 1 }}>
                                <div className="pf-canvas-sidebar">
                                    <div className="pf-canvas-sidebar-item active" />
                                    <div className="pf-canvas-sidebar-item" />
                                    <div className="pf-canvas-sidebar-item" />
                                    <div className="pf-canvas-sidebar-item" />
                                </div>
                                <div className="pf-canvas-main">
                                    <div className="pf-canvas-video">
                                        <div className="pf-canvas-icon">
                                            <FiPlay />
                                        </div>
                                        <span className="pf-canvas-label">AI_AVATAR_PREVIEW</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pf-strip">
                                <div className="pf-strip-bar pf-strip-1" />
                                <div className="pf-strip-bar pf-strip-2" />
                                <div className="pf-strip-bar pf-strip-3" />
                                <div className="pf-strip-bar pf-strip-4" />
                            </div>

                            <div className="pf-scenes">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="pf-scene-thumb" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Feature List ── */}
                    <div className="pf-features" ref={featRef}>
                        {features.map((feat, i) => {
                            const { Icon } = feat;
                            return (
                                <div
                                    key={i}
                                    className={`pf-feature${featVisible ? ' visible' : ''}`}
                                    style={{
                                        transitionDelay: featVisible ? `${i * 0.1}s` : '0s',
                                    }}
                                >
                                    <div
                                        className="pf-feature-icon"
                                        style={{ background: feat.bg }}
                                    >
                                        <Icon style={{ color: feat.color }} />
                                    </div>
                                    <div className="pf-feature-text">
                                        <h4>{feat.title}</h4>
                                        <p>{feat.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
};

export default PlatformFeatures;
