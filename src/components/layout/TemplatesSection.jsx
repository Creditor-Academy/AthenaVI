import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiLayers, FiEdit3, FiCpu, FiDownload, FiPlay, FiImage } from 'react-icons/fi'

/* ── Template data ── */
const TEMPLATES = [
  {
    id: 1,
    title: 'Corporate Presentation',
    subtitle: 'Professional branding showcase',
    badge: 'Popular',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    layout: [
      { label: 'Avatar', x: '8%', y: '12%', w: '38%', h: '60%' },
      { label: 'Title', x: '52%', y: '18%', w: '40%', h: '14%' },
      { label: 'Subtitle', x: '52%', y: '38%', w: '36%', h: '8%' },
      { label: 'CTA', x: '52%', y: '56%', w: '28%', h: '10%' },
    ],
  },
  {
    id: 2,
    title: 'Product Demo',
    subtitle: 'Step-by-step feature walkthrough',
    badge: 'New',
    gradient: 'linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)',
    layout: [
      { label: 'Screen', x: '6%', y: '6%', w: '88%', h: '55%' },
      { label: 'Guide', x: '6%', y: '66%', w: '30%', h: '28%' },
      { label: 'CTA', x: '42%', y: '74%', w: '24%', h: '12%' },
    ],
  },
  {
    id: 3,
    title: 'Social Story',
    subtitle: 'Short engaging content for social platforms',
    badge: 'Trending',
    gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)',
    layout: [],
  },
  {
    id: 4,
    title: 'Training Module',
    subtitle: 'Interactive educational dashboard',
    badge: 'Popular',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    layout: [],
  },
  {
    id: 5,
    title: 'Hero Section – Left Text',
    subtitle: 'Modern landing page hero layout',
    badge: 'New',
    gradient: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
    layout: [],
  },
]

/* ── Feature data ── */
const FEATURES = [
  {
    Icon: FiLayers,
    title: 'Ready-Made Templates',
    desc: 'Pre-designed templates for business, marketing, education, and social media.',
  },
  {
    Icon: FiEdit3,
    title: 'Easy Customization',
    desc: 'Edit text, avatars, colors, and layout with simple drag-and-drop controls.',
  },
  {
    Icon: FiCpu,
    title: 'Smart AI Assistance',
    desc: 'AI helps generate scripts, voice, and visuals automatically for your video.',
  },
  {
    Icon: FiDownload,
    title: 'Fast Export',
    desc: 'Generate and download videos in high quality within minutes — no rendering queues.',
  },
]

/* ── Styles ── */
const css = `
  .ts-section {
    padding: 60px 24px;
    background: #F3F4F6;
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow: hidden;
  }
  
  /* Background Glows */
  .ts-section::before {
    content: '';
    position: absolute;
    top: -10%;
    right: -5%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
    filter: blur(60px);
    pointer-events: none;
  }
  .ts-section::after {
    content: '';
    position: absolute;
    bottom: -10%;
    left: -5%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
    filter: blur(60px);
    pointer-events: none;
  }

  .ts-header {
    text-align: center;
    max-width: 800px;
    margin: 0 auto 80px;
    position: relative;
    z-index: 2;
  }
  .ts-eyebrow {
    display: inline-flex;
    align-items: center;
    padding: 8px 20px;
    background: rgba(99, 102, 241, 0.08);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(99, 102, 241, 0.1);
    border-radius: 999px;
    color: #6366F1;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.05);
  }
  .ts-title {
    font-size: 48px;
    font-weight: 800;
    color: #111827;
    line-height: 1.1;
    margin-bottom: 24px;
    letter-spacing: -1.5px;
  }
  .ts-title span {
    color: #6366F1;
    background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .ts-subtitle {
    font-size: 18px;
    color: #6B7280;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .ts-layout {
    max-width: 1300px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 40px;
    align-items: start;
    position: relative;
    z-index: 2;
  }

  /* ── Template Cards ── */
  .ts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  .ts-grid-featured {
    grid-row: span 2;
  }
  .ts-card {
    background: #FFFFFF;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.04);
    border: 1px solid #FFFFFF;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    cursor: pointer;
  }
  .ts-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px rgba(0,0,0,0.08);
    border-color: rgba(99, 102, 241, 0.2);
  }
  .ts-card-preview {
    position: relative;
    background: #F9FAFB;
    border-bottom: 1px solid #F1F5F9;
    overflow: hidden;
  }
  .ts-card-preview.featured { min-height: 480px; }
  .ts-card-preview.small { min-height: 200px; }

  .ts-card-overlay {
    position: absolute;
    inset: 0;
    background: rgba(17, 24, 39, 0.1);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.3s ease;
  }
  .ts-card:hover .ts-card-overlay {
    opacity: 1;
  }
  .ts-overlay-btn {
    padding: 12px 24px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    background: #FFFFFF;
    color: #111827;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .ts-overlay-btn:hover {
    transform: scale(1.05);
    background: #6366F1;
    color: #FFFFFF;
  }

  .ts-card-info {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #FFFFFF;
  }
  .ts-card-name {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }
  .ts-card-arrow {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #F3F4F6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #111827;
    transition: all 0.3s ease;
  }
  .ts-card:hover .ts-card-arrow {
    background: #6366F1;
    color: #FFFFFF;
    transform: rotate(-45deg);
  }

  .ts-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #FFFFFF;
    z-index: 5;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    backdrop-filter: blur(4px);
    background: rgba(99, 102, 241, 0.85);
  }

  /* ========= RIGHT: Feature Panel ========= */
  .ts-panel {
    position: sticky;
    top: 120px;
  }
  .ts-panel-title {
    font-size: 32px;
    font-weight: 800;
    color: #111827;
    margin: 0 0 16px;
    letter-spacing: -0.5px;
  }
  .ts-panel-sub {
    font-size: 16px;
    color: #6B7280;
    line-height: 1.6;
    margin-bottom: 40px;
  }
  .ts-feature-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 48px;
  }
  .ts-feature {
    display: flex;
    gap: 20px;
    padding: 16px;
    border-radius: 20px;
    transition: all 0.3s ease;
    border: 1px solid transparent;
  }
  .ts-feature:hover {
    background: #F9FAFB;
    border-color: #F1F5F9;
    transform: translateX(8px);
  }
  .ts-feature-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(99, 102, 241, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6366F1;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  .ts-feature:hover .ts-feature-icon {
    background: #6366F1;
    color: #FFFFFF;
    transform: scale(1.1) rotate(5deg);
  }
  .ts-feature-title {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 4px;
  }
  .ts-feature-desc {
    font-size: 14px;
    color: #6B7280;
    margin: 0;
    line-height: 1.5;
  }
  .ts-panel-cta {
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
    border: none;
    border-radius: 16px;
    color: #FFFFFF;
    font-size: 16px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
  }
  .ts-panel-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(99, 102, 241, 0.4);
    filter: brightness(1.1);
  }

  /* Responsive */
  @media (max-width: 1100px) {
    .ts-layout {
      grid-template-columns: 1fr;
    }
    .ts-grid-featured {
      grid-row: auto;
    }
    .ts-panel { position: static; }
  }
  @media (max-width: 600px) {
    .ts-section { padding: 64px 16px 80px; }
    .ts-grid { grid-template-columns: 1fr; }
    .ts-card-preview.featured { min-height: 240px; }
  }
`

/* ── Mini Preview Component ── */
const MiniPreview = ({ template }) => {
  const { id } = template;

  // 3. SOCIAL STORY – "Thanks for Watching" Outro
  if (id === 3) {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: '#FFFFFF',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px', gap: '0px',
        position: 'relative'
      }}>
        {/* Heading */}
        <div style={{
          fontSize: '16px', fontWeight: 600,
          color: '#111827', textAlign: 'center',
          marginBottom: '6px'
        }}>
          Thanks for Watching
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: '11px', color: '#6B7280',
          textAlign: 'center', marginBottom: '20px'
        }}>
          Follow us for more content
        </div>

        {/* 4 Social Color Boxes */}
        <div style={{
          display: 'flex', gap: '12px',
          marginBottom: '16px'
        }}>
          {['#8B5CF6', '#3B82F6', '#EC4899', '#F97316'].map((color, i) => (
            <div key={i} style={{
              width: '36px', height: '36px',
              background: color,
              borderRadius: '10px',
              flexShrink: 0
            }} />
          ))}
        </div>

        {/* Bottom Label */}
        <div style={{
          fontSize: '9px', fontWeight: 600,
          color: '#9CA3AF', textTransform: 'uppercase',
          letterSpacing: '1px', textAlign: 'center'
        }}>
          Stay Connected
        </div>
      </div>
    );
  }


  // 5. HERO SECTION – LEFT TEXT (Main Hero Layout)
  if (id === 5) {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: '#F3F4F6',
        borderRadius: '20px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        padding: '20px',
        display: 'flex', gap: '20px', alignItems: 'stretch',
        overflow: 'hidden', position: 'relative'
      }}>
        {/* ── Left: Text Content (60%) ── */}
        <div style={{ flex: '0 0 58%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Heading */}
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', lineHeight: 1.2, marginBottom: '8px' }}>
            YOUR NEXT BIG<br />IDEA STARTS HERE
          </div>
          {/* Subtitle */}
          <div style={{ fontSize: '9px', color: '#6B7280', lineHeight: 1.65, marginBottom: '14px' }}>
            The ultimate platform for AI video<br />generation and professional layouts.
          </div>
          {/* CTA Button */}
          <div style={{
            display: 'inline-flex', alignSelf: 'flex-start',
            padding: '7px 18px',
            background: '#3B82F6',
            borderRadius: '999px',
            color: '#FFFFFF',
            fontSize: '9px', fontWeight: 600,
            cursor: 'pointer'
          }}>
            Get Started
          </div>
        </div>

        {/* ── Right: Colorful Visual (40%) ── */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {/* Timer Badge — top right */}
          <div style={{
            position: 'absolute', top: '0px', right: '0px', zIndex: 2,
            background: '#6B7280', color: '#FFFFFF',
            fontSize: '8px', fontWeight: 600,
            padding: '4px 9px', borderRadius: '999px',
          }}>
            5s
          </div>

          {/* Colorful Gradient Placeholder */}
          <div style={{
            flex: 1,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '20px',
            marginBottom: '8px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Soft glass shimmer overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)', pointerEvents: 'none' }} />
            <FiImage size={24} color="rgba(255,255,255,0.7)" />
          </div>

          <div style={{
            position: 'absolute', bottom: '15px', right: '15px', zIndex: 10,
            width: '28px', height: '28px',
            background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF'
          }}>
            <FiImage size={14} />
          </div>
        </div>
      </div>
    );
  }


  // 2. COLOR BOXES (Image 2 style)
  if (id === 2) {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: '#FFFFFF',
        padding: '20px',
        display: 'flex', flexDirection: 'column',
        border: '1px solid #F1F5F9',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', position: 'relative' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Brand Palette</div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#9CA3AF' }}>8s</div>
        </div>

        {/* Color Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', flex: 1 }}>
          {[
            { bg: 'linear-gradient(135deg, #6366F1, #8B5CF6)', l: 'Primary' },
            { bg: '#3B82F6', l: 'Secondary' },
            { bg: '#EC4899', l: 'Accent' },
            { bg: '#F97316', l: 'Alert' }
          ].map((item, i) => (
            <div key={i} style={{
              background: item.bg,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '52px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              {/* Glass shimmer */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)', pointerEvents: 'none' }} />
              {/* Label inside box */}
              <div style={{ position: 'absolute', bottom: '7px', left: '9px', fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                {item.l}
              </div>
            </div>
          ))}
        </div>

        {/* Avatar Icon (Bottom Right) */}
        <div style={{
          position: 'absolute', bottom: '15px', right: '15px',
          width: '28px', height: '28px', borderRadius: '8px',
          background: '#F1F5F9', border: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <FiImage size={14} color="#9CA3AF" />
        </div>
      </div>
    );
  }


  // 3. TRAINING MODULE – Course Dashboard Style
  if (id === 4) {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: '#FFFFFF',
        padding: '20px',
        display: 'flex', flexDirection: 'column',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        border: '1px solid #F1F5F9',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#6366F1', letterSpacing: '0.5px' }}>
            MODULE 01: INTRODUCTION
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#9CA3AF' }}>01 / 12</div>
            <div style={{
              background: '#F1F5F9', color: '#6B7280', fontSize: '9px', fontWeight: 700,
              padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0'
            }}>10s</div>
          </div>
        </div>

        {/* Lesson List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {[
            { color: '#3B82F6', title: 'The Fundamentals of AI' },
            { color: '#10B981', title: 'Core Architecture' }
          ].map((lesson, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '12px',
              transition: 'all 0.2s ease', cursor: 'pointer',
              background: i === 0 ? '#F9FAFB' : 'transparent',
              border: i === 0 ? '1px solid #F1F5F9' : '1px solid transparent'
            }}>
              {/* Colored Icon Box */}
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: lesson.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 10px ${lesson.color}33`
              }}>
                <div style={{ width: '12px', height: '12px', border: '2px solid #FFF', borderRadius: '2px' }} />
              </div>
              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{lesson.title}</div>
                <div style={{ fontSize: '9px', color: '#6B7280', marginTop: '1px' }}>Master the core concepts.</div>
              </div>
            </div>
          ))}
        </div>

        {/* Avatar Icon (Bottom Right) */}
        <div style={{
          position: 'absolute', bottom: '15px', right: '15px',
          width: '28px', height: '28px', borderRadius: '8px',
          background: '#F1F5F9', border: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <FiImage size={14} color="#9CA3AF" />
        </div>
      </div>
    );
  }

  // 4. NEWS BULLETIN (Image 4 style / News Feed)
  if (id === 5) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#FFFFFF', position: 'relative', overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ fontSize: '10px', color: '#111827', fontWeight: 700, letterSpacing: '1px' }}>LIVE</span>
          </div>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#9CA3AF', fontWeight: 600 }}>7s</div>
        </div>
        <div style={{ flex: 1, background: '#F8FAFC', borderRadius: '8px', position: 'relative', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {/* Mock image area */}
          <div style={{ width: '100%', height: '60%', background: 'linear-gradient(135deg, #afc8f8ff, #052e82ff)' }} />
          <div style={{ padding: '8px' }}>
            <div style={{ width: '30px', height: '4px', background: '#6366F1', borderRadius: '2px', marginBottom: '4px' }} />
            <div style={{ fontSize: '11px', color: '#111827', fontWeight: 600, lineHeight: 1.2 }}>Market Analysis: Q3 Trends and Insights</div>
          </div>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', position: 'relative' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ flex: 1, height: '24px', background: '#F9FAFB', borderRadius: '4px', border: '1px solid #E5E7EB' }} />
          ))}
          
          {/* Avatar Icon (Bottom Right) */}
          <div style={{
            position: 'absolute', bottom: '-4px', right: '0px',
            width: '22px', height: '22px', borderRadius: '6px',
            background: '#F1F5F9', border: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiImage size={12} color="#9CA3AF" />
          </div>
        </div>
      </div>
    );
  }

  // 5. CORPORATE EXPLAINER – SaaS Dashboard Style
  if (id === 1) {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: '#F8FAFC',
        borderRadius: '24px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
        padding: '20px',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Top Bar (Browser Style) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF5F56' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27C93F' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#9CA3AF' }}>10s</div>
            <div style={{ width: '60px', height: '6px', background: '#E2E8F0', borderRadius: '3px' }} />
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', gap: '20px' }}>
          {/* Left Sidebar (Minimal) */}
          <div style={{ width: '32px', display: 'flex', flexDirection: 'column', gap: '12px', borderRight: '1px solid #E2E8F0', paddingRight: '16px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                width: '24px', height: '24px', borderRadius: '6px',
                background: i === 1 ? '#8B5CF6' : '#EDF2F7',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: i === 1 ? '#FFF' : '#CBD5E0' }} />
              </div>
            ))}
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Project Overview</div>
            </div>

            {/* Video Preview */}
            <div style={{
              width: '100%', height: '80px',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
            }}>
              {/* Abstract shapes inside gradient */}
              <div style={{ position: 'absolute', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', top: '-10px', right: '-10px' }} />
              <div style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: '10px', left: '10px' }} />
              
              
            </div>

            {/* Description Text */}
            <div style={{ fontSize: '10px', color: '#6B7280', lineHeight: 1.6, maxWidth: '90%' }}>
              A high-level summary of the project, highlighting key objectives, progress, and upcoming milestones.
            </div>

            {/* Scene Breakdown Card */}
            <div style={{
              background: '#F1F5F9', borderRadius: '16px', padding: '12px',
              display: 'flex', gap: '12px', alignItems: 'center'
            }}>
              <div style={{
                width: '40px', height: '40px', background: '#FFF', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', color: '#6366F1'
              }}>
                <FiLayers size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#111827' }}>Scene Breakdown</div>
                <div style={{ fontSize: '9px', color: '#6B7280', marginTop: '2px' }}>Intro • Key Message • Call to Action</div>
                {/* Abstract Text Lines */}
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px' }} />
                  <div style={{ width: '95%', height: '4px', background: '#E2E8F0', borderRadius: '2px' }} />
                  <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px' }} />
                  <div style={{ width: '85%', height: '4px', background: '#E2E8F0', borderRadius: '2px' }} />
                  <div style={{ width: '90%', height: '4px', background: '#E2E8F0', borderRadius: '2px' }} />
                  <div style={{ width: '60%', height: '4px', background: '#E2E8F0', borderRadius: '2px' }} />
                </div>
              </div>
            </div>

            {/* Bottom Two-Column Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', gap: '20px' }}>
              {/* Left: Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#111827' }}>Project Status</div>
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ width: '100%', height: '3px', background: '#E2E8F0', borderRadius: '2px' }} />
                  <div style={{ width: '90%', height: '3px', background: '#E2E8F0', borderRadius: '2px' }} />
                  <div style={{ width: '95%', height: '3px', background: '#E2E8F0', borderRadius: '2px' }} />
                  <div style={{ width: '60%', height: '3px', background: '#E2E8F0', borderRadius: '2px' }} />
                </div>
              </div>
              {/* Right: Image Box */}
              <div style={{
                width: '100px', height: '65px', 
                background: 'linear-gradient(135deg, #6366F1, #3B82F6)', 
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF',
                boxShadow: '0 4px 12px rgba(99,102,241,0.2)'
              }}>
                <FiImage size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Icon (Bottom Right) */}
        <div style={{
          position: 'absolute', bottom: '15px', right: '15px',
          width: '28px', height: '28px', borderRadius: '8px',
          background: '#F1F5F9', border: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <FiImage size={14} color="#9CA3AF" />
        </div>
      </div>
    );
  }



  // DEFAULT / FALLBACK
  return (
    <div style={{ width: '100%', height: '100%', background: '#FFFFFF', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FiLayers size={20} color="#6366F1" />
      </div>
      <div style={{ width: '60px', height: '8px', background: '#E5E7EB', borderRadius: '4px' }} />
      <div style={{ width: '40px', height: '6px', background: '#F3F4F6', borderRadius: '4px' }} />
    </div>
  );
}

/* ── Main Component ── */
function TemplatesSection({ onNavigateToSolution }) {
  const featured = TEMPLATES[0]
  const rest = TEMPLATES.slice(1)

  return (
    <>
      <style>{css}</style>
      <section className="ts-section">

        {/* Header */}
        <motion.div
          className="ts-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="ts-eyebrow">
            <span className="ts-eyebrow-line" />
            Video Templates
          </div>
          <h2 className="ts-title">
            Start with <span>Templates</span>, Make It Yours
          </h2>
          <p className="ts-subtitle">
            Choose a template, customize it, and generate professional videos in minutes.
          </p>
        </motion.div>

        {/* 2-Column Layout */}
        <div className="ts-layout">

          {/* ── LEFT: Asymmetric Template Grid ── */}
          <div className="ts-grid">
            {/* Featured (large, spans 2 rows) */}
            <motion.div
              className="ts-card ts-grid-featured"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              animate={{ y: [0, -4, 0] }}
            >
              <div className="ts-card-preview featured">
                <MiniPreview template={featured} />
                {featured.badge && (
                  <span className="ts-badge" style={{ background: 'rgba(59,130,246,0.7)' }}>
                    {featured.badge}
                  </span>
                )}
                <div className="ts-card-overlay">
                  <button className="ts-overlay-btn primary">
                    <FiPlay style={{ width: 14, height: 14 }} /> Use Template
                  </button>
                </div>
              </div>
              <div className="ts-card-info" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <h3 className="ts-card-name" style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>{featured.title}</h3>
                  {featured.subtitle && (
                    <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 400 }}>
                      {featured.subtitle}
                    </div>
                  )}
                </div>
                <div className="ts-card-arrow" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <FiArrowRight style={{ width: 14, height: 14 }} />
                </div>
              </div>
            </motion.div>

            {/* Smaller cards */}
            {rest.map((tmpl, i) => (
              <motion.div
                key={tmpl.id}
                className="ts-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.08 + i * 0.1 }}
                animate={{ y: [0, -3, 0] }}
              >
                <div className="ts-card-preview small">
                  <MiniPreview template={tmpl} />
                  {tmpl.badge && (
                    <span className="ts-badge" style={{
                      background: tmpl.badge === 'New'
                        ? 'rgba(16, 185, 129, 0.75)'
                        : 'rgba(59,130,246,0.7)',
                    }}>
                      {tmpl.badge}
                    </span>
                  )}
                  <div className="ts-card-overlay">
                    <button className="ts-overlay-btn primary">
                      <FiPlay style={{ width: 13, height: 13 }} /> Use Template
                    </button>
                  </div>
                </div>
                <div className="ts-card-info" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <h3 className="ts-card-name" style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>{tmpl.title}</h3>
                    {tmpl.subtitle && (
                      <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 400 }}>
                        {tmpl.subtitle}
                      </div>
                    )}
                  </div>
                  <div className="ts-card-arrow" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                    <FiArrowRight style={{ width: 14, height: 14 }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── RIGHT: Feature Panel ── */}
          <motion.div
            className="ts-panel"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h3 className="ts-panel-title">Why Use Our Templates?</h3>
            <p className="ts-panel-sub">
              Save hours of work. Start with proven structures and make them uniquely yours.
            </p>

            <div className="ts-feature-list">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  className="ts-feature"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                >
                  <div className="ts-feature-icon">
                    <feat.Icon />
                  </div>
                  <div>
                    <p className="ts-feature-title">{feat.title}</p>
                    <p className="ts-feature-desc">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              className="ts-panel-cta"
              onClick={() => onNavigateToSolution && onNavigateToSolution('AI Videos')}
            >
              Browse All Templates <FiArrowRight />
            </button>
          </motion.div>

        </div>

      </section>
    </>
  )
}

export default TemplatesSection
