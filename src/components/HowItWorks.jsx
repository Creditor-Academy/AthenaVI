import React, { useEffect, useRef, useState } from 'react';
import { FiFolderPlus, FiFileText, FiUser, FiPlay } from 'react-icons/fi';

/* ── Step data ── */
const steps = [
  {
    title: "Create Project",
    description: "Start a new project in your workspace and organize your video scenes.",
    Icon: FiFolderPlus,
  },
  {
    title: "Write Script",
    description: "Add narration text for each scene. The AI avatar will speak this script automatically.",
    Icon: FiFileText,
  },
  {
    title: "Choose AI Avatar",
    description: "Select an AI instructor avatar and customize voice and layout.",
    Icon: FiUser,
  },
  {
    title: "Generate Video",
    description: "Render the final video in HD and share it instantly.",
    Icon: FiPlay,
  },
];

/* ── Intersection Observer hook ── */
function useReveal(threshold = 0.15) {
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

/* ── Inline styles (keeps everything in one file) ── */
const css = `
  .hiw-section {
    padding: 100px 20px;
    background: #ffffff;
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    overflow: hidden;
  }

  /* ── Header ── */
  .hiw-badge {
    display: inline-block;
    padding: 6px 18px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #3b82f6;
    background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.08));
    border: 1px solid rgba(59,130,246,0.15);
    margin-bottom: 18px;
  }
  .hiw-heading {
    font-size: clamp(28px, 4vw, 46px);
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
    margin: 0 0 14px;
  }
  .hiw-heading span {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hiw-subtext {
    font-size: clamp(15px, 1.6vw, 18px);
    color: #64748b;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.7;
  }

  /* ── Timeline grid ── */
  .hiw-timeline {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    max-width: 960px;
    margin: 60px auto 0;
    position: relative;
  }

  /* connector line */
  .hiw-timeline::before {
    content: '';
    position: absolute;
    top: 38px;
    left: calc(12.5% + 20px);
    right: calc(12.5% + 20px);
    height: 2px;
    background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #3b82f6);
    border-radius: 2px;
    z-index: 0;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .hiw-timeline.visible::before {
    transform: scaleX(1);
  }

  /* ── Step card ── */
  .hiw-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 12px;
    position: relative;
    z-index: 1;
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .hiw-timeline.visible .hiw-step { opacity: 1; transform: translateY(0); }
  .hiw-timeline.visible .hiw-step:nth-child(1) { transition-delay: 0.15s; }
  .hiw-timeline.visible .hiw-step:nth-child(2) { transition-delay: 0.3s; }
  .hiw-timeline.visible .hiw-step:nth-child(3) { transition-delay: 0.45s; }
  .hiw-timeline.visible .hiw-step:nth-child(4) { transition-delay: 0.6s; }

  .hiw-icon-wrap {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    box-shadow: 0 8px 24px rgba(59,130,246,0.25);
    transition: transform 0.35s ease, box-shadow 0.35s ease;
    position: relative;
    z-index: 2;
  }
  .hiw-step:hover .hiw-icon-wrap {
    transform: scale(1.1) rotate(8deg);
    box-shadow: 0 12px 32px rgba(59,130,246,0.35);
  }
  .hiw-icon-wrap svg {
    width: 28px;
    height: 28px;
    color: #fff;
    stroke-width: 2;
  }

  .hiw-step-num {
    font-size: 12px;
    font-weight: 700;
    color: #3b82f6;
    letter-spacing: 0.1em;
    margin-bottom: 6px;
    text-transform: uppercase;
  }

  .hiw-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 24px 18px 20px;
    margin-top: 8px;
    width: 100%;
    max-width: 220px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.3s ease;
  }
  .hiw-step:hover .hiw-card {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(59,130,246,0.12);
    border-color: rgba(59,130,246,0.3);
  }
  .hiw-card h3 {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 8px;
  }
  .hiw-card p {
    font-size: 13px;
    line-height: 1.6;
    color: #64748b;
    margin: 0;
  }

  /* ── Demo preview ── */
  .hiw-demo-wrap {
    max-width: 880px;
    margin: 72px auto 0;
    opacity: 0;
    transform: translateY(32px);
    transition: opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s;
  }
  .hiw-demo-wrap.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .hiw-demo {
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    background: linear-gradient(145deg, #f8fafc, #f1f5f9);
    box-shadow: 0 20px 60px rgba(0,0,0,0.06);
    overflow: hidden;
    transition: box-shadow 0.4s ease;
  }
  .hiw-demo:hover {
    box-shadow: 0 24px 64px rgba(59,130,246,0.1);
  }

  /* Mock toolbar */
  .hiw-demo-toolbar {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 14px 18px;
    border-bottom: 1px solid #e2e8f0;
    background: #fff;
  }
  .hiw-dot { width: 10px; height: 10px; border-radius: 50%; }
  .hiw-dot--r { background: #f87171; }
  .hiw-dot--y { background: #fbbf24; }
  .hiw-dot--g { background: #34d399; }
  .hiw-demo-title {
    margin-left: 10px;
    font-size: 12px;
    color: #94a3b8;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }

  /* Mock canvas */
  .hiw-demo-canvas {
    padding: 32px;
    min-height: 320px;
    display: flex;
    gap: 20px;
  }

  .hiw-demo-sidebar {
    width: 180px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .hiw-demo-sidebar-item {
    height: 44px;
    border-radius: 10px;
    background: #e2e8f0;
    border: 1px solid #cbd5e1;
    transition: background 0.2s;
  }
  .hiw-demo-sidebar-item.active {
    background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1));
    border-color: rgba(59,130,246,0.3);
  }

  .hiw-demo-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .hiw-demo-video {
    flex: 1;
    border-radius: 14px;
    border: 2px dashed #cbd5e1;
    background: linear-gradient(135deg, rgba(59,130,246,0.04), rgba(99,102,241,0.04));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .hiw-demo-video-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hiw-demo-video-icon svg {
    width: 24px;
    height: 24px;
    color: #fff;
  }
  .hiw-demo-video-label {
    font-size: 12px;
    color: #94a3b8;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }

  .hiw-demo-timeline-bar {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .hiw-demo-tbar { height: 8px; border-radius: 6px; }
  .hiw-demo-tbar--1 { width: 80px; background: linear-gradient(90deg, #3b82f6, #6366f1); }
  .hiw-demo-tbar--2 { width: 50px; background: rgba(59,130,246,0.25); }
  .hiw-demo-tbar--3 { width: 65px; background: rgba(99,102,241,0.2); }
  .hiw-demo-tbar--4 { flex: 1; background: #e2e8f0; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .hiw-timeline {
      grid-template-columns: repeat(2, 1fr);
      gap: 36px 0;
      max-width: 520px;
    }
    .hiw-timeline::before { display: none; }
    .hiw-demo-sidebar { display: none; }
  }
  @media (max-width: 540px) {
    .hiw-section { padding: 64px 16px; }
    .hiw-timeline {
      grid-template-columns: 1fr;
      gap: 28px;
      max-width: 300px;
    }
    .hiw-demo-canvas { padding: 20px; min-height: 240px; }
  }
`;

const HowItWorks = () => {
  const [tlRef, tlVisible] = useReveal(0.1);
  const [demoRef, demoVisible] = useReveal(0.1);

  return (
    <>
      <style>{css}</style>
      <section className="hiw-section">
        <div style={{ textAlign: 'center' }}>
          <div className="hiw-badge">AI Video Workflow</div>
          <h2 className="hiw-heading">
            Create AI Videos in <span>4 Simple Steps</span>
          </h2>
          <p className="hiw-subtext">
            Turn scripts into professional AI-powered videos with avatars, voice,
            and scenes — in minutes.
          </p>
        </div>

        {/* ── Timeline ── */}
        <div
          ref={tlRef}
          className={`hiw-timeline${tlVisible ? ' visible' : ''}`}
        >
          {steps.map((step, i) => {
            const { Icon } = step;
            return (
              <div className="hiw-step" key={i}>
                <div className="hiw-icon-wrap">
                  <Icon />
                </div>
                <div className="hiw-step-num">Step {i + 1}</div>
                <div className="hiw-card">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Demo Preview ── */}
        <div
          ref={demoRef}
          className={`hiw-demo-wrap${demoVisible ? ' visible' : ''}`}
        >
          <div className="hiw-demo">
            {/* Toolbar */}
            <div className="hiw-demo-toolbar">
              <div className="hiw-dot hiw-dot--r" />
              <div className="hiw-dot hiw-dot--y" />
              <div className="hiw-dot hiw-dot--g" />
              <span className="hiw-demo-title">AthenaVI — Video Editor</span>
            </div>

            {/* Canvas */}
            <div className="hiw-demo-canvas">
              {/* Sidebar */}
              <div className="hiw-demo-sidebar">
                <div className="hiw-demo-sidebar-item active" />
                <div className="hiw-demo-sidebar-item" />
                <div className="hiw-demo-sidebar-item" />
                <div className="hiw-demo-sidebar-item" />
                <div className="hiw-demo-sidebar-item" />
              </div>

              {/* Main area */}
              <div className="hiw-demo-main">
                <div className="hiw-demo-video">
                  <div className="hiw-demo-video-icon">
                    <FiPlay />
                  </div>
                  <span className="hiw-demo-video-label">AI_AVATAR_PREVIEW</span>
                </div>
                <div className="hiw-demo-timeline-bar">
                  <div className="hiw-demo-tbar hiw-demo-tbar--1" />
                  <div className="hiw-demo-tbar hiw-demo-tbar--2" />
                  <div className="hiw-demo-tbar hiw-demo-tbar--3" />
                  <div className="hiw-demo-tbar hiw-demo-tbar--4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HowItWorks;