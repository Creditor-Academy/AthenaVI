import React, { useRef, useState, useCallback } from 'react';
import { FiLayers, FiMove, FiFileText, FiCloud, FiFilm, FiPlay, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

/* ── Feature data ── */
const features = [
    {
        title: "Scene-Based Editor",
        description: "Organize your video using scenes and manage each segment independently.",
        Icon: FiLayers,
        previewKey: 'scenes',
    },
    {
        title: "Drag & Drop Layout",
        description: "Easily position text, avatars, and images using a visual canvas editor.",
        Icon: FiMove,
        previewKey: 'dragdrop',
    },
    {
        title: "Script Editor",
        description: "Write narration scripts for each scene that the AI avatar will speak automatically.",
        Icon: FiFileText,
        previewKey: 'script',
    },
    {
        title: "Cloud Rendering",
        description: "Generate videos using scalable cloud infrastructure without slowing your device.",
        Icon: FiCloud,
        previewKey: 'cloud',
    },
    {
        title: "HD Video Output",
        description: "Export high-quality videos in 720p and 1080p ready for distribution.",
        Icon: FiFilm,
        previewKey: 'hd',
    },
];


/* ── Feature Card with cursor glow ── */
const FeatureCard = ({ feat, index, isActive, onActivate }) => {
    const cardRef = useRef(null);
    const [glowPos, setGlowPos] = useState({ x: '50%', y: '50%' });
    const [isHovered, setIsHovered] = useState(false);
    const { Icon } = feat;

    const handleMouseMove = useCallback((e) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setGlowPos({ x: `${x}%`, y: `${y}%` });
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        onActivate(index);
    }, [index, onActivate]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onActivate(index)}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '22px 26px',
                borderRadius: '16px',
                border: isActive
                    ? '1px solid rgba(59,130,246,0.4)'
                    : '1px solid rgba(0,0,0,0.06)',
                background: '#ffffff',
                boxShadow: isActive
                    ? '0 20px 50px rgba(59,130,246,0.25), inset 0 1px rgba(255,255,255,0.8)'
                    : '0 12px 30px rgba(0,0,0,0.15), inset 0 1px rgba(255,255,255,0.6)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transform: isActive ? 'scale(1.03)' : isHovered ? 'translateX(8px) scale(1.02)' : 'none',
            }}
        >
            {/* Accent strip on active card */}
            {isActive && (
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '12%',
                    bottom: '12%',
                    width: '4px',
                    borderRadius: '0 4px 4px 0',
                    background: 'linear-gradient(180deg, #3b82f6, #9333ea)',
                    boxShadow: '0 0 12px rgba(59,130,246,0.5)',
                }} />
            )}

            {/* Cursor-follow glow */}
            <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                borderRadius: '16px',
                background: isHovered
                    ? `radial-gradient(circle at ${glowPos.x} ${glowPos.y}, rgba(59,130,246,0.12), transparent 60%)`
                    : 'transparent',
            }} />

            {/* Connector line */}
            <div style={{
                position: 'absolute',
                left: '-48px',
                top: '50%',
                width: '48px',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #3b82f6)',
                opacity: isActive ? 0.7 : 0,
                transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'right',
                pointerEvents: 'none',
            }} />

            {/* Icon */}
            <motion.div
                style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #3b82f6, #9333ea)',
                    boxShadow: isHovered
                        ? '0 12px 24px rgba(59,130,246,0.45)'
                        : '0 6px 16px rgba(59,130,246,0.25)',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <Icon style={{ width: 24, height: 24, color: '#ffffff' }} />
            </motion.div>

            {/* Text */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '17px',
                    fontWeight: 600,
                    color: '#1e293b',
                    margin: '0 0 5px',
                    letterSpacing: '-0.01em',
                    lineHeight: '1.4',
                }}>
                    {feat.title}
                </h4>
                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    color: '#475569',
                    lineHeight: '1.6',
                    margin: 0,
                    fontWeight: 400,
                }}>
                    {feat.description}
                </p>
            </div>
        </motion.div>
    );
};

/* ── Editor Preview Panel — reacts to active feature ── */
const EditorPreview = ({ activeKey }) => {
    const previews = {
        scenes: (
            <motion.div key="scenes">
                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                    <div style={{ width: '100px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <motion.div
                                key={i}
                                style={{
                                    height: '36px',
                                    borderRadius: '8px',
                                    background: i === 1
                                        ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(147,51,234,0.1))'
                                        : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${i === 1 ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {i === 1 && <div style={{ width: '60%', height: '4px', borderRadius: '2px', background: 'linear-gradient(90deg, #3b82f6, #9333ea)' }} />}
                            </motion.div>
                        ))}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{
                            flex: 1, borderRadius: '12px',
                            background: 'linear-gradient(180deg, rgba(59,130,246,0.08), rgba(255,255,255,0.02))',
                            border: '1px solid rgba(59,130,246,0.2)',
                            minHeight: '150px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'inset 0 0 20px rgba(59,130,246,0.06)',
                        }}>
                            <motion.div
                                style={{
                                    width: '52px', height: '52px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 24px rgba(59,130,246,0.45)',
                                }}
                            >
                                <FiPlay style={{ color: '#fff', width: 20, height: 20, marginLeft: 3 }} />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        ),

        dragdrop: (
            <motion.div key="dragdrop">
                <div style={{ flex: 1, position: 'relative', minHeight: '180px' }}>
                    {[
                        { label: 'Avatar', x: '10%', y: '10%', w: '40%', h: '60%', color: '#3b82f6' },
                        { label: 'Title', x: '55%', y: '15%', w: '38%', h: '20%', color: '#9333ea' },
                        { label: 'Subtitle', x: '55%', y: '45%', w: '35%', h: '12%', color: '#0ea5e9' },
                    ].map((box, i) => (
                        <motion.div
                            key={box.label}
                            style={{
                                position: 'absolute', left: box.x, top: box.y,
                                width: box.w, height: box.h,
                                borderRadius: '8px',
                                border: `1.5px dashed ${box.color}60`,
                                background: `${box.color}12`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <span style={{ fontSize: '10px', color: `${box.color}cc`, fontFamily: 'monospace' }}>{box.label}</span>
                        </motion.div>
                    ))}
                    <motion.div
                        style={{
                            position: 'absolute', bottom: '10%', right: '5%',
                            width: '20px', height: '20px', cursor: 'grab',
                            opacity: 0.7,
                        }}
                    >
                        <FiMove style={{ color: '#60a5fa', width: 18, height: 18 }} />
                    </motion.div>
                </div>
            </motion.div>
        ),

        script: (
            <motion.div key="script">
                <div style={{
                    flex: 1, borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '16px',
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    fontSize: '12px',
                    minHeight: '160px',
                }}>
                    {['Welcome to AthenaVI, your AI-powered', 'video creation platform.', '', 'Today we explore Scene 2.'].map((line, i) => (
                        <motion.div
                            key={i}
                            style={{ color: line === '' ? 'transparent' : 'rgba(255,255,255,0.7)', marginBottom: '6px', minHeight: '18px' }}
                        >
                            {line || '​'}
                        </motion.div>
                    ))}
                    <motion.span
                        style={{ display: 'inline-block', width: '2px', height: '14px', background: '#3b82f6', verticalAlign: 'middle' }}
                    />
                </div>
            </motion.div>
        ),

        cloud: (
            <motion.div key="cloud">
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '160px', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                        RENDERING IN PROGRESS
                    </div>
                    {[
                        { label: 'Audio Processing', pct: 100, color: '#10b981' },
                        { label: 'Scene Compositing', pct: 72, color: '#3b82f6' },
                        { label: 'Avatar Generation', pct: 45, color: '#9333ea' },
                    ].map((item) => (
                        <div key={item.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{item.label}</span>
                                <span style={{ fontSize: '11px', color: item.color, fontFamily: 'monospace' }}>{item.pct}%</span>
                            </div>
                            <div style={{ height: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                <motion.div
                                    style={{ height: '100%', borderRadius: '4px', background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`, width: `${item.pct}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        ),

        hd: (
            <motion.div key="hd">
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '160px', justifyContent: 'center', alignItems: 'center' }}>
                    <motion.div
                        style={{
                            padding: '8px 20px', borderRadius: '100px',
                            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                            fontSize: '14px', fontWeight: 700, color: '#fff',
                            letterSpacing: '0.05em',
                            boxShadow: '0 0 30px rgba(16,185,129,0.35)',
                        }}
                    >
                        1080p HD
                    </motion.div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {['720p', '1080p', '4K'].map((res, i) => (
                            <motion.div
                                key={res}
                                style={{
                                    padding: '5px 14px', borderRadius: '8px',
                                    background: res === '1080p' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${res === '1080p' ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                    fontSize: '11px', color: res === '1080p' ? '#60a5fa' : 'rgba(255,255,255,0.4)',
                                    fontFamily: 'monospace',
                                }}
                            >{res}</motion.div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                        <FiCheck style={{ color: '#10b981', width: 14, height: 14 }} />
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>Ready for export</span>
                    </div>
                </div>
            </motion.div>
        ),
    };

    return previews[activeKey] || previews['scenes'];
};

/* ── Styles ── */
const css = `
  .pf-section {
    padding: 80px 20px 100px;
    background: #1e40af;
    background-image: 
      radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.3) 0%, transparent 40%),
      radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.15) 0%, transparent 40%),
      linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    position: relative;
    overflow: hidden;
  }

  .pf-section::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.025;
    pointer-events: none;
    z-index: 1;
  }

  .pf-badge {
    display: inline-block;
    padding: 6px 18px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #fbfbfbff;
    background: rgba(142, 179, 237, 0.1);
    border: 1px solid rgba(217, 229, 249, 0.2);
    margin-bottom: 18px;
    backdrop-filter: blur(4px);
  }
  .pf-heading {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 55px;
    font-weight: 400;
    color: #ffffff;
    line-height: 1.2;
    margin: 0 0 20px;
    letter-spacing: -1.5px;
  }
  .pf-heading span {
    background: linear-gradient(135deg, #fde047, #fbbf24);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline-block;
  }
  .pf-subtext {
    font-family: 'Inter', sans-serif;
    font-size: clamp(15px, 1.8vw, 18px);
    color: rgba(255, 255, 255, 0.75);
    max-width: 680px;
    margin: 0 auto;
    line-height: 1.7;
    letter-spacing: 0;
    font-weight: 400;
  }

  .pf-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    max-width: 1060px;
    margin: 64px auto 0;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .pf-preview-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .pf-editor-glow {
    position: absolute;
    width: 140%;
    height: 140%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%);
    z-index: 0;
    pointer-events: none;
  }
  .pf-preview {
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(12, 14, 22, 0.75);
    backdrop-filter: blur(20px);
    box-shadow: 
      0 0 0 1px rgba(255, 255, 255, 0.05),
      0 24px 64px rgba(0,0,0,0.55);
    overflow: hidden;
    position: relative;
    z-index: 1;
    width: 100%;
  }
  .pf-preview::after {
    content: "";
    position: absolute;
    top: 0; left: -150%; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
    transform: skewX(-20deg);
    /* animation removed */
  }

  .pf-toolbar {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 13px 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
  }
  .pf-dot { width: 10px; height: 10px; border-radius: 50%; }
  .pf-dot--r { background: #f87171; }
  .pf-dot--y { background: #fbbf24; }
  .pf-dot--g { background: #34d399; }
  .pf-toolbar-title {
    margin-left: 10px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.35);
    font-family: 'SF Mono', 'Fira Code', monospace;
  }

  .pf-canvas {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 320px;
  }

  .pf-strip {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .pf-strip-bar { height: 7px; border-radius: 4px; }
  .pf-strip-1 { width: 70px; background: linear-gradient(90deg, #fbbf24, #f59e0b); }
  .pf-strip-2 { width: 45px; background: rgba(255, 255, 255, 0.15); }
  .pf-strip-3 { width: 55px; background: rgba(255, 255, 255, 0.1); }
  .pf-strip-4 { flex: 1; background: rgba(255, 255, 255, 0.05); }

  .pf-scenes {
    display: flex;
    gap: 8px;
  }
  .pf-scene-thumb {
    flex: 1;
    height: 44px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .pf-features {
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: relative;
  }

  @media (max-width: 860px) {
    .pf-grid {
      grid-template-columns: 1fr;
      gap: 40px;
      max-width: 560px;
    }
  }
  @media (max-width: 540px) {
    .pf-section { padding: 64px 16px 120px; }
    .pf-canvas { padding: 16px; min-height: 240px; }
  }
`;

const PlatformFeatures = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const activeFeature = features[activeIndex];

    return (
        <>
            <style>{css}</style>
            <section className="pf-section">
                {/* Header */}
                <motion.div
                    style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}
                >
                    <div className="pf-badge">Platform Features</div>
                    <h2 className="pf-heading">
                        Powerful AI Video <span>Creation Platform</span>
                    </h2>
                    <p className="pf-subtext">
                        Create professional AI-powered videos using an intuitive editor,
                        smart automation, and scalable cloud rendering.
                    </p>
                </motion.div>

                {/* Two-column layout */}
                <div className="pf-grid">
                    {/* ── Left: Editor Preview ── */}
                    <div className="pf-preview-container">
                        <div className="pf-editor-glow" />
                        <motion.div
                            className="pf-preview"
                        >
                            <div className="pf-toolbar">
                                <div className="pf-dot pf-dot--r" />
                                <div className="pf-dot pf-dot--y" />
                                <div className="pf-dot pf-dot--g" />
                                <span className="pf-toolbar-title">AthenaVI — {activeFeature.title}</span>
                            </div>

                            <div className="pf-canvas">
                                    <EditorPreview key={activeFeature.previewKey} activeKey={activeFeature.previewKey} />

                                <div className="pf-strip">
                                    <div className="pf-strip-bar pf-strip-1" />
                                    <div className="pf-strip-bar pf-strip-2" />
                                    <div className="pf-strip-bar pf-strip-3" />
                                    <div className="pf-strip-bar pf-strip-4" />
                                </div>

                                <div className="pf-scenes">
                                    {[1, 2, 3, 4].map(i => (
                                        <motion.div
                                            key={i}
                                            className="pf-scene-thumb"
                                            style={{
                                                background: i - 1 === activeIndex % 4
                                                    ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(147,51,234,0.1))'
                                                    : 'rgba(255,255,255,0.05)',
                                                borderColor: i - 1 === activeIndex % 4
                                                    ? 'rgba(59,130,246,0.4)'
                                                    : 'rgba(255,255,255,0.08)',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Right: Feature List ── */}
                    <div className="pf-features">
                        {features.map((feat, i) => (
                            <FeatureCard
                                key={i}
                                feat={feat}
                                index={i}
                                isActive={activeIndex === i}
                                onActivate={setActiveIndex}
                            />
                        ))}
                    </div>
                </div>

            </section>
        </>
    );
};

export default PlatformFeatures;
