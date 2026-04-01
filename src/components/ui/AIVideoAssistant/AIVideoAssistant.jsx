import { useState, useRef, useEffect } from 'react'
import {
  MdClose,
  MdCloudUpload,
  MdLink,
  MdAutoAwesome,
  MdTextFields,
  MdArrowDropDown,
  MdAdd,
  MdCheck,
} from 'react-icons/md'

const styles = `
.ai-assistant-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.ai-assistant-modal {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-assistant-header {
  padding: 28px 32px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(to bottom, #ffffff 0%, #fafafa 100%);
}

.ai-assistant-title {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}

.ai-assistant-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.ai-assistant-close {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.ai-assistant-close:hover {
  background: #f1f5f9;
  color: #334155;
}

.ai-assistant-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 0;
  overflow: hidden;
  flex: 1;
  min-width: 0;
}

.ai-assistant-sidebar {
  padding: 28px;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
  min-width: 0;
  max-width: 400px;
}

.ai-assistant-sidebar::-webkit-scrollbar {
  width: 6px;
}

.ai-assistant-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.ai-assistant-sidebar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.ai-assistant-sidebar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.ai-assistant-main {
  padding: 40px;
  overflow-y: auto;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.ai-assistant-main::-webkit-scrollbar {
  width: 6px;
}

.ai-assistant-main::-webkit-scrollbar-track {
  background: transparent;
}

.ai-assistant-main::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.ai-assistant-main::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.source-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.source-tab {
  flex: 1;
  padding: 11px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  position: relative;
}

.source-tab:hover {
  color: #334155;
}

.source-tab.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffffff;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.upload-area:hover::before {
  opacity: 1;
}

.upload-area.dragover {
  border-color: #3b82f6;
  background: #eff6ff;
  border-style: solid;
  transform: scale(1.02);
}

.upload-icon {
  font-size: 52px;
  color: #94a3b8;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.upload-area:hover .upload-icon {
  color: #3b82f6;
  transform: scale(1.1);
}

.upload-text {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
  position: relative;
  z-index: 1;
}

.upload-hint {
  font-size: 13px;
  color: #94a3b8;
  position: relative;
  z-index: 1;
}

.url-input {
  width: 100%;
  padding: 13px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 24px;
  transition: all 0.2s ease;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.url-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 
    0 0 0 3px rgba(59, 130, 246, 0.1),
    0 2px 4px rgba(59, 130, 246, 0.1);
}

.prompt-textarea {
  width: 100%;
  min-height: 120px;
  padding: 13px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 24px;
  transition: all 0.2s ease;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.prompt-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 
    0 0 0 3px rgba(59, 130, 246, 0.1),
    0 2px 4px rgba(59, 130, 246, 0.1);
}

.prompt-example {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 8px;
  font-style: italic;
}

.script-textarea {
  width: 100%;
  min-height: 200px;
  padding: 13px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 24px;
  transition: all 0.2s ease;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.script-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 
    0 0 0 3px rgba(59, 130, 246, 0.1),
    0 2px 4px rgba(59, 130, 246, 0.1);
}

.config-section {
  margin-bottom: 20px;
}

.config-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  display: block;
}

.config-select {
  width: 100%;
  padding: 13px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.config-select:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.config-select.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 4px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
  max-height: 220px;
  overflow-y: auto;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.config-dropdown::-webkit-scrollbar {
  width: 6px;
}

.config-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.config-dropdown::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.config-dropdown-item {
  padding: 13px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;
  color: #0f172a;
  font-weight: 400;
}

.config-dropdown-item:hover {
  background: #f0f7ff;
  color: #3b82f6;
}

.config-dropdown-item.selected {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #3b82f6;
  font-weight: 600;
}

.option-container {
  margin-bottom: 16px;
  padding: 18px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.option-container:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.option-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.option-remove {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.option-remove:hover {
  background: #f1f5f9;
  color: #64748b;
}

.option-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: #f8fafc;
  color: #0f172a;
  transition: all 0.2s ease;
  box-sizing: border-box;
  min-height: 44px;
  font-family: inherit;
}

.option-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.option-input::placeholder {
  color: #94a3b8;
}

.option-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: #f8fafc;
  color: #0f172a;
  transition: all 0.2s ease;
  box-sizing: border-box;
  min-height: 60px;
  font-family: inherit;
  resize: vertical;
}

.option-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.option-textarea::placeholder {
  color: #94a3b8;
}

.config-select-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.template-thumbnail {
  width: 40px;
  height: 30px;
  border-radius: 4px;
  background: #f1f5f9;
  border: 1px solid #e5e7eb;
  object-fit: cover;
}

.config-select-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.config-select-title {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
}

.config-select-subtitle {
  font-size: 12px;
  color: #94a3b8;
}

.brand-kit-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #64748b;
  position: relative;
}

.brand-kit-icon::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  background: #000000;
  border-radius: 2px;
}

.additional-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.option-btn:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
  color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}

.create-outline-btn {
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 10px;
  background: #e5e7eb;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 600;
  cursor: not-allowed;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-top: 8px;
}

.create-outline-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  cursor: pointer;
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.3),
    0 2px 4px rgba(59, 130, 246, 0.2);
}

.create-outline-btn.active:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 
    0 6px 16px rgba(59, 130, 246, 0.4),
    0 4px 8px rgba(59, 130, 246, 0.3);
}

.create-outline-btn.active:active {
  transform: translateY(0);
}

.main-content-icons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 28px;
}

.main-icon {
  width: 52px;
  height: 52px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 22px;
  background: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.main-icon:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15);
}

.step-indicator {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 32px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e5e7eb;
}

.step-dot.active {
  background: #3b82f6;
}

.step-number-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #64748b;
  margin: 0 auto 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.main-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 18px 0;
  text-align: center;
  letter-spacing: -0.01em;
}

.main-description {
  font-size: 15px;
  color: #64748b;
  line-height: 1.7;
  margin: 0 0 36px 0;
  text-align: center;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;
}

.main-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding: 0 20px;
}

.nav-arrow {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s ease;
}

.nav-arrow:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #64748b;
}

.nav-arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.step-card {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 14px;
  padding: 28px;
  margin-bottom: 28px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.step-card-outline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.outline-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.outline-bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #cbd5e1;
  margin-top: 6px;
  flex-shrink: 0;
}

.outline-line {
  height: 2px;
  background: #e2e8f0;
  border-radius: 1px;
  flex: 1;
}

.outline-line.short {
  width: 60%;
}

.outline-line.medium {
  width: 80%;
}

.outline-line.long {
  width: 100%;
}

.step-card-video {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 16px;
}

.video-thumbnail {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  background: #e2e8f0;
}

.video-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.learn-more-btn {
  display: block;
  margin: 40px auto 0;
  padding: 12px 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.learn-more-btn:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
  color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}
`

function AIVideoAssistant({ onClose, onCreate }) {
  const [activeTab, setActiveTab] = useState('file')
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [script, setScript] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('stylish-corporate')
  const [selectedBrandKit, setSelectedBrandKit] = useState('no-brand-kit')
  const [duration, setDuration] = useState('2 minutes')
  const [isDragging, setIsDragging] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const fileInputRef = useRef(null)

  const templates = [
    { id: 'stylish-corporate', name: 'Stylish Corporate', orientation: 'Landscape', thumbnail: null },
    { id: 'modern-business', name: 'Modern Business', orientation: 'Landscape', thumbnail: null },
    { id: 'casual-friendly', name: 'Casual Friendly', orientation: 'Landscape', thumbnail: null },
  ]

  const brandKits = [
    { id: 'no-brand-kit', name: 'No Brand Kit', themes: 'No themes' },
    { id: 'custom-brand', name: 'Custom Brand', themes: '3 themes' },
  ]

  const durations = ['30 seconds', '1 minute', '2 minutes', '3 minutes', '4 minutes', '5 minutes']
  const [showDurationDropdown, setShowDurationDropdown] = useState(false)
  const [expandedOptions, setExpandedOptions] = useState({
    objective: false,
    audience: false,
    language: false,
    speaker: false,
    tone: false
  })
  const [optionValues, setOptionValues] = useState({
    objective: '',
    audience: '',
    language: 'English',
    speaker: '',
    tone: ''
  })

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
    }
  }

  const toggleOption = (option) => {
    setExpandedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  const updateOptionValue = (option, value) => {
    setOptionValues(prev => ({
      ...prev,
      [option]: value
    }))
  }

  const removeOption = (option) => {
    setExpandedOptions(prev => ({
      ...prev,
      [option]: false
    }))
    setOptionValues(prev => ({
      ...prev,
      [option]: option === 'language' ? 'English' : ''
    }))
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.config-select')) {
        setShowDurationDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const canCreateOutline = () => {
    if (activeTab === 'file') return file !== null
    if (activeTab === 'url') return url.trim() !== ''
    if (activeTab === 'prompt') return prompt.trim() !== ''
    if (activeTab === 'script') return script.trim() !== ''
    return false
  }

  const handleCreateOutline = () => {
    if (!canCreateOutline()) return
    
    const data = {
      source: activeTab,
      file: activeTab === 'file' ? file : null,
      url: activeTab === 'url' ? url : null,
      prompt: activeTab === 'prompt' ? prompt : null,
      script: activeTab === 'script' ? script : null,
      template: selectedTemplate,
      brandKit: selectedBrandKit,
       duration: duration,
       options: optionValues
    }
    
    console.log('Creating outline with:', data)
    // TODO: Implement actual outline creation
    if (onCreate) {
      onCreate(data)
    }
    onClose()
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ai-assistant-overlay" onClick={onClose}>
        <div className="ai-assistant-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ai-assistant-header">
            <div>
              <h2 className="ai-assistant-title">AI Video Assistant</h2>
              <p className="ai-assistant-subtitle">Create a video from any source</p>
            </div>
            <button className="ai-assistant-close" onClick={onClose}>
              <MdClose size={24} />
            </button>
          </div>

          <div className="ai-assistant-content">
            {/* Left Sidebar */}
            <div className="ai-assistant-sidebar">
              {/* Source Tabs */}
              <div className="source-tabs">
                <button
                  className={`source-tab ${activeTab === 'file' ? 'active' : ''}`}
                  onClick={() => setActiveTab('file')}
                >
                  <MdCloudUpload size={18} />
                  File
                </button>
                <button
                  className={`source-tab ${activeTab === 'url' ? 'active' : ''}`}
                  onClick={() => setActiveTab('url')}
                >
                  <MdLink size={18} />
                  URL
                </button>
                <button
                  className={`source-tab ${activeTab === 'prompt' ? 'active' : ''}`}
                  onClick={() => setActiveTab('prompt')}
                >
                  <MdAutoAwesome size={18} />
                  Prompt
                </button>
                <button
                  className={`source-tab ${activeTab === 'script' ? 'active' : ''}`}
                  onClick={() => setActiveTab('script')}
                >
                  <MdTextFields size={18} />
                  Script
                </button>
              </div>

              {/* File Upload */}
              {activeTab === 'file' && (
                <div
                  className={`upload-area ${isDragging ? 'dragover' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <MdCloudUpload className="upload-icon" />
                  <div className="upload-text">Drag & drop your file</div>
                  <div className="upload-hint">PowerPoint, PDF, Word, or TXT</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pptx,.ppt,.pdf,.doc,.docx,.txt"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  {file && (
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#3b82f6' }}>
                      Selected: {file.name}
                    </div>
                  )}
                </div>
              )}

              {/* URL Input */}
              {activeTab === 'url' && (
                <input
                  type="url"
                  className="url-input"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              )}

              {/* Prompt Input */}
              {activeTab === 'prompt' && (
                <>
                  <textarea
                    className="prompt-textarea"
                    placeholder="Describe your video's topic and provide any relevant instructions."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <div className="prompt-example">
                    Example: Introduction to financial well-being.
                  </div>
                </>
              )}

              {/* Script Input */}
              {activeTab === 'script' && (
                <textarea
                  className="script-textarea"
                  placeholder="Write or paste your script here.&#10;Divide your script into scenes with new paragraphs."
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                />
              )}

              {/* Template Selection */}
              <div className="config-section">
                <label className="config-label">Template</label>
                <div className="config-select">
                  <div className="config-select-content">
                    {selectedTemplate === 'stylish-corporate' && (
                      <div className="template-thumbnail" style={{ background: '#f1f5f9' }} />
                    )}
                    <div className="config-select-text">
                      <div className="config-select-title">
                        {templates.find(t => t.id === selectedTemplate)?.name || 'Stylish Corporate'}
                      </div>
                      <div className="config-select-subtitle">
                        {templates.find(t => t.id === selectedTemplate)?.orientation || 'Landscape'}
                      </div>
                    </div>
                  </div>
                  <MdArrowDropDown size={20} color="#94a3b8" />
                </div>
              </div>

              {/* Brand Kit Selection */}
              <div className="config-section">
                <label className="config-label">Brand Kit</label>
                <div className="config-select">
                  <div className="config-select-content">
                    <div className="brand-kit-icon">
                      <span style={{ fontSize: '20px' }}>Aa</span>
                    </div>
                    <div className="config-select-text">
                      <div className="config-select-title">
                        {brandKits.find(b => b.id === selectedBrandKit)?.name || 'No Brand Kit'}
                      </div>
                      <div className="config-select-subtitle">
                        {brandKits.find(b => b.id === selectedBrandKit)?.themes || 'No themes'}
                      </div>
                    </div>
                  </div>
                  <MdArrowDropDown size={20} color="#94a3b8" />
                </div>
              </div>

               {/* Duration Selection */}
               <div className="config-section" style={{ position: 'relative' }}>
                 <label className="config-label">Duration</label>
                 <div 
                   className={`config-select ${showDurationDropdown ? 'active' : ''}`}
                   onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                   style={{ position: 'relative' }}
                 >
                   <div className="config-select-content">
                     <div className="config-select-text">
                       <div className="config-select-title">{duration}</div>
                     </div>
                   </div>
                   <MdArrowDropDown size={20} color="#94a3b8" />
                   {showDurationDropdown && (
                     <div className="config-dropdown">
                       {durations.map((dur) => (
                         <div
                           key={dur}
                           className={`config-dropdown-item ${duration === dur ? 'selected' : ''}`}
                           onClick={(e) => {
                             e.stopPropagation()
                             setDuration(dur)
                             setShowDurationDropdown(false)
                           }}
                         >
                           {dur}
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>

               {/* Additional Options - Show containers for expanded options */}
               {expandedOptions.objective && (
                 <div className="option-container">
                   <div className="option-header">
                     <label className="option-label">Objective</label>
                     <button className="option-remove" onClick={() => removeOption('objective')}>
                       <MdClose size={16} />
                     </button>
                   </div>
                   <textarea
                     className="option-textarea"
                     placeholder="Convince viewers to take basic first steps towards planning their finance"
                     value={optionValues.objective}
                     onChange={(e) => updateOptionValue('objective', e.target.value)}
                     rows={3}
                   />
                 </div>
               )}

               {expandedOptions.audience && (
                 <div className="option-container">
                   <div className="option-header">
                     <label className="option-label">Audience</label>
                     <button className="option-remove" onClick={() => removeOption('audience')}>
                       <MdClose size={16} />
                     </button>
                   </div>
                   <textarea
                     className="option-textarea"
                     placeholder="Employees of a successful startup"
                     value={optionValues.audience}
                     onChange={(e) => updateOptionValue('audience', e.target.value)}
                     rows={2}
                   />
                 </div>
               )}

               {expandedOptions.language && (
                 <div className="option-container">
                   <div className="option-header">
                     <label className="option-label">Language</label>
                     <button className="option-remove" onClick={() => removeOption('language')}>
                       <MdClose size={16} />
                     </button>
                   </div>
                   <select
                     className="option-input"
                     value={optionValues.language}
                     onChange={(e) => updateOptionValue('language', e.target.value)}
                   >
                     <option value="English">English</option>
                     <option value="Spanish">Spanish</option>
                     <option value="French">French</option>
                     <option value="German">German</option>
                     <option value="Italian">Italian</option>
                     <option value="Portuguese">Portuguese</option>
                     <option value="Chinese">Chinese</option>
                     <option value="Japanese">Japanese</option>
                   </select>
                 </div>
               )}

               {expandedOptions.speaker && (
                 <div className="option-container">
                   <div className="option-header">
                     <label className="option-label">Speaker</label>
                     <button className="option-remove" onClick={() => removeOption('speaker')}>
                       <MdClose size={16} />
                     </button>
                   </div>
                   <input
                     type="text"
                     className="option-input"
                     placeholder="A financial advisor with 20 years experience"
                     value={optionValues.speaker}
                     onChange={(e) => updateOptionValue('speaker', e.target.value)}
                   />
                 </div>
               )}

               {expandedOptions.tone && (
                 <div className="option-container">
                   <div className="option-header">
                     <label className="option-label">Tone</label>
                     <button className="option-remove" onClick={() => removeOption('tone')}>
                       <MdClose size={16} />
                     </button>
                   </div>
                   <input
                     type="text"
                     className="option-input"
                     placeholder="Friendly"
                     value={optionValues.tone}
                     onChange={(e) => updateOptionValue('tone', e.target.value)}
                   />
                 </div>
               )}

               {/* Additional Options Buttons - Show only unexpanded options */}
               <div className="additional-options">
                 {!expandedOptions.objective && (
                   <button
                     className="option-btn"
                     onClick={() => toggleOption('objective')}
                   >
                     <MdAdd size={16} />
                     Objective
                   </button>
                 )}
                 {!expandedOptions.audience && (
                   <button
                     className="option-btn"
                     onClick={() => toggleOption('audience')}
                   >
                     <MdAdd size={16} />
                     Audience
                   </button>
                 )}
                 {!expandedOptions.language && (
                   <button
                     className="option-btn"
                     onClick={() => toggleOption('language')}
                   >
                     <MdAdd size={16} />
                     Language
                   </button>
                 )}
                 {!expandedOptions.speaker && (
                   <button
                     className="option-btn"
                     onClick={() => toggleOption('speaker')}
                   >
                     <MdAdd size={16} />
                     Speaker
                   </button>
                 )}
                 {!expandedOptions.tone && (
                   <button
                     className="option-btn"
                     onClick={() => toggleOption('tone')}
                   >
                     <MdAdd size={16} />
                     Tone
                   </button>
                 )}
               </div>

              {/* Create Outline Button */}
              <button
                className={`create-outline-btn ${canCreateOutline() ? 'active' : ''}`}
                onClick={handleCreateOutline}
                disabled={!canCreateOutline()}
              >
                Create outline
              </button>
            </div>

            {/* Right Main Content */}
            <div className="ai-assistant-main">
              <div className="main-content-icons">
                <div className="main-icon">
                  <MdCloudUpload size={20} />
                </div>
                <div className="main-icon">
                  <MdLink size={20} />
                </div>
                <div className="main-icon">
                  <MdAutoAwesome size={20} />
                </div>
                <div className="main-icon">
                  <MdTextFields size={20} />
                </div>
              </div>

              <div className="step-indicator">
                <div className={`step-dot ${currentStep === 1 ? 'active' : ''}`} />
                <div className={`step-dot ${currentStep === 2 ? 'active' : ''}`} />
                <div className={`step-dot ${currentStep === 3 ? 'active' : ''}`} />
              </div>

              {/* Step 1: Add your source */}
              {currentStep === 1 && (
                <>
                  <div className="step-number-circle">1</div>
                  <h3 className="main-title">Add your source</h3>
                  <p className="main-description">
                    Turn any document, PowerPoint, or webpage into a video. Alternatively, provide a prompt or script as the basis for your video.
                  </p>
                </>
              )}

              {/* Step 2: Edit the outline */}
              {currentStep === 2 && (
                <>
                  <div className="step-card">
                    <div className="step-card-outline">
                      <div className="outline-item">
                        <div className="outline-bullet" />
                        <div className="outline-line short" />
                      </div>
                      <div className="outline-item">
                        <div className="outline-bullet" />
                        <div className="outline-line medium" />
                      </div>
                      <div className="outline-item">
                        <div className="outline-bullet" />
                        <div className="outline-line long" />
                      </div>
                      <div className="outline-item">
                        <div className="outline-bullet" />
                        <div className="outline-line short" />
                      </div>
                      <div className="outline-item">
                        <div className="outline-bullet" />
                        <div className="outline-line medium" />
                      </div>
                    </div>
                  </div>
                  <div className="step-number-circle">2</div>
                  <h3 className="main-title">Edit the outline</h3>
                  <p className="main-description">
                    We'll draft an outline of the script as a starting point. You can edit this outline to cover the right topics in your video.
                  </p>
                </>
              )}

              {/* Step 3: Get your video */}
              {currentStep === 3 && (
                <>
                  <div className="step-card">
                    <div className="step-card-video">
                      <div className="video-thumbnail" />
                      <div className="video-lines">
                        <div className="outline-line medium" />
                        <div className="outline-line short" />
                        <div className="outline-line long" />
                      </div>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <div className="step-card-video">
                        <div className="video-thumbnail" />
                        <div className="video-lines">
                          <div className="outline-line medium" />
                          <div className="outline-line short" />
                          <div className="outline-line long" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="step-number-circle">3</div>
                  <h3 className="main-title">Get your video</h3>
                  <p className="main-description">
                    We'll create a video based on your outline. You can make edits as needed and generate the video before sharing with others.
                  </p>
                </>
              )}

              <div className="main-navigation">
                <button 
                  className="nav-arrow"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  <MdArrowDropDown size={20} style={{ transform: 'rotate(-90deg)' }} />
                </button>
                <button 
                  className="nav-arrow"
                  onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                  disabled={currentStep === 3}
                >
                  <MdArrowDropDown size={20} style={{ transform: 'rotate(90deg)' }} />
                </button>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AIVideoAssistant
