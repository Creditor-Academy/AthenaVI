import { useState, useRef, useEffect } from 'react'
import { MdClose, MdCheckCircle, MdOpenInNew, MdPlayArrow, MdMic, MdCloudUpload, MdPerson, MdTextFields, MdKeyboardArrowDown, MdPause, MdSpeed, MdEdit } from 'react-icons/md'

const styles = `
.voice-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: flex-end;
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

.voice-panel {
  width: 100%;
  max-width: 600px;
  height: 100vh;
  background: #ffffff;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
  overflow: hidden;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.voice-panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.voice-panel-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.voice-panel-close {
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;
}

.voice-panel-close:hover {
  background: #f1f5f9;
  color: #334155;
}

.voice-panel-steps {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.voice-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.voice-step.active {
  color: #3b82f6;
  background: #e0ecff;
}

.voice-step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #64748b;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.voice-step-number svg {
  width: 16px;
  height: 16px;
}

.voice-step.active .voice-step-number {
  background: #3b82f6;
  color: #ffffff;
}

.voice-panel-guidelines {
  margin-left: auto;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.voice-panel-guidelines:hover {
  background: #f1f5f9;
  color: #334155;
}

.voice-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.voice-panel-section-title {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.voice-panel-section-title .highlight {
  color: #3b82f6;
}

.voice-panel-description {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.voice-video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-video-play-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 32px;
  transition: all 0.2s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.voice-video-play-btn:hover {
  transform: scale(1.1);
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.voice-instructions {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.voice-instruction-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.voice-instruction-icon {
  color: #3b82f6;
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.voice-instruction-text {
  font-size: 15px;
  color: #334155;
  line-height: 1.6;
  margin: 0;
}

.voice-instruction-text strong {
  color: #1e293b;
  font-weight: 700;
}

.voice-panel-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  background: #ffffff;
  position: sticky;
  bottom: 0;
}

.voice-panel-btn {
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  transition: all 0.2s ease;
}

.voice-panel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.voice-panel-btn:active {
  transform: translateY(0);
}

.voice-panel-btn.secondary {
  background: #f1f5f9;
  color: #334155;
  box-shadow: none;
  margin-right: 12px;
}

.voice-panel-btn.secondary:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.voice-options-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 24px;
}

.voice-option-card {
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.voice-option-card:hover {
  border-color: #cbd5e1;
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.voice-option-card.selected {
  border-color: #3b82f6;
  background: #e0ecff;
}

.voice-option-icon {
  width: 64px;
  height: 64px;
  background: #e5e7eb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 32px;
}

.voice-option-card.selected .voice-option-icon {
  background: #3b82f6;
  color: #ffffff;
}

.voice-option-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.voice-option-description {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.voice-step.completed .voice-step-number {
  background: #10b981;
  color: #ffffff;
}

.voice-step.completed {
  color: #10b981;
}

.voice-recording-container {
  margin-top: 24px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.voice-recording-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.voice-record-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  font-size: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
  transition: all 0.2s ease;
}

.voice-record-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(239, 68, 68, 0.4);
}

.voice-record-btn.recording {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.voice-stop-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: #64748b;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.voice-stop-btn:hover {
  background: #475569;
  transform: scale(1.1);
}

.voice-recording-status {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
}

.voice-recording-time {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
}

.voice-upload-container {
  margin-top: 24px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.voice-upload-container:hover {
  border-color: #3b82f6;
  background: #e0ecff;
}

.voice-upload-container.dragover {
  border-color: #3b82f6;
  background: #e0ecff;
}

.voice-upload-icon {
  font-size: 48px;
  color: #64748b;
  margin-bottom: 16px;
}

.voice-upload-text {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 8px 0;
}

.voice-upload-hint {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.voice-upload-file-input {
  display: none;
}

.voice-uploaded-file {
  margin-top: 16px;
  padding: 12px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.voice-file-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.voice-file-size {
  font-size: 12px;
  color: #64748b;
}

.voice-audio-preview {
  margin-top: 24px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.voice-file-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.voice-file-icon {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.voice-file-info {
  flex: 1;
}

.voice-file-display-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
  word-break: break-all;
}

.voice-file-display-size {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.voice-audio-player {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.voice-audio-progress {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.voice-audio-progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.1s ease;
}

.voice-audio-time {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  min-width: 50px;
  text-align: right;
}

.voice-audio-play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.voice-audio-play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.voice-dropdown-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.voice-dropdown-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.voice-dropdown-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
}

.voice-dropdown {
  position: relative;
}

.voice-dropdown-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  font-size: 15px;
  color: #1e293b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.15s ease;
}

.voice-dropdown-select:hover {
  border-color: #cbd5e1;
}

.voice-dropdown-select.open {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.voice-dropdown-select-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.voice-dropdown-placeholder {
  color: #94a3b8;
}

.voice-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
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

.voice-dropdown-option {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 0.15s ease;
  border-bottom: 1px solid #f1f5f9;
}

.voice-dropdown-option:last-child {
  border-bottom: none;
}

.voice-dropdown-option:hover {
  background: #f8fafc;
}

.voice-dropdown-option.selected {
  background: #e0ecff;
  color: #3b82f6;
}

.voice-language-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 20px;
  background: #f1f5f9;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.voice-dropdown-option.selected .voice-language-badge {
  background: #3b82f6;
  color: #ffffff;
}

.consent-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
}

.consent-left, .consent-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.consent-section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.consent-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.consent-checkbox-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.consent-checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.consent-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.consent-checkbox.checked {
  background: #3b82f6;
  border-color: #3b82f6;
}

.consent-checkbox.checked svg {
  color: #ffffff;
}

.consent-text {
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
  margin: 0;
}

.consent-link {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
}

.consent-link:hover {
  color: #2563eb;
}

.script-preview-container {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  height: 100%;
}

.script-text {
  font-size: 16px;
  color: #1e293b;
  line-height: 1.8;
  margin: 0;
  white-space: pre-wrap;
}

.script-editable-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #3b82f6;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.15s ease;
}

.script-editable-name:hover {
  background: #e0ecff;
}

.script-editable-name input {
  border: none;
  background: transparent;
  color: #3b82f6;
  font-weight: 700;
  font-size: 16px;
  outline: none;
  padding: 0;
  min-width: 150px;
}

.script-passcode {
  letter-spacing: 4px;
  font-weight: 600;
  color: #64748b;
}

.start-recording-btn {
  width: 100%;
  padding: 14px 24px;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  transition: all 0.2s ease;
  margin-top: auto;
}

.start-recording-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.start-recording-btn:disabled {
  background: #e5e7eb;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

.start-recording-btn.recording {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
  animation: pulse 1.5s ease-in-out infinite;
}
`

const languages = [
  { code: 'AR', name: 'Arabic' },
  { code: 'HY', name: 'Armenian' },
  { code: 'AS', name: 'Assamese' },
  { code: 'AZ', name: 'Azerbaijani' },
  { code: 'EU', name: 'Basque' },
  { code: 'BN', name: 'Bengali' },
  { code: 'BS', name: 'Bosnian' },
  { code: 'BG', name: 'Bulgarian' },
  { code: 'MY', name: 'Burmese' },
  { code: 'CA', name: 'Catalan' },
  { code: 'ZH', name: 'Chinese (Simplified)' },
  { code: 'ZH-TW', name: 'Chinese (Traditional)' },
  { code: 'HR', name: 'Croatian' },
  { code: 'CS', name: 'Czech' },
  { code: 'DA', name: 'Danish' },
  { code: 'NL', name: 'Dutch' },
  { code: 'EN', name: 'English' },
  { code: 'ET', name: 'Estonian' },
  { code: 'FI', name: 'Finnish' },
  { code: 'FR', name: 'French' },
  { code: 'KA', name: 'Georgian' },
  { code: 'DE', name: 'German' },
  { code: 'EL', name: 'Greek' },
  { code: 'GU', name: 'Gujarati' },
  { code: 'HE', name: 'Hebrew' },
  { code: 'HI', name: 'Hindi' },
  { code: 'HU', name: 'Hungarian' },
  { code: 'IS', name: 'Icelandic' },
  { code: 'ID', name: 'Indonesian' },
  { code: 'IT', name: 'Italian' },
  { code: 'JA', name: 'Japanese' },
  { code: 'KN', name: 'Kannada' },
  { code: 'KK', name: 'Kazakh' },
  { code: 'KO', name: 'Korean' },
  { code: 'LV', name: 'Latvian' },
  { code: 'LT', name: 'Lithuanian' },
  { code: 'MK', name: 'Macedonian' },
  { code: 'MS', name: 'Malay' },
  { code: 'ML', name: 'Malayalam' },
  { code: 'MR', name: 'Marathi' },
  { code: 'NO', name: 'Norwegian' },
  { code: 'PL', name: 'Polish' },
  { code: 'PT', name: 'Portuguese' },
  { code: 'PA', name: 'Punjabi' },
  { code: 'RO', name: 'Romanian' },
  { code: 'RU', name: 'Russian' },
  { code: 'SR', name: 'Serbian' },
  { code: 'SK', name: 'Slovak' },
  { code: 'SL', name: 'Slovenian' },
  { code: 'ES', name: 'Spanish' },
  { code: 'SW', name: 'Swahili' },
  { code: 'SV', name: 'Swedish' },
  { code: 'TA', name: 'Tamil' },
  { code: 'TE', name: 'Telugu' },
  { code: 'TH', name: 'Thai' },
  { code: 'TR', name: 'Turkish' },
  { code: 'UK', name: 'Ukrainian' },
  { code: 'UR', name: 'Urdu' },
  { code: 'VI', name: 'Vietnamese' },
  { code: 'CY', name: 'Welsh' }
]

const genders = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' }
]

const scriptSpeeds = [
  { value: 'slow', label: 'Speed - Slow' },
  { value: 'medium', label: 'Speed - Medium' },
  { value: 'fast', label: 'Speed - Fast' }
]

function VoiceCreatePanel({ voice, onClose, onNext }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioFileName, setAudioFileName] = useState(null)
  const [audioFileSize, setAudioFileSize] = useState(null)
  const [selectedGender, setSelectedGender] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState(null)
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false)
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedMicrophone, setSelectedMicrophone] = useState(null)
  const [selectedScriptSpeed, setSelectedScriptSpeed] = useState(null)
  const [consentChecked, setConsentChecked] = useState(false)
  const [microphoneDropdownOpen, setMicrophoneDropdownOpen] = useState(false)
  const [speedDropdownOpen, setSpeedDropdownOpen] = useState(false)
  const [isConsentRecording, setIsConsentRecording] = useState(false)
  const [consentRecordingTime, setConsentRecordingTime] = useState(0)
  const [userName, setUserName] = useState(voice?.name || 'Michael Johnson')
  const [isEditingName, setIsEditingName] = useState(false)
  const [availableMicrophones, setAvailableMicrophones] = useState([])
  const mediaRecorderRef = useRef(null)
  const recordingIntervalRef = useRef(null)
  const fileInputRef = useRef(null)
  const audioRef = useRef(null)
  const genderDropdownRef = useRef(null)
  const languageDropdownRef = useRef(null)
  const microphoneDropdownRef = useRef(null)
  const speedDropdownRef = useRef(null)
  const consentMediaRecorderRef = useRef(null)
  const consentRecordingIntervalRef = useRef(null)
  const consentStreamRef = useRef(null)

  const steps = [
    { number: 1, label: 'Overview' },
    { number: 2, label: 'Create voice' },
    { number: 3, label: 'Consent' }
  ]

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      // Reset state when going back
      if (currentStep === 2) {
        setSelectedOption(null)
        setIsRecording(false)
        setRecordingTime(0)
        setUploadedFile(null)
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
        }
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop()
        }
      }
    }
  }

  const handleNext = () => {
    if (currentStep === 2 && !selectedOption) {
      alert('Please select an option to continue')
      return
    }
    if (currentStep === 2 && !audioUrl) {
      if (selectedOption === 'record') {
        alert('Please record your voice first')
      } else {
        alert('Please upload an audio file first')
      }
      return
    }
    if (currentStep === 2 && (!selectedGender || !selectedLanguage)) {
      alert('Please select both gender and language')
      return
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else if (onNext) {
      onNext()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setAudioFileName(`recording-${Date.now()}.webm`)
        setAudioFileSize(blob.size)
        // Create a File object for consistency
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })
        setUploadedFile(file)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check your permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg']
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid audio file (MP3, WAV, OGG, or WebM)')
        return
      }
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB')
        return
      }
      setUploadedFile(file)
      setAudioFileName(file.name)
      setAudioFileSize(file.size)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('dragover')
  }

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('dragover')
    const file = e.dataTransfer.files[0]
    if (file) {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg']
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid audio file (MP3, WAV, OGG, or WebM)')
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB')
        return
      }
      setUploadedFile(file)
      setAudioFileName(file.name)
      setAudioFileSize(file.size)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current
      const updateProgress = () => {
        if (audio.duration) {
          setAudioProgress((audio.currentTime / audio.duration) * 100)
          setCurrentTime(audio.currentTime)
          setAudioDuration(audio.duration)
        }
      }
      const handleEnded = () => {
        setIsPlaying(false)
        setAudioProgress(0)
        setCurrentTime(0)
      }
      audio.addEventListener('timeupdate', updateProgress)
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration)
      })
      audio.addEventListener('ended', handleEnded)
      return () => {
        audio.removeEventListener('timeupdate', updateProgress)
        audio.removeEventListener('loadedmetadata', () => {})
        audio.removeEventListener('ended', handleEnded)
      }
    }
  }, [audioUrl])

  // Get available microphones
  useEffect(() => {
    const getMicrophones = async () => {
      try {
        // Request permission first
        await navigator.mediaDevices.getUserMedia({ audio: true })
        const devices = await navigator.mediaDevices.enumerateDevices()
        const microphones = devices
          .filter(device => device.kind === 'audioinput')
          .map(device => ({
            value: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`
          }))
        setAvailableMicrophones(microphones)
        if (microphones.length > 0 && !selectedMicrophone) {
          setSelectedMicrophone(microphones[0])
        }
      } catch (error) {
        console.error('Error getting microphones:', error)
        // Fallback to default
        setAvailableMicrophones([{ value: 'default', label: 'Default Microphone' }])
        if (!selectedMicrophone) {
          setSelectedMicrophone({ value: 'default', label: 'Default Microphone' })
        }
      }
    }
    if (currentStep === 3) {
      getMicrophones()
    }
  }, [currentStep])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target)) {
        setGenderDropdownOpen(false)
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setLanguageDropdownOpen(false)
      }
      if (microphoneDropdownRef.current && !microphoneDropdownRef.current.contains(event.target)) {
        setMicrophoneDropdownOpen(false)
      }
      if (speedDropdownRef.current && !speedDropdownRef.current.contains(event.target)) {
        setSpeedDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup on unmount or option change
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
      if (consentRecordingIntervalRef.current) {
        clearInterval(consentRecordingIntervalRef.current)
      }
      if (consentMediaRecorderRef.current && isConsentRecording) {
        consentMediaRecorderRef.current.stop()
      }
      if (consentStreamRef.current) {
        consentStreamRef.current.getTracks().forEach(track => track.stop())
        consentStreamRef.current = null
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [selectedOption, isRecording, isConsentRecording, audioUrl])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender)
    setGenderDropdownOpen(false)
  }

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language)
    setLanguageDropdownOpen(false)
  }

  const handleMicrophoneSelect = (microphone) => {
    setSelectedMicrophone(microphone)
    setMicrophoneDropdownOpen(false)
  }

  const handleSpeedSelect = (speed) => {
    setSelectedScriptSpeed(speed)
    setSpeedDropdownOpen(false)
  }

  const startConsentRecording = async () => {
    try {
      const constraints = selectedMicrophone && selectedMicrophone.value !== 'default'
        ? { audio: { deviceId: { exact: selectedMicrophone.value } } }
        : { audio: true }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      consentStreamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      consentMediaRecorderRef.current = mediaRecorder

      const chunks = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setAudioFileName(`consent-recording-${Date.now()}.webm`)
        setAudioFileSize(blob.size)
        setIsConsentRecording(false)
        setConsentRecordingTime(0)
        if (consentRecordingIntervalRef.current) {
          clearInterval(consentRecordingIntervalRef.current)
        }
        if (consentStreamRef.current) {
          consentStreamRef.current.getTracks().forEach(track => track.stop())
          consentStreamRef.current = null
        }
        // Here you would typically upload the blob to your server
      }

      mediaRecorder.start()
      setIsConsentRecording(true)
      setConsentRecordingTime(0)

      consentRecordingIntervalRef.current = setInterval(() => {
        setConsentRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check your permissions.')
    }
  }

  const stopConsentRecording = () => {
    if (consentMediaRecorderRef.current && isConsentRecording) {
      consentMediaRecorderRef.current.stop()
      setIsConsentRecording(false)
      if (consentRecordingIntervalRef.current) {
        clearInterval(consentRecordingIntervalRef.current)
      }
      // Stop all tracks
      if (consentStreamRef.current) {
        consentStreamRef.current.getTracks().forEach(track => track.stop())
        consentStreamRef.current = null
      }
    }
  }

  const isStartRecordingEnabled = () => {
    return selectedMicrophone && selectedScriptSpeed && consentChecked
  }

  const getScriptText = () => {
    const passcode = '- - - - - - -'
    return `My name is ${userName}. This recording will be used on the Synthesia platform to create a custom voice that sounds like me. The passcode is: ${passcode}.`
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="voice-panel-section-title">
              Voice cloning <span className="highlight">overview</span>
            </h2>
            <p className="voice-panel-description">
              Watch this short video on creating a realistic voice clone.
            </p>
            <div className="voice-video-container">
              <button className="voice-video-play-btn">
                <MdPlayArrow size={32} style={{ marginLeft: '4px' }} />
              </button>
            </div>
            <div className="voice-instructions">
              <div className="voice-instruction-item">
                <MdCheckCircle className="voice-instruction-icon" />
                <p className="voice-instruction-text">
                  Be in a <strong>quiet</strong> environment
                </p>
              </div>
              <div className="voice-instruction-item">
                <MdCheckCircle className="voice-instruction-icon" />
                <p className="voice-instruction-text">
                  <strong>Pause</strong> between paragraphs and take a <strong>breath</strong>
                </p>
              </div>
              <div className="voice-instruction-item">
                <MdCheckCircle className="voice-instruction-icon" />
                <p className="voice-instruction-text">
                  Use an external <strong>high-quality</strong> mic if you have one
                </p>
              </div>
              <div className="voice-instruction-item">
                <MdCheckCircle className="voice-instruction-icon" />
                <p className="voice-instruction-text">
                  Make sure to be <strong>positive</strong> 😊
                </p>
              </div>
            </div>
          </>
        )
      case 2:
        return (
          <>
            <h2 className="voice-panel-section-title">
              Creating your <span className="highlight">voice clone</span>
            </h2>
            <p className="voice-panel-description">
              How do you want to create your voice?
            </p>
            <div className="voice-options-container">
              <div
                className={`voice-option-card ${selectedOption === 'record' ? 'selected' : ''}`}
                onClick={() => setSelectedOption('record')}
              >
                <div className="voice-option-icon">
                  <MdMic />
                </div>
                <h3 className="voice-option-title">Record your voice</h3>
                <p className="voice-option-description">
                  Record yourself reading a short script with a microphone.
                </p>
              </div>
              <div
                className={`voice-option-card ${selectedOption === 'upload' ? 'selected' : ''}`}
                onClick={() => setSelectedOption('upload')}
              >
                <div className="voice-option-icon">
                  <MdCloudUpload />
                </div>
                <h3 className="voice-option-title">Upload audio</h3>
                <p className="voice-option-description">
                  Upload between one and five minutes of your recorded audio.
                </p>
              </div>
            </div>

            {selectedOption === 'record' && (
              <>
                {!audioUrl ? (
                  <div className="voice-recording-container">
                    <div className="voice-recording-time">{formatTime(recordingTime)}</div>
                    <div className="voice-recording-status">
                      {isRecording ? 'Recording...' : recordingTime > 0 ? 'Recording stopped' : 'Ready to record'}
                    </div>
                    <div className="voice-recording-controls">
                      {!isRecording ? (
                        <button className="voice-record-btn" onClick={startRecording}>
                          <MdMic />
                        </button>
                      ) : (
                        <button className="voice-record-btn recording" onClick={stopRecording}>
                          <MdMic />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="voice-audio-preview">
                    <div className="voice-file-display">
                      <div className="voice-file-icon">WEBM</div>
                      <div className="voice-file-info">
                        <p className="voice-file-display-name">{audioFileName}</p>
                        <p className="voice-file-display-size">{formatFileSize(audioFileSize)}</p>
                      </div>
                    </div>
                    <audio ref={audioRef} src={audioUrl} />
                    <div className="voice-audio-player">
                      <div className="voice-audio-progress">
                        <div className="voice-audio-progress-bar" style={{ width: `${audioProgress}%` }} />
                      </div>
                      <div className="voice-audio-time">{formatTime(Math.floor(currentTime))}</div>
                      <button className="voice-audio-play-btn" onClick={togglePlay}>
                        {isPlaying ? <MdPause size={24} /> : <MdPlayArrow size={24} style={{ marginLeft: '4px' }} />}
                      </button>
                    </div>
                    <div className="voice-dropdown-container">
                      <div className="voice-dropdown-wrapper" ref={genderDropdownRef}>
                        <label className="voice-dropdown-label">
                          <MdPerson size={18} />
                          Gender
                        </label>
                        <div className="voice-dropdown">
                          <div
                            className={`voice-dropdown-select ${genderDropdownOpen ? 'open' : ''}`}
                            onClick={() => setGenderDropdownOpen(!genderDropdownOpen)}
                          >
                            <div className="voice-dropdown-select-content">
                              {selectedGender ? (
                                <span>{selectedGender.label}</span>
                              ) : (
                                <span className="voice-dropdown-placeholder">Choose gender</span>
                              )}
                            </div>
                            <MdKeyboardArrowDown size={20} />
                          </div>
                          {genderDropdownOpen && (
                            <div className="voice-dropdown-menu">
                              {genders.map((gender) => (
                                <div
                                  key={gender.value}
                                  className={`voice-dropdown-option ${selectedGender?.value === gender.value ? 'selected' : ''}`}
                                  onClick={() => handleGenderSelect(gender)}
                                >
                                  {gender.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="voice-dropdown-wrapper" ref={languageDropdownRef}>
                        <label className="voice-dropdown-label">
                          <MdTextFields size={18} />
                          Language
                        </label>
                        <div className="voice-dropdown">
                          <div
                            className={`voice-dropdown-select ${languageDropdownOpen ? 'open' : ''}`}
                            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                          >
                            <div className="voice-dropdown-select-content">
                              {selectedLanguage ? (
                                <>
                                  <span className="voice-language-badge">{selectedLanguage.code}</span>
                                  <span>{selectedLanguage.name}</span>
                                </>
                              ) : (
                                <span className="voice-dropdown-placeholder">Choose language</span>
                              )}
                            </div>
                            <MdKeyboardArrowDown size={20} />
                          </div>
                          {languageDropdownOpen && (
                            <div className="voice-dropdown-menu">
                              {languages.map((language) => (
                                <div
                                  key={language.code}
                                  className={`voice-dropdown-option ${selectedLanguage?.code === language.code ? 'selected' : ''}`}
                                  onClick={() => handleLanguageSelect(language)}
                                >
                                  <span className="voice-language-badge">{language.code}</span>
                                  <span>{language.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedOption === 'upload' && (
              <>
                {!audioUrl ? (
                  <div
                    className="voice-upload-container"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      className="voice-upload-file-input"
                      onChange={handleFileSelect}
                    />
                    <MdCloudUpload className="voice-upload-icon" />
                    <p className="voice-upload-text">Click to upload or drag and drop</p>
                    <p className="voice-upload-hint">Audio file (MP3, WAV, OGG, WebM) - Max 50MB</p>
                  </div>
                ) : (
                  <div className="voice-audio-preview">
                    <div className="voice-file-display">
                      <div className="voice-file-icon">
                        {audioFileName?.toUpperCase().endsWith('.MP3') ? 'MP3' : 
                         audioFileName?.toUpperCase().endsWith('.WAV') ? 'WAV' :
                         audioFileName?.toUpperCase().endsWith('.OGG') ? 'OGG' :
                         audioFileName?.toUpperCase().endsWith('.WEBM') ? 'WEBM' : 'AUDIO'}
                      </div>
                      <div className="voice-file-info">
                        <p className="voice-file-display-name">{audioFileName}</p>
                        <p className="voice-file-display-size">{formatFileSize(audioFileSize)}</p>
                      </div>
                    </div>
                    <audio ref={audioRef} src={audioUrl} />
                    <div className="voice-audio-player">
                      <div className="voice-audio-progress">
                        <div className="voice-audio-progress-bar" style={{ width: `${audioProgress}%` }} />
                      </div>
                      <div className="voice-audio-time">{formatTime(Math.floor(currentTime))}</div>
                      <button className="voice-audio-play-btn" onClick={togglePlay}>
                        {isPlaying ? <MdPause size={24} /> : <MdPlayArrow size={24} style={{ marginLeft: '4px' }} />}
                      </button>
                    </div>
                    <div className="voice-dropdown-container">
                      <div className="voice-dropdown-wrapper" ref={genderDropdownRef}>
                        <label className="voice-dropdown-label">
                          <MdPerson size={18} />
                          Gender
                        </label>
                        <div className="voice-dropdown">
                          <div
                            className={`voice-dropdown-select ${genderDropdownOpen ? 'open' : ''}`}
                            onClick={() => setGenderDropdownOpen(!genderDropdownOpen)}
                          >
                            <div className="voice-dropdown-select-content">
                              {selectedGender ? (
                                <span>{selectedGender.label}</span>
                              ) : (
                                <span className="voice-dropdown-placeholder">Choose gender</span>
                              )}
                            </div>
                            <MdKeyboardArrowDown size={20} />
                          </div>
                          {genderDropdownOpen && (
                            <div className="voice-dropdown-menu">
                              {genders.map((gender) => (
                                <div
                                  key={gender.value}
                                  className={`voice-dropdown-option ${selectedGender?.value === gender.value ? 'selected' : ''}`}
                                  onClick={() => handleGenderSelect(gender)}
                                >
                                  {gender.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="voice-dropdown-wrapper" ref={languageDropdownRef}>
                        <label className="voice-dropdown-label">
                          <MdTextFields size={18} />
                          Language
                        </label>
                        <div className="voice-dropdown">
                          <div
                            className={`voice-dropdown-select ${languageDropdownOpen ? 'open' : ''}`}
                            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                          >
                            <div className="voice-dropdown-select-content">
                              {selectedLanguage ? (
                                <>
                                  <span className="voice-language-badge">{selectedLanguage.code}</span>
                                  <span>{selectedLanguage.name}</span>
                                </>
                              ) : (
                                <span className="voice-dropdown-placeholder">Choose language</span>
                              )}
                            </div>
                            <MdKeyboardArrowDown size={20} />
                          </div>
                          {languageDropdownOpen && (
                            <div className="voice-dropdown-menu">
                              {languages.map((language) => (
                                <div
                                  key={language.code}
                                  className={`voice-dropdown-option ${selectedLanguage?.code === language.code ? 'selected' : ''}`}
                                  onClick={() => handleLanguageSelect(language)}
                                >
                                  <span className="voice-language-badge">{language.code}</span>
                                  <span>{language.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )
      case 3:
        return (
          <>
            <h2 className="voice-panel-section-title">
              Record your <span className="highlight">consent</span>
            </h2>
            <div className="consent-container">
              <div className="consent-left">
                <div className="consent-field" ref={microphoneDropdownRef}>
                  <label className="voice-dropdown-label">
                    <MdMic size={18} />
                    Microphone
                  </label>
                  <div className="voice-dropdown">
                    <div
                      className={`voice-dropdown-select ${microphoneDropdownOpen ? 'open' : ''}`}
                      onClick={() => setMicrophoneDropdownOpen(!microphoneDropdownOpen)}
                    >
                      <div className="voice-dropdown-select-content">
                        {selectedMicrophone ? (
                          <span>{selectedMicrophone.label}</span>
                        ) : (
                          <span className="voice-dropdown-placeholder">Choose microphone</span>
                        )}
                      </div>
                      <MdKeyboardArrowDown size={20} />
                    </div>
                    {microphoneDropdownOpen && (
                      <div className="voice-dropdown-menu">
                        {availableMicrophones.length > 0 ? (
                          availableMicrophones.map((mic) => (
                            <div
                              key={mic.value}
                              className={`voice-dropdown-option ${selectedMicrophone?.value === mic.value ? 'selected' : ''}`}
                              onClick={() => handleMicrophoneSelect(mic)}
                            >
                              {mic.label}
                            </div>
                          ))
                        ) : (
                          <div className="voice-dropdown-option">No microphones found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="consent-field" ref={speedDropdownRef}>
                  <label className="voice-dropdown-label">
                    <MdSpeed size={18} />
                    Script speed
                  </label>
                  <div className="voice-dropdown">
                    <div
                      className={`voice-dropdown-select ${speedDropdownOpen ? 'open' : ''}`}
                      onClick={() => setSpeedDropdownOpen(!speedDropdownOpen)}
                    >
                      <div className="voice-dropdown-select-content">
                        {selectedScriptSpeed ? (
                          <span>{selectedScriptSpeed.label}</span>
                        ) : (
                          <span className="voice-dropdown-placeholder">Choose speed</span>
                        )}
                      </div>
                      <MdKeyboardArrowDown size={20} />
                    </div>
                    {speedDropdownOpen && (
                      <div className="voice-dropdown-menu">
                        {scriptSpeeds.map((speed) => (
                          <div
                            key={speed.value}
                            className={`voice-dropdown-option ${selectedScriptSpeed?.value === speed.value ? 'selected' : ''}`}
                            onClick={() => handleSpeedSelect(speed)}
                          >
                            {speed.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="consent-checkbox-container">
                  <label className="voice-dropdown-label">Biometric consent</label>
                  <div className="consent-checkbox-wrapper">
                    <div
                      className={`consent-checkbox ${consentChecked ? 'checked' : ''}`}
                      onClick={() => setConsentChecked(!consentChecked)}
                    >
                      {consentChecked && <MdCheckCircle size={16} />}
                    </div>
                    <p className="consent-text">
                      I consent to the collection, use, and storage of my voice recording, including my likeness and biometric data (such as voiceprint), for the purposes of verifying my submission and creating my voice clone. I understand that my biometric data may be considered sensitive under applicable laws and will be processed in accordance with the{' '}
                      <span className="consent-link">Privacy Policy</span>.
                    </p>
                  </div>
                </div>

                <button
                  className={`start-recording-btn ${isConsentRecording ? 'recording' : ''}`}
                  disabled={!isStartRecordingEnabled() || isConsentRecording}
                  onClick={isConsentRecording ? stopConsentRecording : startConsentRecording}
                >
                  {isConsentRecording ? (
                    <>
                      <MdMic />
                      Recording... {formatTime(consentRecordingTime)}
                    </>
                  ) : (
                    <>
                      <MdMic />
                      Start recording
                    </>
                  )}
                </button>
              </div>

              <div className="consent-right">
                <h3 className="consent-section-title">Script preview</h3>
                <div className="script-preview-container">
                  <p className="script-text">
                    {isEditingName ? (
                      <span>
                        My name is{' '}
                        <span className="script-editable-name">
                          <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            onBlur={() => setIsEditingName(false)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setIsEditingName(false)
                              }
                            }}
                            autoFocus
                          />
                          <MdEdit size={14} />
                        </span>
                        . This recording will be used on the Synthesia platform to create a custom voice that sounds like me. The passcode is:{' '}
                        <span className="script-passcode">- - - - - - -</span>.
                      </span>
                    ) : (
                      <span>
                        My name is{' '}
                        <span className="script-editable-name" onClick={() => setIsEditingName(true)}>
                          {userName}
                          <MdEdit size={14} />
                        </span>
                        . This recording will be used on the Synthesia platform to create a custom voice that sounds like me. The passcode is:{' '}
                        <span className="script-passcode">- - - - - - -</span>.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="voice-panel-overlay" onClick={onClose}>
        <div className="voice-panel" onClick={(e) => e.stopPropagation()}>
          <div className="voice-panel-header">
            <h3 className="voice-panel-title">
              {voice ? `${voice.name}'s Voice` : 'New Voice'}
            </h3>
            <button className="voice-panel-close" onClick={onClose}>
              <MdClose size={24} />
            </button>
          </div>

          <div className="voice-panel-steps">
            {steps.map((step) => {
              const isCompleted = currentStep > step.number
              const isActive = currentStep === step.number
              return (
                <div
                  key={step.number}
                  className={`voice-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <span className="voice-step-number">
                    {isCompleted ? <MdCheckCircle size={16} /> : step.number}
                  </span>
                  <span>{step.label}</span>
                </div>
              )
            })}
            <button className="voice-panel-guidelines">
              Guidelines
              <MdOpenInNew size={16} />
            </button>
          </div>

          <div className="voice-panel-content">
            {renderStepContent()}
          </div>

          <div className="voice-panel-footer">
            {currentStep > 1 && (
              <button className="voice-panel-btn secondary" onClick={handlePrevious}>
                Previous
              </button>
            )}
            <button className="voice-panel-btn" onClick={handleNext}>
              {currentStep < steps.length ? 'Next' : 'Complete'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default VoiceCreatePanel

