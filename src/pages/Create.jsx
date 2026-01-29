import { useMemo, useState, useEffect, useRef } from 'react'
import { Player } from '@remotion/player'
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import {
  MdUndo,
  MdRedo,
  MdPlayArrow,
  MdPause,
  MdStop,
  MdCloudUpload,
  MdPerson,
  MdTextFields,
  MdCropFree,
  MdPhotoLibrary,
  MdCategory,
  MdMic,
  MdPlayCircleOutline,
  MdZoomIn,
  MdZoomOut,
  MdFullscreen,
  MdSettings,
  MdSave,
  MdContentCut,
  MdContentCopy,
  MdContentPaste,
  MdDelete,
  MdAdd,
  MdVideoLibrary,
  MdMusicNote,
  MdPalette,
  MdTransform,
  MdLayers,
  MdTimer,
  MdAspectRatio,
  MdClose,
  MdArrowForward,
  MdGridView,
  MdCompareArrows,
  MdCheckCircle,
  MdLightbulbOutline,
} from 'react-icons/md'
import TimelineEditor from '../components/TimelineEditor'
import avatar1 from '../assets/avatar1.png'
import avatar2 from '../assets/avatar2.png'
import avatar3 from '../assets/avatar3.png'
import avatar4 from '../assets/avatar4.png'
import avatar5 from '../assets/avatar5.png'

// Predefined avatars
const predefinedAvatars = [
  { id: 'avatar1', name: 'Avatar 1', image: avatar1 },
  { id: 'avatar2', name: 'Avatar 2', image: avatar2 },
  { id: 'avatar3', name: 'Avatar 3', image: avatar3 },
  { id: 'avatar4', name: 'Avatar 4', image: avatar4 },
  { id: 'avatar5', name: 'Avatar 5', image: avatar5 },
]

const predefinedMedia = [
  { id: 'm1', name: 'Abstract Tech', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500', full: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070', type: 'image' },
  { id: 'm2', name: 'Nature Peak', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=500', full: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070', type: 'image' },
  { id: 'm3', name: 'Modern Office', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=500', full: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2070', type: 'image' },
  { id: 'm4', name: 'City Lights', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=500', full: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=2070', type: 'image' },
  { id: 'm5', name: 'Minimal Workspace', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=500', full: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2070', type: 'image' },
]

const pageTemplates = [
  {
    id: 'split-right',
    name: 'Classic Right',
    layout: 'split-right',
    description: 'Title on left, avatar on right.',
    icon: <MdTextFields />,
    fields: [
      { key: 'titleText', label: 'Title', type: 'text', default: 'Insert your video title here' },
      { key: 'subtitleText', label: 'Subtitle', type: 'text', default: 'Add sub-headline here' }
    ]
  },
  {
    id: 'split-left',
    name: 'Classic Left',
    layout: 'split-left',
    description: 'Avatar on left, title on right.',
    icon: <MdTextFields />,
    fields: [
      { key: 'titleText', label: 'Title', type: 'text', default: 'Insert your video title here' },
      { key: 'subtitleText', label: 'Subtitle', type: 'text', default: 'Add sub-headline here' }
    ]
  },
  {
    id: 'centered',
    name: 'Centered',
    layout: 'centered',
    description: 'All content centered.',
    icon: <MdCategory />,
    fields: [
      { key: 'titleText', label: 'Title', type: 'text', default: 'Centered Title' },
      { key: 'subtitleText', label: 'Subtitle', type: 'text', default: 'Centered Subtitle' }
    ]
  },
  {
    id: 'bullets',
    name: 'Bullet Points',
    layout: 'bullets',
    description: 'Title with bullet points.',
    icon: <MdAdd />,
    fields: [
      { key: 'titleText', label: 'Title', type: 'text', default: 'Key Highlights' },
      { key: 'bullet1', label: 'Point 1', type: 'text', default: 'First important point' },
      { key: 'bullet2', label: 'Point 2', type: 'text', default: 'Second important point' },
      { key: 'bullet3', label: 'Point 3', type: 'text', default: 'Third important point' }
    ]
  },
  {
    id: 'stats',
    name: 'Statistics',
    layout: 'stats',
    description: 'Big numbers and metrics.',
    icon: <MdTimer />,
    fields: [
      { key: 'titleText', label: 'Title', type: 'text', default: 'Our Growth' },
      { key: 'stat1_value', label: 'Stat 1 Value', type: 'text', default: '98%' },
      { key: 'stat1_label', label: 'Stat 1 Label', type: 'text', default: 'Customer Satisfaction' },
      { key: 'stat2_value', label: 'Stat 2 Value', type: 'text', default: '10k+' },
      { key: 'stat2_label', label: 'Stat 2 Label', type: 'text', default: 'Active Users' }
    ]
  },
  {
    id: 'quote',
    name: 'Bold Quote',
    layout: 'quote',
    description: 'Full width bold statement.',
    icon: <MdTextFields />,
    fields: [
      { key: 'titleText', label: 'Quote', type: 'textarea', default: '"The best way to predict the future is to create it."' },
      { key: 'subtitleText', label: 'Author', type: 'text', default: 'Peter Drucker' }
    ]
  },
  {
    id: 'steps',
    name: 'Process Steps',
    layout: 'steps',
    description: 'Horizontal flow of steps.',
    icon: <MdArrowForward />,
    fields: [
      { key: 'titleText', label: 'Title', type: 'text', default: 'Our Process' },
      { key: 'step1', label: 'Step 1', type: 'text', default: 'Discovery' },
      { key: 'step2', label: 'Step 2', type: 'text', default: 'Strategy' },
      { key: 'step3', label: 'Step 3', type: 'text', default: 'Execution' }
    ]
  },
  {
    id: 'grid',
    name: 'Feature Grid',
    layout: 'grid',
    description: '4 features in a grid layout.',
    icon: <MdGridView />,
    fields: [
      { key: 'titleText', label: 'Title', type: 'text', default: 'Key Features' },
      { key: 'feat1', label: 'Feature 1', type: 'text', default: 'High Performance' },
      { key: 'feat2', label: 'Feature 2', type: 'text', default: 'Secure Data' },
      { key: 'feat3', label: 'Feature 3', type: 'text', default: '24/7 Support' },
      { key: 'feat4', label: 'Feature 4', type: 'text', default: 'Easy Integration' }
    ]
  },
  {
    id: 'comparison',
    name: 'Comparison',
    layout: 'comparison',
    description: 'Compare two concepts side by side.',
    icon: <MdCompareArrows />,
    fields: [
      { key: 'titleText', label: 'Comparison', type: 'text', default: 'Old vs Newway' },
      { key: 'leftItem', label: 'Left Item', type: 'text', default: 'Manual Work' },
      { key: 'rightItem', label: 'Right Item', type: 'text', default: 'AI Automation' }
    ]
  },
  {
    id: 'highlight',
    name: 'Modern Highlight',
    layout: 'highlight',
    description: 'Focus on one big feature or idea.',
    icon: <MdLightbulbOutline />,
    fields: [
      { key: 'titleText', label: 'Header', type: 'text', default: 'Innovation First' },
      { key: 'subtitleText', label: 'Subheader', type: 'text', default: 'Redefining the industry standards' },
      { key: 'highlightText', label: 'Main Point', type: 'text', default: 'Generate videos 10x faster' }
    ]
  },
  {
    id: 'testimonial',
    name: 'Social Proof',
    layout: 'testimonial',
    description: 'Structure for customer reviews.',
    icon: <MdPerson />,
    fields: [
      { key: 'titleText', label: 'Review Header', type: 'text', default: 'What our clients say' },
      { key: 'testimonialText', label: 'Testimonial', type: 'textarea', default: 'This tool has completely changed how we approach video production. Highly recommended!' },
      { key: 'author', label: 'Client Name', type: 'text', default: 'Sarah Johnson' },
      { key: 'role', label: 'Client Role', type: 'text', default: 'CEO at TechFlow' }
    ]
  },
  {
    id: 'cta',
    name: 'Final CTA',
    layout: 'cta',
    description: 'Perfect ending for your video.',
    icon: <MdPlayCircleOutline />,
    fields: [
      { key: 'titleText', label: 'Main Heading', type: 'text', default: 'Start Your Journey Today' },
      { key: 'subtitleText', label: 'Secondary Text', type: 'text', default: 'Join over 10,000+ satisfied creators.' },
      { key: 'website', label: 'Website/Link', type: 'text', default: 'www.athenavi.com' }
    ]
  }
]

const avatarUrl =
  'https://media.istockphoto.com/id/1480023591/video/creating-a-female-video-game-character.jpg?s=640x640&k=20&c=S1LW6oZZDQYgsqp4GRL0bj9wE1oRIaBfQSV-UQXv2II='
const localAvatar = '/public/Avatar.png'

const styles = `
.video-editor-shell {
  min-height: 100vh;
  height: 100vh;
  background: #0f0f0f;
  display: grid;
  grid-template-rows: 60px 1fr 200px;
  overflow: hidden;
  box-sizing: border-box;
}

.editor-topbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-title {
  border: none;
  font-weight: 700;
  font-size: 14px;
  outline: none;
  background: transparent;
  color: #fff;
  min-width: 140px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #2a2a2a;
}

.top-center {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.icon-btn {
  border: 1px solid #333;
  background: #2a2a2a;
  border-radius: 8px;
  padding: 8px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;
  justify-content: center;
  font-size: 14px;
  color: #fff;
}

.icon-btn:hover {
  background: #3a3a3a;
  border-color: #555;
}

.icon-btn.active {
  background: #0066cc;
  border-color: #0066cc;
}

.top-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.primary-btn {
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
  color: #ffffff;
  transition: all 0.2s ease;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #0052a3 0%, #003366 100%);
}

.editor-main {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 0;
  background: #1a1a1a;
  overflow: hidden;
  position: relative;
  height: 100%;
}

.editor-main > * {
  overflow: hidden;
  height: 100%;
}

.media-library {
  background: #1e1e1e;
  border-right: 1px solid #333;
  padding: 16px;
  overflow-y: auto;
  display: grid;
  gap: 12px;
}

.library-section {
  display: grid;
  gap: 8px;
}

.section-title {
  color: #fff;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  margin: 0;
  padding: 8px 0;
  border-bottom: 1px solid #333;
}

.upload-area {
  border: 2px dashed #444;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: #0066cc;
  color: #0066cc;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.media-item {
  aspect-ratio: 16/9;
  background: #2a2a2a;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: grid;
  place-items: center;
  color: #666;
  font-size: 20px;
}

.media-item:hover {
  background: #3a3a3a;
  transform: scale(1.05);
}

.canvas-area {
  background: #0a0a0a;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 0;
  overflow: hidden;
}

.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  height: 100%;
  overflow: hidden;
}

.preview-wrapper {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  border: 1px solid #333;
  width: 100%;
  max-width: 900px;
  aspect-ratio: 16/9;
  display: flex;
  flex-direction: column;
}

.preview-controls {
  background: #1a1a1a;
  border-top: 1px solid #333;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-display {
  color: #fff;
  font-weight: 600;
  font-size: 12px;
  min-width: 100px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.properties-panel {
  background: #1e1e1e;
  border-left: 1px solid #333;
  padding: 16px;
  overflow-y: auto;
  display: grid;
  gap: 16px;
}

.property-group {
  display: grid;
  gap: 12px;
}

.property-title {
  color: #fff;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  margin: 0;
  padding: 8px 0;
  border-bottom: 1px solid #333;
}

.property-row {
  display: grid;
  gap: 8px;
}

.property-label {
  color: #aaa;
  font-size: 12px;
  font-weight: 500;
}

.property-input {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 6px 8px;
  color: #fff;
  font-size: 12px;
}

.property-input:focus {
  outline: none;
  border-color: #0066cc;
}

.timeline-area {
  background: #1a1a1a;
  border-top: 1px solid #333;
  display: grid;
  grid-template-rows: 40px 1fr;
  gap: 0;
}

.timeline-header {
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.timeline-tracks {
  background: #0a0a0a;
  overflow-x: auto;
  overflow-y: auto;
  padding: 8px;
}

.track {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  margin-bottom: 8px;
  min-height: 40px;
}

.track-label {
  background: #2a2a2a;
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.track-content {
  background: #1a1a1a;
  border-radius: 6px;
  border: 1px solid #333;
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
}

.clip {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 4px 8px;
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
  text-align: center;
}

.clip:hover {
  background: #3a3a3a;
  border-color: #0066cc;
}

.clip.selected {
  background: #0066cc;
  border-color: #0066cc;
}

.playhead {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: #ff3333;
  pointer-events: none;
  z-index: 100;
}

.playhead-head {
  position: absolute;
  top: 0;
  left: -6px;
  width: 14px;
  height: 12px;
  background: #ff3333;
  border-radius: 2px 2px 0 0;
  clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
}

.timeline-area {
  background: #141414;
  border-top: 1px solid #333;
  display: grid;
  grid-template-rows: 44px 1fr;
  color: #fff;
}

.timeline-header {
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.timeline-content {
  display: grid;
  grid-template-columns: 150px 1fr;
  overflow: hidden;
}

.timeline-sidebar {
  background: #1a1a1a;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
}

.layer-item {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #2a2a2a;
  font-size: 13px;
  font-weight: 600;
  color: #888;
}

.layer-item.active {
  color: #fff;
  background: #252525;
}

.timeline-viewport {
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  background: #0d0d0d;
}

.timeline-ruler {
  height: 24px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  position: sticky;
  top: 0;
  z-index: 50;
  width: fit-content;
  min-width: 100%;
}

.ruler-tick {
  position: absolute;
  bottom: 0;
  width: 1px;
  background: #444;
}

.ruler-tick.major {
  height: 10px;
  background: #666;
}

.ruler-tick.minor {
  height: 5px;
}

.ruler-label {
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 9px;
  color: #888;
  font-family: monospace;
}

.timeline-tracks-container {
  position: relative;
  height: calc(100% - 24px);
  width: fit-content;
  min-width: 100%;
}

.timeline-track {
  height: 60px;
  position: relative;
  border-bottom: 1px solid #2a2a2a;
  display: flex;
  align-items: center;
}

.timeline-clip {
  position: absolute;
  height: 44px;
  background: #0066cc;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.timeline-clip:hover {
  filter: brightness(1.2);
  border-color: #fff;
}

.timeline-clip.active {
  background: #0088ff;
  border-color: #fff;
  box-shadow: 0 0 0 2px rgba(0, 136, 255, 0.4), 0 4px 12px rgba(0,0,0,0.5);
  z-index: 10;
}

.timeline-clip-icon {
  margin-right: 8px;
  flex-shrink: 0;
}

.timeline-clip-meta {
  margin-left: auto;
  font-size: 10px;
  opacity: 0.8;
}

.tools-palette {
  position: fixed;
  left: 50%;
  bottom: 220px;
  transform: translateX(-50%);
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  gap: 4px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  z-index: 100;
}

.tool-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #2a2a2a;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
}

.tool-btn:hover {
  background: #3a3a3a;
}

.tool-btn.active {
  background: #0066cc;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  border: 1px solid #333;
}

.preview-modal {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 24px;
  max-width: 90vw;
  width: 1200px;
  max-height: 90vh;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.preview-modal-title {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.preview-modal-close {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.preview-modal-close:hover {
  background: #2a2a2a;
}

.preview-modal-content {
  background: #0a0a0a;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
}

.modal-title {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.modal-body {
  color: #aaa;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 8px 16px;
  color: #fff;
  cursor: pointer;
}

.btn-primary {
  background: #0066cc;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  color: #fff;
  cursor: pointer;
}

.btn-primary:hover {
  background: #0052a3;
}

/* Avatar Selection Styles */
.avatar-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-options {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px;
}

.avatar-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 2px solid #333;
  border-radius: 8px;
  background: #2a2a2a;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.avatar-option:hover {
  border-color: #0066cc;
  background: #333;
}

.avatar-option.active {
  border-color: #0066cc;
  background: #0066cc;
  color: white;
}

.avatar-option span {
  font-size: 11px;
  text-align: center;
  font-weight: 600;
}

.upload-avatar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #333;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.upload-avatar-btn:hover {
  background: #444;
  border-color: #555;
}

/* Script Section Styles */
.script-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.script-input {
  width: 100%;
  min-height: 120px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 12px;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.script-input:focus {
  outline: none;
  border-color: #0066cc;
}

.script-input::placeholder {
  color: #666;
}

.script-actions {
  display: flex;
  gap: 8px;
}

.script-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #333;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.timeline-clip {
  position: absolute;
  top: 4px;
  height: 32px;
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.timeline-clip.active {
  background: #0066cc;
  border-color: #0088ff;
  box-shadow: 0 0 10px rgba(0, 102, 204, 0.5);
}

.trim-handle {
  position: absolute;
  top: 0;
  width: 6px;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  cursor: ew-resize;
  opacity: 0;
  transition: opacity 0.2s;
}

.timeline-clip:hover .trim-handle {
  opacity: 1;
}

.trim-handle.left { left: 0; border-radius: 4px 0 0 4px; }
.trim-handle.right { right: 0; border-radius: 0 4px 4px 0; }

.layer-item-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #333;
}

.layer-item-preview span {
  font-size: 12px;
  color: #eee;
  text-transform: capitalize;
}

.layer-item-preview button {
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.layer-item-preview button:hover {
  background: rgba(255, 68, 68, 0.1);
}

.timeline-track.layers {
  background: rgba(255, 255, 255, 0.02);
  height: 40px;
  margin-top: 4px;
}

.layer-clip {
  position: absolute;
  height: 24px;
  top: 8px;
  background: #2d6a4f;
  border: 1px solid #40916c;
  border-radius: 3px;
  font-size: 10px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  color: #fff;
}

.template-modal {
  background: #121212;
  border-radius: 16px;
  padding: 32px;
  max-width: 900px;
  width: 95%;
  max-height: 85vh;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  overflow-y: auto;
  padding: 10px;
  margin: 0 -10px;
}

.template-card {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-card:hover {
  border-color: #0066cc;
  background: #252525;
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.template-info {
  padding: 4px;
}

.template-info h4 {
  margin: 0 0 4px 0;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}

.template-info p {
  margin: 0;
  color: #777;
  font-size: 12px;
  line-height: 1.5;
}
`

// Remotion Composition Component
const VideoComposition = ({ scenes }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scenesList = scenes || []

  if (scenesList.length === 0) {
    return (
      <div style={{ flex: 1, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        No scenes provided
      </div>
    )
  }

  // Find current scene
  let totalFramesSoFar = 0
  let currentScene = scenesList[0]
  let frameInScene = frame

  for (let i = 0; i < scenesList.length; i++) {
    const scene = scenesList[i]
    const sceneFrames = Math.max((scene.duration || 8) * 30, 1)
    if (frame < totalFramesSoFar + sceneFrames) {
      currentScene = scene
      frameInScene = frame - totalFramesSoFar
      break
    }
    totalFramesSoFar += sceneFrames
    if (i === scenesList.length - 1) {
      currentScene = scene
      frameInScene = frame - (totalFramesSoFar - sceneFrames)
    }
  }

  const sceneDurationFrames = (currentScene.duration || 8) * 30

  // Transition logic
  let opacity = 1
  const transitionFrames = 10
  if (frameInScene < transitionFrames) {
    opacity = Math.max(0.1, frameInScene / transitionFrames)
  } else if (frameInScene > sceneDurationFrames - transitionFrames) {
    opacity = Math.max(0, (sceneDurationFrames - frameInScene) / transitionFrames)
  }

  if (frameInScene < 1) opacity = 1

  // Animation values
  const entrance = spring({
    frame: frameInScene,
    fps,
    config: { damping: 12 }
  })

  const zoomFactor = interpolate(
    frameInScene,
    [0, sceneDurationFrames],
    [1, 1.05]
  )

  const titleStyle = {
    fontSize: 48,
    color: '#000000',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '700',
    textAlign: 'left',
    ...(currentScene.titleStyle || {})
  }

  const subtitleStyle = {
    fontSize: 24,
    color: '#333333',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '400',
    textAlign: 'left',
    ...(currentScene.subtitleStyle || {})
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      opacity: opacity,
      backgroundColor: currentScene.backgroundColor || '#ffffff'
    }}>
      {/* BASE LAYER: Background Image/Video (Full Screen) */}
      {currentScene.backgroundImage && (
        <div style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}>
          <img
            src={currentScene.backgroundImage}
            alt="Background"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${zoomFactor})`
            }}
          />
        </div>
      )}

      {/* LAYER 1: Additional B-roll/Overlay Layers from Media Library */}
      {(currentScene.layers || []).filter(l => l.type === 'image' || l.type === 'video').map(layer => {
        const layerStart = (layer.start || 0) * 30
        const layerDuration = (layer.duration || currentScene.duration) * 30
        if (frameInScene < layerStart || frameInScene > layerStart + layerDuration) return null

        return (
          <div key={layer.id} style={{
            position: 'absolute',
            left: `${layer.x || 0}px`,
            top: `${layer.y || 0}px`,
            width: `${layer.width || '100%'}`,
            height: `${layer.height || '100%'}`,
            transform: `scale(${zoomFactor * (layer.scale || 1)})`,
            zIndex: 5,
            pointerEvents: 'none'
          }}>
            {layer.type === 'image' && <img src={layer.content} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            {layer.type === 'video' && <video src={layer.content} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop />}
          </div>
        )
      })}

      {/* OVERLAY LAYER: Text and Avatar Content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        padding: '0 80px'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          maxWidth: '1200px',
          display: 'flex',
          flexDirection: currentScene.layout === 'split-left' ? 'row-reverse' : (currentScene.layout === 'centered' || currentScene.layout === 'quote' ? 'column-reverse' : 'row'),
          alignItems: 'center',
          justifyContent: currentScene.layout === 'centered' || currentScene.layout === 'quote' ? 'center' : 'space-between',
          gap: '60px',
          position: 'relative',
          transform: `translateY(${(1 - entrance) * 30}px) scale(${interpolate(entrance, [0, 1], [0.95, 1])})`,
          opacity: entrance,
          textAlign: currentScene.layout === 'centered' || currentScene.layout === 'quote' ? 'center' : 'left'
        }}>
          {/* Main Content Area */}
          <div style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: (currentScene.layout === 'centered' || currentScene.layout === 'quote') ? 'center' : (currentScene.layout === 'split-left' ? 'flex-end' : 'flex-start'),
            gap: '24px',
            maxWidth: currentScene.layout === 'centered' || currentScene.layout === 'quote' ? '900px' : '650px',
            textAlign: (currentScene.layout === 'centered' || currentScene.layout === 'quote' || titleStyle.textAlign === 'center') ? 'center' : (currentScene.layout === 'split-left' ? 'right' : 'left')
          }}>
            {/* Title */}
            <h1 style={{
              fontSize: `${currentScene.layout === 'quote' ? 64 : (titleStyle.fontSize || 48)}px`,
              fontWeight: titleStyle.fontWeight || '700',
              margin: '0',
              lineHeight: '1.2',
              color: titleStyle.color || '#000000',
              fontFamily: titleStyle.fontFamily || 'inherit',
              transform: `translateX(${(1 - entrance) * (currentScene.layout === 'split-left' ? 40 : -40)}px)`,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              fontStyle: currentScene.layout === 'quote' ? 'italic' : 'normal'
            }}>
              {currentScene?.titleText || 'Insert your video title here'}
            </h1>

            {/* Subtitle / Author */}
            <h2 style={{
              fontSize: `${subtitleStyle.fontSize || 24}px`,
              fontWeight: subtitleStyle.fontWeight || '400',
              margin: '0',
              lineHeight: '1.4',
              color: subtitleStyle.color || '#333333',
              fontFamily: subtitleStyle.fontFamily || 'inherit',
              transform: `translateX(${(1 - entrance) * (currentScene.layout === 'split-left' ? 20 : -20)}px)`,
              textShadow: '0 1px 5px rgba(0,0,0,0.2)'
            }}>
              {currentScene.layout === 'quote' && '— '}{currentScene?.subtitleText || 'Add sub-headline here'}
            </h2>

            {/* Layout Specific Content: Bullets */}
            {currentScene.layout === 'bullets' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginTop: '12px',
                width: '100%',
                alignItems: titleStyle.textAlign === 'center' ? 'center' : 'flex-start'
              }}>
                {[1, 2, 3].map(i => currentScene[`bullet${i}`] && (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transform: `translateX(${(1 - entrance) * -30 * i}px)`,
                    opacity: entrance
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#0066cc',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>{i}</div>
                    <div style={{ fontSize: '20px', color: '#444' }}>{currentScene[`bullet${i}`]}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Layout Specific Content: Stats */}
            {currentScene.layout === 'stats' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '40px',
                marginTop: '20px'
              }}>
                {[1, 2].map(i => currentScene[`stat${i}_value`] && (
                  <div key={i} style={{
                    textAlign: 'center',
                    transform: `scale(${entrance})`,
                    opacity: entrance
                  }}>
                    <div style={{
                      fontSize: '56px',
                      fontWeight: '800',
                      color: '#0066cc',
                      lineHeight: '1'
                    }}>{currentScene[`stat${i}_value`]}</div>
                    <div style={{
                      fontSize: '16px',
                      color: '#666',
                      marginTop: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>{currentScene[`stat${i}_label`]}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Layout Specific Content: Steps */}
            {currentScene.layout === 'steps' && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                gap: '20px',
                marginTop: '12px',
                position: 'relative',
                padding: '0 20px'
              }}>
                {/* Connector line */}
                <div style={{
                  position: 'absolute',
                  top: '25px',
                  left: '60px',
                  right: '60px',
                  height: '2px',
                  borderTop: '2px dashed #0066cc',
                  opacity: 0.3,
                  zIndex: 0
                }} />
                {[1, 2, 3].map(i => currentScene[`step${i}`] && (
                  <div key={i} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    flex: 1,
                    position: 'relative',
                    zIndex: 1,
                    transform: `translateY(${(1 - entrance) * 20 * i}px)`,
                    opacity: entrance
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: '#fff',
                      border: '3px solid #0066cc',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#0066cc',
                      fontSize: '20px',
                      fontWeight: '800',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>{i}</div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#333',
                      textAlign: 'center'
                    }}>{currentScene[`step${i}`]}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Layout Specific Content: Grid */}
            {currentScene.layout === 'grid' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginTop: '12px',
                width: '100%'
              }}>
                {[1, 2, 3, 4].map(i => currentScene[`feat${i}`] && (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transform: `translate(${(i % 2 === 0 ? 1 : -1) * (1 - entrance) * 30}px, ${Math.floor((i - 1) / 2) * (1 - entrance) * 30}px)`,
                    opacity: entrance
                  }}>
                    <div style={{ color: '#0066cc', fontSize: '24px' }}><MdCheckCircle /></div>
                    <div style={{ fontSize: '18px', fontWeight: '500', color: '#444' }}>{currentScene[`feat${i}`]}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Layout Specific Content: Comparison */}
            {currentScene.layout === 'comparison' && (
              <div style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: '4px',
                marginTop: '20px',
                width: '100%',
                background: '#eee',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '2px solid #ddd'
              }}>
                <div style={{
                  flex: 1,
                  padding: '30px',
                  background: '#f9f9f9',
                  textAlign: 'center',
                  transform: `translateX(${(1 - entrance) * -50}px)`,
                  opacity: entrance
                }}>
                  <div style={{ color: '#888', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>Legacy</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#555' }}>{currentScene.leftItem}</div>
                </div>
                <div style={{
                  width: '60px',
                  background: '#0066cc',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontSize: '32px',
                  zIndex: 1,
                  transform: `scale(${entrance})`
                }}>
                  <MdCompareArrows />
                </div>
                <div style={{
                  flex: 1,
                  padding: '30px',
                  background: '#fff',
                  textAlign: 'center',
                  transform: `translateX(${(1 - entrance) * 50}px)`,
                  opacity: entrance
                }}>
                  <div style={{ color: '#0066cc', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>Modern</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#0066cc' }}>{currentScene.rightItem}</div>
                </div>
              </div>
            )}

            {/* Layout Specific Content: Highlight */}
            {currentScene.layout === 'highlight' && (
              <div style={{
                marginTop: '30px',
                padding: '40px',
                background: 'rgba(0,102,204,0.05)',
                borderRadius: '24px',
                borderLeft: '8px solid #0066cc',
                width: '100%',
                transform: `translateX(${(1 - entrance) * -40}px)`,
                opacity: entrance,
                boxShadow: '0 10px 40px rgba(0,102,204,0.1)'
              }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#0066cc', lineHeight: '1.2' }}>
                  {currentScene.highlightText}
                </div>
              </div>
            )}

            {/* Layout Specific Content: Testimonial */}
            {currentScene.layout === 'testimonial' && (
              <div style={{
                marginTop: '30px',
                padding: '40px',
                background: '#fff',
                borderRadius: '24px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                position: 'relative',
                transform: `rotate(${(1 - entrance) * -5}deg) scale(${entrance})`,
                opacity: entrance,
                border: '1px solid #eee'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '40px',
                  width: '40px',
                  height: '40px',
                  background: '#0066cc',
                  borderRadius: '10px',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontSize: '24px'
                }}>“</div>
                <div style={{
                  fontSize: '22px',
                  lineHeight: '1.6',
                  color: '#444',
                  fontStyle: 'italic',
                  marginBottom: '24px'
                }}>
                  {currentScene.testimonialText}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eee', flexShrink: 0 }}>
                    <MdPerson size={32} style={{ margin: '8px', color: '#999' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#111' }}>{currentScene.author}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>{currentScene.role}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Layout Specific Content: CTA */}
            {currentScene.layout === 'cta' && (
              <div style={{
                marginTop: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: titleStyle.textAlign === 'center' ? 'center' : 'flex-start',
                gap: '24px',
                width: '100%'
              }}>
                <div style={{
                  padding: '16px 40px',
                  background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
                  borderRadius: '50px',
                  color: '#fff',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 20px rgba(0,102,204,0.3)',
                  cursor: 'pointer',
                  transform: `scale(${entrance})`,
                  opacity: entrance
                }}>
                  Visit Our Website
                </div>
                <div style={{
                  fontSize: '20px',
                  color: '#0066cc',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  background: 'rgba(0,102,204,0.1)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  transform: `translateY(${(1 - entrance) * 20}px)`,
                  opacity: entrance
                }}>
                  {currentScene.website}
                </div>
              </div>
            )}

            {/* Logo Placeholder */}
            {currentScene.layout !== 'quote' && (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#f0f0f0',
                border: '2px dashed #cccccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '8px',
                fontSize: '10px',
                color: '#999999',
                fontWeight: '600',
                textAlign: 'center',
                padding: '8px',
                transform: `scale(${entrance})`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                YOUR LOGO
              </div>
            )}
          </div>

          {/* Right Side - Avatar Display */}
          {currentScene.layout !== 'quote' && (
            <div style={{
              flex: '0 0 auto',
              width: currentScene.layout === 'centered' ? '180px' : '300px',
              height: currentScene.layout === 'centered' ? '180px' : '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transform: `scale(${interpolate(entrance, [0, 1], [0.8, 1])})`,
              filter: `blur(${(1 - entrance) * 20}px) drop-shadow(0 4px 20px rgba(0,0,0,0.3))`
            }}>
              {currentScene?.avatar ? (
                <img
                  src={currentScene.avatar}
                  alt="Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    borderRadius: currentScene.layout === 'centered' ? '50%' : '0',
                    border: currentScene.layout === 'centered' ? '4px solid #fff' : 'none',
                    boxShadow: currentScene.layout === 'centered' ? '0 8px 30px rgba(0,0,0,0.2)' : 'none'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f5f5f5',
                  borderRadius: currentScene.layout === 'centered' ? '50%' : '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #cccccc'
                }}>
                  <MdPerson size={currentScene.layout === 'centered' ? 80 : 120} color="#999999" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Static Preview Component (for thumbnail view)
const StaticPreview = ({ scene }) => {
  // Default styles if not provided
  const titleStyle = scene.titleStyle || {
    fontSize: 18, // Reduced from 42 for thumbnail
    color: '#000000',
    fontFamily: 'system-ui',
    fontWeight: '700',
    textAlign: 'left'
  }

  const subtitleStyle = scene.subtitleStyle || {
    fontSize: 12, // Reduced from 22 for thumbnail
    color: '#333333',
    fontFamily: 'system-ui',
    fontWeight: '400',
    textAlign: 'left'
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: scene.backgroundColor || '#ffffff',
      color: '#000000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '16px', // Reduced padding
      boxSizing: 'border-box'
    }}>
      {/* BACKGROUND LAYERS */}
      {(scene.layers || []).filter(l => l.type === 'image' || l.type === 'video').map(layer => {
        return (
          <div key={layer.id} style={{
            position: 'absolute',
            left: `${layer.x || 0}px`,
            top: `${layer.y || 0}px`,
            width: `${layer.width || '100%'}`,
            height: `${layer.height || '100%'}`,
            transform: `scale(${layer.scale || 1})`,
            zIndex: 1,
            pointerEvents: 'none'
          }}>
            {layer.type === 'image' && <img src={layer.content} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            {layer.type === 'video' && <div style={{ width: '100%', height: '100%', background: '#000' }} />}
          </div>
        )
      })}

      {/* Main Content Container */}
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: scene.layout === 'split-left' ? 'row-reverse' : (scene.layout === 'centered' || scene.layout === 'quote' ? 'column-reverse' : 'row'),
        alignItems: 'center',
        justifyContent: scene.layout === 'centered' || scene.layout === 'quote' ? 'center' : 'space-between',
        gap: '12px',
        position: 'relative',
        maxWidth: '100%',
        zIndex: 2,
        textAlign: scene.layout === 'centered' || scene.layout === 'quote' ? 'center' : 'left'
      }}>
        {/* Main Content Area */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: (scene.layout === 'centered' || scene.layout === 'quote') ? 'center' : (scene.layout === 'split-left' ? 'flex-end' : 'flex-start'),
          gap: '6px',
          minWidth: '0',
          zIndex: 10,
          position: 'relative',
          textAlign: (scene.layout === 'centered' || scene.layout === 'quote' || titleStyle.textAlign === 'center') ? 'center' : (scene.layout === 'split-left' ? 'right' : 'left')
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: `${scene.layout === 'quote' ? 16 : (18)}px`, // Fixed thumbnail size
            fontWeight: titleStyle.fontWeight || '700',
            margin: '0',
            lineHeight: '1.2',
            color: titleStyle.color || '#000000',
            fontFamily: titleStyle.fontFamily || 'system-ui, -apple-system, sans-serif',
            wordWrap: 'break-word',
            width: '100%',
            fontStyle: scene.layout === 'quote' ? 'italic' : 'normal'
          }}>
            {scene?.titleText || 'Insert your video title here'}
          </h1>

          {/* Subtitle / Author */}
          <h2 style={{
            fontSize: `${11}px`, // Fixed thumbnail size
            fontWeight: subtitleStyle.fontWeight || '400',
            margin: '0',
            lineHeight: '1.4',
            color: subtitleStyle.color || '#333333',
            fontFamily: subtitleStyle.fontFamily || 'system-ui, -apple-system, sans-serif',
            wordWrap: 'break-word',
            width: '100%'
          }}>
            {scene.layout === 'quote' && '— '}{scene?.subtitleText || 'Add sub-headline here'}
          </h2>

          {/* Layout Specific: Bullets (Compact for Static Preview) */}
          {scene.layout === 'bullets' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginTop: '4px',
              width: '100%',
              alignItems: titleStyle.textAlign === 'center' ? 'center' : 'flex-start'
            }}>
              {[1, 2, 3].map(i => scene[`bullet${i}`] && (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0066cc', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '7px' }}>{i}</div>
                  <div style={{ fontSize: '9px', color: '#444' }}>{scene[`bullet${i}`]}</div>
                </div>
              ))}
            </div>
          )}

          {/* Layout Specific: Stats (Compact for Static Preview) */}
          {scene.layout === 'stats' && (
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              {[1, 2].map(i => scene[`stat${i}_value`] && (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#0066cc', lineHeight: '1' }}>{scene[`stat${i}_value`]}</div>
                  <div style={{ fontSize: '7px', color: '#666', textTransform: 'uppercase' }}>{scene[`stat${i}_label`]}</div>
                </div>
              ))}
            </div>
          )}

          {/* Layout Specific: Steps (Compact for Static Preview) */}
          {scene.layout === 'steps' && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              gap: '10px',
              marginTop: '4px',
              position: 'relative'
            }}>
              {[1, 2, 3].map(i => scene[`step${i}`] && (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #0066cc', display: 'grid', placeItems: 'center', color: '#0066cc', fontSize: '6px', fontWeight: 'bold', background: '#fff' }}>{i}</div>
                  <div style={{ fontSize: '6px', color: '#333', textAlign: 'center' }}>{scene[`step${i}`]}</div>
                </div>
              ))}
            </div>
          )}

          {/* Layout Specific: Grid (Compact for Static Preview) */}
          {scene.layout === 'grid' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginTop: '8px',
              width: '100%'
            }}>
              {[1, 2, 3, 4].map(i => scene[`feat${i}`] && (
                <div key={i} style={{
                  background: 'rgba(0,102,204,0.05)',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <div style={{ color: '#0066cc', fontSize: '10px' }}><MdCheckCircle /></div>
                  <div style={{ fontSize: '7px', color: '#444' }}>{scene[`feat${i}`]}</div>
                </div>
              ))}
            </div>
          )}

          {/* Layout Specific: Comparison (Compact for Static Preview) */}
          {scene.layout === 'comparison' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              marginTop: '10px',
              width: '100%',
              background: '#eee',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{ flex: 1, padding: '8px', background: '#f9f9f9', textAlign: 'center', fontSize: '8px', fontWeight: 'bold' }}>{scene.leftItem}</div>
              <div style={{ width: '16px', background: '#0066cc', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '10px' }}><MdCompareArrows /></div>
              <div style={{ flex: 1, padding: '8px', background: '#fff', textAlign: 'center', fontSize: '8px', fontWeight: 'bold', color: '#0066cc' }}>{scene.rightItem}</div>
            </div>
          )}

          {/* Layout Specific: Highlight (Compact for Static Preview) */}
          {scene.layout === 'highlight' && (
            <div style={{
              marginTop: '10px',
              padding: '10px',
              background: 'rgba(0,102,204,0.05)',
              borderRadius: '8px',
              borderLeft: '4px solid #0066cc',
              width: '100%'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0066cc' }}>
                {scene.highlightText}
              </div>
            </div>
          )}

          {/* Layout Specific: Testimonial (Compact for Static Preview) */}
          {scene.layout === 'testimonial' && (
            <div style={{
              marginTop: '10px',
              padding: '10px',
              background: '#fff',
              borderRadius: '8px',
              width: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #eee'
            }}>
              <div style={{ fontSize: '8px', lineHeight: '1.4', color: '#444', fontStyle: 'italic', marginBottom: '8px' }}>
                "{scene.testimonialText?.substring(0, 60)}..."
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#eee' }} />
                <div style={{ fontSize: '7px', fontWeight: 'bold' }}>{scene.author}</div>
              </div>
            </div>
          )}

          {/* Layout Specific: CTA (Compact for Static Preview) */}
          {scene.layout === 'cta' && (
            <div style={{
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: titleStyle.textAlign === 'center' ? 'center' : 'flex-start',
              gap: '8px'
            }}>
              <div style={{
                padding: '4px 12px',
                background: '#0066cc',
                borderRadius: '20px',
                color: '#fff',
                fontSize: '8px',
                fontWeight: 'bold'
              }}>
                Action
              </div>
              <div style={{ fontSize: '7px', color: '#0066cc', fontWeight: 'bold' }}>{scene.website}</div>
            </div>
          )}

          {/* Logo Placeholder */}
          {scene.layout !== 'quote' && (
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              border: '1px dashed #cccccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '4px',
              fontSize: '5px',
              color: '#999999',
              fontWeight: '600',
              textAlign: 'center',
              padding: '2px',
              flexShrink: 0
            }}>
              LOGO
            </div>
          )}
        </div>

        {/* Right Side - Avatar Display */}
        {scene.layout !== 'quote' && (
          <div style={{
            flex: '0 0 auto',
            width: scene.layout === 'centered' ? '60px' : '40%',
            height: scene.layout === 'centered' ? '60px' : '100%',
            maxHeight: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10
          }}>
            {scene?.avatar ? (
              <img
                src={scene.avatar}
                alt="Avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  borderRadius: scene.layout === 'centered' ? '50%' : '0',
                  border: scene.layout === 'centered' ? '2px solid #fff' : 'none'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f5f5f5',
                borderRadius: scene.layout === 'centered' ? '50%' : '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed #cccccc'
              }}>
                <MdPerson size={scene.layout === 'centered' ? 30 : 40} color="#999999" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Create({ onBack }) {
  const [scenes, setScenes] = useState([
    {
      id: 'scene1',
      title: 'Scene 1',
      duration: 8,
      titleText: 'Build Your Brand with AI',
      titleStyle: {
        fontSize: 48,
        color: '#0066cc',
        fontFamily: 'Inter',
        fontWeight: '700',
        textAlign: 'left'
      },
      subtitleText: 'The future of video creation is here.',
      subtitleStyle: {
        fontSize: 24,
        color: '#333333',
        fontFamily: 'Inter',
        fontWeight: '400',
        textAlign: 'left'
      },
      layers: [], // Support for B-roll, images, etc.
      script: 'Start your video by greeting your audience and introducing your topic. Create a clear title and give more context with a compelling sub-headline.',
      avatar: avatar1,
      avatarType: 'avatar1',
      type: 'video',
      layout: 'split-right'
    }
  ])
  const [activeSceneId, setActiveSceneId] = useState('scene1')
  const [selectedTool, setSelectedTool] = useState('avatar')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1')
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  const addLayer = (type, content) => {
    const activeScene = scenes.find(s => s.id === activeSceneId)
    const newLayer = {
      id: `layer-${Date.now()}`,
      type,
      content,
      start: 0,
      duration: activeScene?.duration || 8,
      x: 0,
      y: 0,
      scale: 1,
      width: '100%',
      height: '100%'
    }
    updateScene(activeSceneId, {
      layers: [...(activeScene?.layers || []), newLayer]
    })
  }

  // Export settings state
  const [exportFormat, setExportFormat] = useState('MP4')
  const [exportResolution, setExportResolution] = useState('1920x1080')
  const [exportFrameRate, setExportFrameRate] = useState('30')
  const [exportQuality, setExportQuality] = useState('High')

  const playerRef = useRef(null)
  const speechSynthesisRef = useRef(null)

  // Credit calculation function
  const calculateCredits = () => {
    let baseCredits = 100

    // Format multipliers
    const formatMultipliers = {
      'MP4': 1.0,
      'WebM': 0.8,
      'GIF': 0.5
    }

    // Resolution multipliers
    const resolutionMultipliers = {
      '1920x1080': 1.0,
      '1280x720': 0.7,
      '3840x2160': 2.0
    }

    // Frame rate multipliers
    const frameRateMultipliers = {
      '30': 1.0,
      '24': 0.8,
      '60': 1.5
    }

    // Quality multipliers
    const qualityMultipliers = {
      'High': 1.2,
      'Medium': 1.0,
      'Low': 0.7
    }

    const formatMultiplier = formatMultipliers[exportFormat] || 1.0
    const resolutionMultiplier = resolutionMultipliers[exportResolution] || 1.0
    const frameRateMultiplier = frameRateMultipliers[exportFrameRate] || 1.0
    const qualityMultiplier = qualityMultipliers[exportQuality] || 1.0

    const totalCredits = Math.round(baseCredits * formatMultiplier * resolutionMultiplier * frameRateMultiplier * qualityMultiplier)

    return totalCredits
  }

  const activeScene = scenes.find(s => s.id === activeSceneId)

  const totalDurationInFrames = useMemo(() => {
    return scenes.reduce((sum, s) => sum + (s.duration || 8), 0) * 30
  }, [scenes])

  const handleReorderScenes = (newScenes) => {
    setScenes(newScenes)
  }

  // Text-to-speech function
  const speakText = (text, sceneId) => {
    // Stop any ongoing speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel()
    }

    if (!text || text.trim() === '') return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9 // Slightly slower for natural speech
    utterance.pitch = 1
    utterance.volume = 1

    // Use a more natural voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(voice =>
      voice.name.includes('Google') ||
      voice.name.includes('Microsoft') ||
      voice.lang.startsWith('en')
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    speechSynthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)

    utterance.onend = () => {
      speechSynthesisRef.current = null
    }
  }

  // Stop speech when component unmounts or preview closes
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Load voices when component mounts
  useEffect(() => {
    if (window.speechSynthesis) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices()
      }
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])


  // Get current scene based on frame
  const getSceneForFrame = (frame) => {
    let currentFrame = 0
    for (const scene of scenes) {
      const sceneFrames = (scene.duration || 8) * 30
      if (frame < currentFrame + sceneFrames) {
        return { scene, frameInScene: frame - currentFrame }
      }
      currentFrame += sceneFrames
    }
    return { scene: scenes[scenes.length - 1] || scenes[0], frameInScene: 0 }
  }

  // Handle player frame updates
  useEffect(() => {
    if (playerRef.current && isPlaying) {
      const player = playerRef.current
      const updateTime = () => {
        try {
          const frame = player.getCurrentFrame()
          setCurrentTime(frame / 30) // Convert frames to seconds
          const { scene } = getSceneForFrame(frame)
          if (scene && scene.id !== activeSceneId) {
            setActiveSceneId(scene.id)
          }
        } catch (e) {
          // Player might not be ready
        }
      }

      const interval = setInterval(updateTime, 100)
      return () => clearInterval(interval)
    }
  }, [isPlaying, scenes, activeSceneId])

  const addScene = () => {
    setShowTemplateModal(true)
  }

  const handleAddTemplateScene = (template) => {
    const newScene = {
      id: `scene${Date.now()}`,
      title: `Scene ${scenes.length + 1}`,
      duration: 8,
      titleText: template.fields.find(f => f.key === 'titleText')?.default || 'New Scene',
      subtitleText: template.fields.find(f => f.key === 'subtitleText')?.default || 'Add your content here',
      layout: template.layout,
      avatar: activeScene?.avatar || avatar1,
      avatarType: activeScene?.avatarType || 'avatar1',
      type: 'video',
      titleStyle: {
        fontSize: 48,
        color: '#0066cc',
        fontFamily: 'Inter',
        fontWeight: '700',
        textAlign: 'left'
      },
      subtitleStyle: {
        fontSize: 24,
        color: '#333333',
        fontFamily: 'Inter',
        fontWeight: '400',
        textAlign: 'left'
      }
    }

    // Add other template fields as data
    template.fields.forEach(field => {
      if (field.key !== 'titleText' && field.key !== 'subtitleText') {
        newScene[field.key] = field.default
      }
    })

    setScenes([...scenes, newScene])
    setActiveSceneId(newScene.id)
    setShowTemplateModal(false)
  }

  const deleteScene = (id) => {
    if (scenes.length === 1) return
    const newScenes = scenes.filter(s => s.id !== id)
    setScenes(newScenes)
    if (activeSceneId === id) {
      setActiveSceneId(newScenes[0].id)
    }
  }

  const updateScene = (id, updates) => {
    setScenes(scenes.map(scene =>
      scene.id === id ? { ...scene, ...updates } : scene
    ))
  }

  const exportVideo = () => {
    setShowExportModal(true)
  }

  const selectAvatar = (avatarId) => {
    setSelectedAvatar(avatarId)
    const avatar = predefinedAvatars.find(a => a.id === avatarId)
    updateScene(activeSceneId, {
      avatarType: avatarId,
      avatar: avatar ? avatar.image : null
    })
  }

  // Handle preview with text-to-speech
  const handlePreview = () => {
    setShowPreviewModal(true)
    // Start speaking the script when preview opens
    if (activeScene?.script) {
      setTimeout(() => {
        speakText(activeScene.script, activeSceneId)
      }, 500)
    }
  }

  // Handle play/pause with speech
  const handlePlayPause = () => {
    if (isPlaying) {
      if (playerRef.current) {
        playerRef.current.pause()
      }
      window.speechSynthesis.pause()
      setIsPlaying(false)
    } else {
      if (playerRef.current) {
        playerRef.current.play()
      }
      // Resume or start speaking
      const { scene } = getSceneForFrame(currentTime * 30)
      if (scene?.script) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume()
        } else {
          speakText(scene.script, scene.id)
        }
      }
      setIsPlaying(true)
    }
  }

  // Handle stop with speech
  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.pause()
      playerRef.current.seekTo(0)
    }
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleSeek = (time) => {
    setCurrentTime(time)
    if (playerRef.current) {
      playerRef.current.seekTo(time * 30)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="video-editor-shell">
        <div className="editor-topbar">
          <div className="top-left">
            <button className="icon-btn" onClick={onBack}>
              ← Back
            </button>
            <input
              className="project-title"
              defaultValue="Untitled Video Project"
            />
            <button
              className="icon-btn"
              title="Undo"
              onClick={() => {
                console.log('Undo clicked')
                // TODO: Implement undo functionality
              }}
            >
              <MdUndo />
            </button>
            <button
              className="icon-btn"
              title="Redo"
              onClick={() => {
                console.log('Redo clicked')
                // TODO: Implement redo functionality
              }}
            >
              <MdRedo />
            </button>
            <button
              className="icon-btn"
              title="Save"
              onClick={() => {
                alert('Project saved!')
                // TODO: Implement save functionality
              }}
            >
              <MdSave />
            </button>
          </div>

          <div className="top-center">
            <button
              className={`icon-btn ${selectedTool === 'avatar' ? 'active' : ''}`}
              title="Avatar"
              onClick={() => setSelectedTool('avatar')}
            >
              <MdPerson />
            </button>
            <button
              className={`icon-btn ${selectedTool === 'text' ? 'active' : ''}`}
              title="Text"
              onClick={() => setSelectedTool('text')}
            >
              <MdTextFields />
            </button>
            <button
              className={`icon-btn ${selectedTool === 'media' ? 'active' : ''}`}
              title="Media"
              onClick={() => setSelectedTool('media')}
            >
              <MdPhotoLibrary />
            </button>
            <button
              className={`icon-btn ${selectedTool === 'layers' ? 'active' : ''}`}
              title="Layers"
              onClick={() => setSelectedTool('layers')}
            >
              <MdLayers />
            </button>
            <button
              className={`icon-btn ${selectedTool === 'effects' ? 'active' : ''}`}
              title="Effects"
              onClick={() => setSelectedTool('effects')}
            >
              <MdPalette />
            </button>
          </div>

          <div className="top-right">
            <button
              className="icon-btn"
              title="Preview"
              onClick={handlePreview}
            >
              <MdPlayCircleOutline /> Preview
            </button>
            <button
              className="icon-btn"
              title="Settings"
              onClick={() => {
                alert('Settings panel coming soon!')
                // TODO: Implement settings panel
              }}
            >
              <MdSettings />
            </button>
            <button className="primary-btn" onClick={exportVideo}>
              Export Video
            </button>
          </div>
        </div>

        <div className="editor-main">
          {/* Media Library */}
          <div className="media-library">
            <div className="library-section">
              <h3 className="section-title">Media Library</h3>
              <div
                className="upload-area"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*,video/*,audio/*'
                  input.multiple = true
                  input.onchange = (e) => {
                    const files = Array.from(e.target.files)
                    files.forEach(file => {
                      const url = URL.createObjectURL(file)
                      addLayer(file.type.split('/')[0], url)
                    })
                  }
                  input.click()
                }}
              >
                <MdCloudUpload size={24} />
                <div>Upload Media</div>
              </div>
              <div className="media-grid">
                {predefinedMedia.map((media) => (
                  <div
                    key={media.id}
                    className="media-item"
                    onClick={() => addLayer('image', media.full)}
                    title={`Add ${media.name}`}
                  >
                    <img src={media.image} alt={media.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="library-section">
              <h3 className="section-title">Page Templates</h3>
              <div className="media-grid">
                {pageTemplates.map(template => (
                  <div
                    key={template.id}
                    className="media-item"
                    title={template.name}
                    onClick={() => handleAddTemplateScene(template)}
                  >
                    {template.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="canvas-area">
            <div className="preview-container">
              <div className="preview-wrapper">
                <Player
                  ref={playerRef}
                  component={VideoComposition}
                  durationInFrames={Math.max(totalDurationInFrames, 1)}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  fps={30}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'white'
                  }}
                  inputProps={{
                    scenes: scenes
                  }}
                  showOutlines={false}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onFrameUpdate={(frame) => {
                    const time = frame / 30
                    setCurrentTime(time)
                    const { scene } = getSceneForFrame(frame)
                    if (scene && scene.id !== activeSceneId) {
                      setActiveSceneId(scene.id)
                      if (isPlaying && scene.script) {
                        speakText(scene.script, scene.id)
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="preview-controls">
              <div className="playback-controls">
                <button
                  className="icon-btn"
                  title="Stop"
                  onClick={handleStop}
                >
                  <MdStop />
                </button>
                <button
                  className="icon-btn"
                  title="Play/Pause"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <MdPause /> : <MdPlayArrow />}
                </button>
                <div className="time-display">
                  {String(Math.floor(currentTime / 60)).padStart(2, '0')}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {String(Math.floor((totalDurationInFrames / 30) / 60)).padStart(2, '0')}:{String(Math.floor((totalDurationInFrames / 30) % 60)).padStart(2, '0')}
                </div>
              </div>

              <div className="zoom-controls">
                <button
                  className="icon-btn"
                  title="Zoom Out"
                  onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                >
                  <MdZoomOut />
                </button>
                <span style={{ color: '#aaa', fontSize: '12px', margin: '0 8px' }}>
                  {zoomLevel}%
                </span>
                <button
                  className="icon-btn"
                  title="Zoom In"
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                >
                  <MdZoomIn />
                </button>
                <button
                  className="icon-btn"
                  title="Fullscreen"
                  onClick={() => {
                    const elem = document.querySelector('.preview-wrapper')
                    if (elem.requestFullscreen) {
                      elem.requestFullscreen()
                    }
                  }}
                >
                  <MdFullscreen />
                </button>
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="properties-panel">
            {selectedTool === 'avatar' && (
              <div className="property-group">
                <h3 className="property-title">
                  <MdPerson style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Avatar Selection
                </h3>
                <div className="avatar-selection">
                  <div className="avatar-options" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '8px'
                  }}>
                    {predefinedAvatars.map((avatar) => (
                      <div
                        key={avatar.id}
                        className={`avatar-option ${activeScene?.avatarType === avatar.id ? 'active' : ''}`}
                        onClick={() => selectAvatar(avatar.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px',
                          border: `2px solid ${activeScene?.avatarType === avatar.id ? '#0066cc' : '#333'}`,
                          borderRadius: '8px',
                          background: activeScene?.avatarType === avatar.id ? '#0066cc' : '#2a2a2a',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid rgba(255,255,255,0.2)'
                          }}
                        />
                        <span style={{
                          fontSize: '11px',
                          textAlign: 'center',
                          fontWeight: 600,
                          color: activeScene?.avatarType === avatar.id ? '#fff' : '#aaa'
                        }}>
                          {avatar.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTool === 'text' && (
              <div className="property-group">
                <h3 className="property-title">
                  <MdTextFields style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Text Styling
                </h3>

                {/* Dynamically render fields based on template */}
                {(pageTemplates.find(t => t.layout === (activeScene?.layout || 'split-right'))?.fields || []).map(field => (
                  <div key={field.key} className="property-row">
                    <label className="property-label">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="property-input"
                        style={{ minHeight: '60px', resize: 'vertical' }}
                        value={activeScene?.[field.key] || ''}
                        onChange={(e) => updateScene(activeSceneId, { [field.key]: e.target.value })}
                      />
                    ) : (
                      <input
                        className="property-input"
                        value={activeScene?.[field.key] || ''}
                        onChange={(e) => updateScene(activeSceneId, { [field.key]: e.target.value })}
                      />
                    )
                    }
                  </div>
                ))}

                <div style={{ height: '8px', borderBottom: '1px solid #333', margin: '8px 0' }} />

                <div className="property-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label className="property-label">Title Size</label>
                    <input
                      className="property-input"
                      type="number"
                      value={activeScene?.titleStyle?.fontSize || 48}
                      onChange={(e) => updateScene(activeSceneId, {
                        titleStyle: { ...(activeScene?.titleStyle || {}), fontSize: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="property-label">Title Color</label>
                    <input
                      className="property-input"
                      type="color"
                      style={{ height: '32px', padding: '2px' }}
                      value={activeScene?.titleStyle?.color || '#000000'}
                      onChange={(e) => updateScene(activeSceneId, {
                        titleStyle: { ...(activeScene?.titleStyle || {}), color: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div className="property-row">
                  <label className="property-label">Alignment</label>
                  <select
                    className="property-input"
                    value={activeScene?.titleStyle?.textAlign || 'left'}
                    onChange={(e) => updateScene(activeSceneId, {
                      titleStyle: { ...(activeScene?.titleStyle || {}), textAlign: e.target.value }
                    })}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div className="property-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label className="property-label">Sub Size</label>
                    <input
                      className="property-input"
                      type="number"
                      value={activeScene?.subtitleStyle?.fontSize || 24}
                      onChange={(e) => updateScene(activeSceneId, {
                        subtitleStyle: { ...(activeScene?.subtitleStyle || {}), fontSize: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="property-label">Sub Color</label>
                    <input
                      className="property-input"
                      type="color"
                      style={{ height: '32px', padding: '2px' }}
                      value={activeScene?.subtitleStyle?.color || '#333333'}
                      onChange={(e) => updateScene(activeSceneId, {
                        subtitleStyle: { ...(activeScene?.subtitleStyle || {}), color: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedTool === 'layers' && (
              <div className="property-group">
                <h3 className="property-title">
                  <MdLayers style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  B-Roll & Overlays
                </h3>
                <div className="layers-list">
                  {(activeScene?.layers || []).length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '12px', border: '1px dashed #444', borderRadius: '8px' }}>
                      No extra layers in this scene. Add media from the library to see them here.
                    </div>
                  ) : (
                    activeScene.layers.map(layer => (
                      <div key={layer.id} className="layer-item-preview">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {layer.type === 'image' ? <MdPhotoLibrary size={14} /> : <MdVideoLibrary size={14} />}
                          <span>{layer.type}</span>
                        </div>
                        <button onClick={() => {
                          updateScene(activeSceneId, {
                            layers: activeScene.layers.filter(l => l.id !== layer.id)
                          })
                        }}>
                          <MdDelete size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* General Properties */}
            <div className="property-group">
              <h3 className="property-title">Scene Configuration</h3>
              <div className="property-row">
                <label className="property-label">Duration (seconds)</label>
                <input
                  className="property-input"
                  type="number"
                  value={activeScene?.duration || 8}
                  onChange={(e) => updateScene(activeSceneId, { duration: Number(e.target.value) })}
                />
              </div>
              <div className="property-row">
                <label className="property-label">Transition</label>
                <select className="property-input" defaultValue="fade">
                  <option value="none">None (Cut)</option>
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                </select>
              </div>
            </div>

            <div className="property-group">
              <h3 className="property-title">
                <MdMic style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Voiceover Script
              </h3>
              <textarea
                className="script-input"
                placeholder="What will the AI say?"
                value={activeScene?.script || ''}
                onChange={(e) => updateScene(activeSceneId, { script: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        </div>
        {/* Enhanced Timeline Component */}
        <div className="timeline-area" style={{ height: '300px', display: 'block' }}>
          <TimelineEditor
            scenes={scenes}
            activeSceneId={activeSceneId}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onSeek={handleSeek}
            onSelectScene={setActiveSceneId}
            onUpdateScene={updateScene}
            onAddScene={addScene}
            onDeleteScene={deleteScene}
            onReorderScenes={handleReorderScenes}
          />
        </div>

        {/* Removed redundant overlay tools palette as requested */}

        {/* Preview Modal (Updated to "Fullscreen Mode") */}
        {showPreviewModal && (
          <div className="fullscreen-preview-page">
            <style>{`
              .fullscreen-preview-page {
                position: fixed;
                inset: 0;
                background: #000;
                z-index: 2000;
                display: flex;
                flex-direction: column;
                color: #fff;
              }
              .preview-topbar {
                height: 60px;
                padding: 0 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(255,255,255,0.05);
                backdrop-filter: blur(10px);
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                z-index: 100;
              }
              .preview-content {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #0a0a0a;
              }
              .close-preview {
                background: #ff4d4d;
                border: none;
                color: #fff;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
              }
            `}</style>
            <div className="preview-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '18px' }}>AthenaVI Preview</span>
                <span style={{ color: '#888', fontSize: '14px' }}>Draft - {scenes.length} Scenes</span>
              </div>
              <button className="close-preview" onClick={() => {
                setShowPreviewModal(false)
                setIsPlaying(false)
                if (playerRef.current) playerRef.current.pause()
                window.speechSynthesis.cancel()
              }}>
                Exit Preview
              </button>
            </div>
            <div className="preview-content">
              <Player
                ref={playerRef}
                component={VideoComposition}
                durationInFrames={Math.max(totalDurationInFrames, 30)}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                controls
                autoPlay
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '100vh'
                }}
                inputProps={{
                  scenes: scenes
                }}
                onPlay={() => {
                  setIsPlaying(true)
                  const currentScene = scenes.find(s => s.id === activeSceneId)
                  if (currentScene?.script) {
                    speakText(currentScene.script, activeSceneId)
                  }
                }}
                onPause={() => {
                  setIsPlaying(false)
                  window.speechSynthesis.pause()
                }}
                onSeek={(frame) => {
                  setCurrentTime(frame / 30)
                  const { scene } = getSceneForFrame(frame)
                  if (scene) {
                    setActiveSceneId(scene.id)
                    if (scene.script) {
                      window.speechSynthesis.cancel()
                      setTimeout(() => speakText(scene.script, scene.id), 300)
                    }
                  }
                }}
                onFrameUpdate={(frame) => {
                  setCurrentTime(frame / 30)
                  const { scene } = getSceneForFrame(frame)
                  if (scene && scene.id !== activeSceneId) {
                    setActiveSceneId(scene.id)
                    if (scene.script) {
                      window.speechSynthesis.cancel()
                      setTimeout(() => speakText(scene.script, scene.id), 300)
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Export Video</h2>
              <div className="modal-body">
                <div className="property-group">
                  <div className="property-row">
                    <label className="property-label">Format</label>
                    <select
                      className="property-input"
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                    >
                      <option>MP4</option>
                      <option>WebM</option>
                      <option>GIF</option>
                    </select>
                  </div>
                  <div className="property-row">
                    <label className="property-label">Resolution</label>
                    <select
                      className="property-input"
                      value={exportResolution}
                      onChange={(e) => setExportResolution(e.target.value)}
                    >
                      <option>1920x1080</option>
                      <option>1280x720</option>
                      <option>3840x2160</option>
                    </select>
                  </div>
                  <div className="property-row">
                    <label className="property-label">Frame Rate</label>
                    <select
                      className="property-input"
                      value={exportFrameRate}
                      onChange={(e) => setExportFrameRate(e.target.value)}
                    >
                      <option>30</option>
                      <option>24</option>
                      <option>60</option>
                    </select>
                  </div>
                  <div className="property-row">
                    <label className="property-label">Quality</label>
                    <select
                      className="property-input"
                      value={exportQuality}
                      onChange={(e) => setExportQuality(e.target.value)}
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>

                {/* Credit Display */}
                <div className="credit-display" style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px',
                  border: '1px solid #444'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#fff', fontSize: '14px' }}>Credit Consumption:</span>
                    <span style={{
                      color: '#4CAF50',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>
                      {calculateCredits()} credits
                    </span>
                  </div>
                  <div style={{
                    color: '#888',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}>
                    Credits vary based on format, resolution, frame rate, and quality
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowExportModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={() => {
                  alert(`Video export started! This will consume ${calculateCredits()} credits.`)
                  setShowExportModal(false)
                }}>
                  Start Export
                </button>
              </div>
            </div>
          </div>
        )}

        {showTemplateModal && (
          <div className="modal-overlay">
            <div className="template-modal">
              <div className="preview-modal-header">
                <h3 className="preview-modal-title">Select a Scene Template</h3>
                <button className="preview-modal-close" onClick={() => setShowTemplateModal(false)}>
                  <MdClose size={24} />
                </button>
              </div>
              <div className="template-grid">
                {pageTemplates.map(template => (
                  <div
                    key={template.id}
                    className="template-card"
                    onClick={() => handleAddTemplateScene(template)}
                  >
                    <div className="template-preview-wrapper" style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid #444',
                      background: '#000',
                      pointerEvents: 'none'
                    }}>
                      <StaticPreview scene={{
                        layout: template.layout,
                        titleText: template.fields.find(f => f.key === 'titleText')?.default || template.name,
                        subtitleText: template.fields.find(f => f.key === 'subtitleText')?.default || '',
                        avatar: avatar1,
                        ...template.fields.reduce((acc, f) => ({ ...acc, [f.key]: f.default }), {})
                      }} />
                    </div>
                    <div className="template-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ color: '#0066cc', fontSize: '18px', display: 'flex' }}>{template.icon}</div>
                        <h4 style={{ margin: 0 }}>{template.name}</h4>
                      </div>
                      <p>{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowTemplateModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Create

