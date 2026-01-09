import { useState, useRef, useEffect } from 'react'
import {
  MdAdd,
  MdPerson,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdClose,
  MdShare,
  MdContentCopy,
  MdArrowBack,
  MdArrowForward,
  MdCheckCircle,
  MdOpenInNew,
  MdUndo,
  MdRedo,
  MdPlayArrow,
  MdCloudUpload,
  MdVideocam,
  MdRefresh,
  MdInfo,
  MdDownload,
  MdSettings,
} from 'react-icons/md'

const styles = `
.avatars-container {
  padding: 28px;
  height: 100%;
  overflow-y: auto;
}

.avatars-container.full-height {
  padding: 0;
  height: 100vh;
  overflow: hidden;
}

.avatars-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.avatars-title {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.create-avatar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-avatar-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 20px;
}

.avatars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.avatar-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.avatar-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.avatar-preview {
  width: 100%;
  aspect-ratio: 1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-preview-icon {
  font-size: 48px;
  color: #cbd5e1;
}

.avatar-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.avatar-menu-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.avatar-menu-btn:hover {
  background: #ffffff;
  color: #334155;
}

.avatar-info {
  padding: 16px;
}

.avatar-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.avatar-menu {
  position: absolute;
  top: 40px;
  right: 8px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  overflow: hidden;
  z-index: 100;
}

.menu-item {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.15s ease;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.menu-item:hover {
  background: #f8fafc;
}

.menu-item.delete {
  color: #ef4444;
}

.menu-item.delete:hover {
  background: #fef2f2;
}

.menu-icon {
  font-size: 18px;
  color: #64748b;
}

.menu-item.delete .menu-icon {
  color: #ef4444;
}

/* Create Avatar Modal */
.create-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.create-modal {
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  overflow: hidden;
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

.create-modal-header {
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.create-modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-modal-close {
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

.create-modal-close:hover {
  background: #f1f5f9;
  color: #334155;
}

.create-modal-content {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

.create-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.create-option-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.create-option-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.option-image {
  width: 100%;
  height: 200px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  font-size: 48px;
}

.option-content {
  padding: 24px;
}

.option-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px;
}

.option-description {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px;
  line-height: 1.5;
}

.option-features {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
}

.option-feature {
  font-size: 13px;
  color: #475569;
  margin: 0 0 8px;
  padding-left: 20px;
  position: relative;
}

.option-feature::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #64748b;
}

.option-buttons {
  display: flex;
  gap: 8px;
}

.option-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.option-btn.primary {
  background: #3b82f6;
  color: #ffffff;
}

.option-btn.primary:hover {
  background: #2563eb;
}

.option-btn.secondary {
  background: #ffffff;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.option-btn.secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* Avatar Builder - Select Avatar */
.builder-select-container {
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.builder-select-header {
  padding: 20px 28px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 16px;
}

.builder-select-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.builder-select-content {
  display: grid;
  grid-template-columns: 320px 1fr;
  flex: 1;
  overflow: hidden;
}

.builder-sidebar {
  padding: 24px;
  border-right: 1px solid #e5e7eb;
  background: #f8fafc;
}

.builder-sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 12px;
}

.builder-sidebar-text {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px;
  line-height: 1.5;
}

.builder-avatar-select {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.builder-avatar-select:hover {
  border-color: #cbd5e1;
}

.builder-avatar-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.builder-avatar-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #e5e7eb;
}

.builder-avatar-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.builder-main {
  padding: 24px;
  overflow-y: auto;
  height: 100%;
}

.builder-main-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px;
}

.builder-main-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px;
}

.builder-avatars-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.builder-avatar-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.builder-avatar-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.builder-avatar-item-image {
  width: 100%;
  aspect-ratio: 1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.builder-avatar-item-label {
  padding: 12px;
  font-size: 13px;
  color: #334155;
  text-align: center;
}

.builder-customize-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

/* Avatar Builder - Customize */
.builder-customize-container {
  padding: 0;
  height: 100vh;
  display: flex;
  background: #ffffff;
}

.builder-customize-sidebar {
  width: 400px;
  padding: 24px;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  background: #ffffff;
  height: 100vh;
}

.builder-customize-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.builder-customize-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.builder-customize-text {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px;
  line-height: 1.5;
}

.builder-section {
  margin-bottom: 24px;
}

.builder-section-label {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 12px;
}

.builder-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.builder-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.builder-color-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.builder-color-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #e5e7eb;
  border: 1px solid #e2e8f0;
}

.builder-color-input-field {
  flex: 1;
}

.builder-color-refresh {
  padding: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
}

.builder-color-refresh:hover {
  background: #f8fafc;
  color: #334155;
}

.builder-logo-btn {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.builder-logo-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.builder-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.builder-btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.builder-btn.secondary {
  background: #ffffff;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.builder-btn.secondary:hover {
  background: #f8fafc;
}

.builder-btn.primary {
  background: #3b82f6;
  color: #ffffff;
}

.builder-btn.primary:hover {
  background: #2563eb;
}

.builder-preview {
  flex: 1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.builder-preview-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
}

.builder-preview-avatar {
  width: 400px;
  height: 500px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  font-size: 64px;
}

/* Personal Avatar Flow */
.personal-avatar-container {
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.personal-avatar-header {
  padding: 20px 28px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.personal-avatar-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.personal-avatar-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.personal-avatar-steps {
  display: flex;
  align-items: center;
  gap: 12px;
}

.personal-avatar-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  padding: 8px 12px;
  border-radius: 6px;
}

.personal-avatar-step.active {
  color: #3b82f6;
  background: #e0ecff;
}

.personal-avatar-step.completed {
  color: #64748b;
}

.personal-avatar-guidelines-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.personal-avatar-guidelines-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.personal-avatar-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.personal-avatar-title {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.personal-avatar-title .highlight {
  color: #3b82f6;
}

.personal-avatar-video {
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16/9;
  background: #000000;
  border-radius: 12px;
  margin: 24px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 48px;
}

.personal-avatar-guidelines-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 20px;
  margin: 24px 0;
  max-width: 800px;
}

.personal-avatar-guideline-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #1e40af;
}

.personal-avatar-guideline-item:last-child {
  margin-bottom: 0;
}

.personal-avatar-guideline-icon {
  color: #3b82f6;
  flex-shrink: 0;
  margin-top: 2px;
}

.personal-avatar-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 32px 0;
}

.personal-avatar-option-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.personal-avatar-option-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.personal-avatar-option-image {
  width: 100%;
  height: 200px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  font-size: 48px;
}

.personal-avatar-option-content {
  padding: 24px;
}

.personal-avatar-option-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px;
}

.personal-avatar-option-description {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px;
  line-height: 1.5;
}

.personal-avatar-option-btn {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.personal-avatar-option-btn:hover {
  background: #2563eb;
}

.personal-avatar-footer {
  padding: 20px 28px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.personal-avatar-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.personal-avatar-btn.secondary {
  background: transparent;
  color: #64748b;
}

.personal-avatar-btn.secondary:hover {
  color: #334155;
}

.personal-avatar-btn.primary {
  background: #3b82f6;
  color: #ffffff;
}

.personal-avatar-btn.primary:hover {
  background: #2563eb;
}

/* Studio Avatar */
.studio-avatar-container {
  padding: 32px;
  height: 100vh;
  overflow-y: auto;
  max-width: 1000px;
  margin: 0 auto;
  background: #ffffff;
}

.studio-avatar-title {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 32px;
}

.studio-avatar-section {
  margin-bottom: 40px;
}

.studio-avatar-section-title {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 12px;
}

.studio-avatar-section-text {
  font-size: 15px;
  color: #475569;
  margin: 0 0 20px;
  line-height: 1.6;
}

.studio-avatar-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.studio-avatar-download-btn:hover {
  background: #2563eb;
}

.studio-avatar-video {
  width: 100%;
  max-width: 600px;
  aspect-ratio: 16/9;
  background: #1e40af;
  border-radius: 8px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 48px;
  position: relative;
}

.studio-avatar-logo {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.studio-avatar-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #334155;
}

.studio-avatar-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
}

.studio-avatar-checkbox-label {
  flex: 1;
  line-height: 1.5;
}

.studio-avatar-upload-box {
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.studio-avatar-upload-box:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.studio-avatar-upload-btn {
  padding: 8px 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.studio-avatar-upload-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.studio-avatar-upload-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.studio-avatar-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.studio-avatar-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.studio-avatar-input-label {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px;
  display: block;
}

.studio-avatar-input-label .required {
  color: #ef4444;
}

.studio-avatar-framing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin: 24px 0;
}

.studio-avatar-framing-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.studio-avatar-framing-card:hover {
  border-color: #cbd5e1;
}

.studio-avatar-framing-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.studio-avatar-framing-image {
  width: 100%;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.studio-avatar-framing-label {
  padding: 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  background: #ffffff;
}

.studio-avatar-link {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
}

.studio-avatar-link:hover {
  color: #2563eb;
}

.studio-avatar-scripts {
  display: flex;
  gap: 12px;
  margin: 20px 0;
}

.studio-avatar-submit-btn {
  width: 100%;
  padding: 14px 24px;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 24px;
}

.studio-avatar-submit-btn:hover {
  background: #2563eb;
}

.studio-avatar-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.studio-avatar-nav-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.studio-avatar-nav-btn.secondary {
  background: transparent;
  color: #64748b;
}

.studio-avatar-nav-btn.secondary:hover {
  color: #334155;
}

.studio-avatar-nav-btn.primary {
  background: #3b82f6;
  color: #ffffff;
}

.studio-avatar-nav-btn.primary:hover {
  background: #2563eb;
}
`

const synthesiaAvatars = [
  { id: 1, name: 'Alex - Black dress', customizable: false },
  { id: 2, name: 'Alex - Red shirt', customizable: true },
  { id: 3, name: 'Alex - Red shirt', customizable: false },
  { id: 4, name: 'Anton - Blue jumper', customizable: false },
  { id: 5, name: 'Axel - Grey jumper', customizable: false },
  { id: 6, name: 'Carla - Orange top', customizable: false },
  { id: 7, name: 'Francesca - White T-shirt', customizable: true },
  { id: 8, name: 'Francesca - White T-shirt', customizable: false },
  { id: 9, name: 'Person 1', customizable: false },
  { id: 10, name: 'Person 2', customizable: false },
  { id: 11, name: 'Person 3', customizable: false },
  { id: 12, name: 'Person 4', customizable: true },
]

function Avatars() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentView, setCurrentView] = useState('main') // main, builder-select, builder-customize, personal-overview, personal-create, studio
  const [selectedBuilderAvatar, setSelectedBuilderAvatar] = useState(null)
  const [personalStep, setPersonalStep] = useState(1) // 1: overview, 2: create
  const [studioStep, setStudioStep] = useState(1) // 1: overview, 2: hands, 3: requirements, 4: upload+consent, 5: details, 6: framing, 7: submit
  const [studioCheckboxes, setStudioCheckboxes] = useState({
    recorded4k: false,
    fileSize: false,
    fileLength: false,
    goodLighting: false,
    noNoise: false,
    correctEmotions: false,
    directCamera: false,
    handsBelow: false,
    followedConsent: false,
    nativeLanguage: false,
  })
  const [studioRecordings, setStudioRecordings] = useState([null, null, null])
  const [studioConsentRecording, setStudioConsentRecording] = useState(null)
  const [studioAvatarName, setStudioAvatarName] = useState('')
  const [studioFraming, setStudioFraming] = useState(null) // 'chest' or 'midtorso'
  const [openMenuId, setOpenMenuId] = useState(null)
  const [editingAvatarId, setEditingAvatarId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [lookName, setLookName] = useState('')
  const [dressColor, setDressColor] = useState('#000000')
  const menuRefs = useRef({})

  const [myAvatars, setMyAvatars] = useState([
    {
      id: 1,
      name: 'Paulmichael Rowland',
      type: 'Personal Avatar',
      created: '2 days ago',
    },
  ])

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(menuRefs.current).forEach((avatarId) => {
        if (menuRefs.current[avatarId] && !menuRefs.current[avatarId].contains(event.target)) {
          setOpenMenuId(null)
        }
      })
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCreateOption = (option) => {
    setShowCreateModal(false)
    if (option === 'builder') {
      setCurrentView('builder-select')
    } else if (option === 'personal') {
      setCurrentView('personal-overview')
      setPersonalStep(1)
    } else if (option === 'studio') {
      setCurrentView('studio')
      setStudioStep(1)
    }
  }

  const handleStudioNext = () => {
    if (studioStep < 7) {
      setStudioStep(studioStep + 1)
    }
  }

  const handleStudioPrevious = () => {
    if (studioStep > 1) {
      setStudioStep(studioStep - 1)
    }
  }

  const handleStudioCheckbox = (key) => {
    setStudioCheckboxes(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleStudioRecordingUpload = (index, file) => {
    const newRecordings = [...studioRecordings]
    newRecordings[index] = file
    setStudioRecordings(newRecordings)
  }

  const handleSelectBuilderAvatar = (avatar) => {
    setSelectedBuilderAvatar(avatar)
    setCurrentView('builder-customize')
  }

  const handlePersonalNext = () => {
    if (personalStep === 1) {
      setPersonalStep(2)
      setCurrentView('personal-create')
    }
  }

  const handlePersonalPrevious = () => {
    if (personalStep === 2) {
      setPersonalStep(1)
      setCurrentView('personal-overview')
    }
  }

  const handleBack = () => {
    if (currentView === 'builder-customize') {
      setCurrentView('builder-select')
    } else if (currentView === 'builder-select') {
      setCurrentView('main')
    } else if (currentView === 'personal-overview' || currentView === 'personal-create') {
      setCurrentView('main')
    } else if (currentView === 'studio') {
      if (studioStep === 1) {
        setCurrentView('main')
      } else {
        handleStudioPrevious()
      }
    }
  }

  const toggleMenu = (e, avatarId) => {
    e.stopPropagation()
    setOpenMenuId(openMenuId === avatarId ? null : avatarId)
  }

  const handleRename = (e, avatar) => {
    e.stopPropagation()
    setOpenMenuId(null)
    setEditingAvatarId(avatar.id)
    setEditingName(avatar.name)
  }

  const handleDelete = (e, avatar) => {
    e.stopPropagation()
    setOpenMenuId(null)
    if (window.confirm(`Are you sure you want to delete "${avatar.name}"?`)) {
      setMyAvatars(myAvatars.filter(a => a.id !== avatar.id))
    }
  }

  const handleNameSave = (avatarId) => {
    setMyAvatars(myAvatars.map(a => 
      a.id === avatarId ? { ...a, name: editingName } : a
    ))
    setEditingAvatarId(null)
    setEditingName('')
  }

  const renderMainView = () => (
    <>
      <div className="avatars-header">
        <h1 className="avatars-title">Avatars</h1>
        <button 
          className="create-avatar-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <MdAdd size={18} /> Create Avatar
        </button>
      </div>

      <div className="my-avatars-section">
        <h2 className="section-title">My Avatars</h2>
        <div className="avatars-grid">
          {myAvatars.map((avatar) => (
            <div key={avatar.id} className="avatar-card" ref={el => menuRefs.current[avatar.id] = el}>
              <div className="avatar-preview">
                <div className="avatar-preview-icon">
                  <MdPerson />
                </div>
                <div className="avatar-actions">
                  <button 
                    className="avatar-menu-btn"
                    onClick={(e) => toggleMenu(e, avatar.id)}
                  >
                    <MdMoreVert size={20} />
                  </button>
                  {openMenuId === avatar.id && (
                    <div className="avatar-menu">
                      <button className="menu-item" onClick={(e) => e.stopPropagation()}>
                        <MdShare className="menu-icon" />
                        Share
                      </button>
                      <button className="menu-item" onClick={(e) => e.stopPropagation()}>
                        <MdContentCopy className="menu-icon" />
                        Copy ID
                      </button>
                      <button className="menu-item" onClick={(e) => handleRename(e, avatar)}>
                        <MdEdit className="menu-icon" />
                        Rename
                      </button>
                      <button className="menu-item delete" onClick={(e) => handleDelete(e, avatar)}>
                        <MdDelete className="menu-icon" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="avatar-info">
                {editingAvatarId === avatar.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleNameSave(avatar.id)
                        else if (e.key === 'Escape') {
                          setEditingAvatarId(null)
                          setEditingName('')
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        border: '2px solid #3b82f6',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        outline: 'none',
                        flex: 1
                      }}
                      autoFocus
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNameSave(avatar.id)
                      }}
                      style={{
                        padding: '4px 12px',
                        background: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <h3 className="avatar-name">{avatar.name}</h3>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  const renderBuilderSelect = () => (
    <div className="builder-select-container">
      <div className="builder-select-header">
        <button className="back-btn" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '8px', cursor: 'pointer' }}>
          <MdArrowBack size={18} />
        </button>
        <h1 className="builder-select-title">Avatar Builder</h1>
      </div>
      <div className="builder-select-content">
        <div className="builder-sidebar">
          <h2 className="builder-sidebar-title">Avatar Builder</h2>
          <p className="builder-sidebar-text">Customize an Avatar by recoloring clothes and adding logos.</p>
          <div className="builder-section">
            <div className="builder-section-label">Avatar</div>
            <div className="builder-avatar-select">
              <div className="builder-avatar-preview">
                <div className="builder-avatar-thumb"></div>
                <span className="builder-avatar-name">Select Avatar</span>
              </div>
              <MdArrowForward size={20} color="#64748b" />
            </div>
          </div>
        </div>
        <div className="builder-main">
          <h2 className="builder-main-title">Select Avatar</h2>
          <p className="builder-main-subtitle">Synthesia Avatars</p>
          <div className="builder-avatars-grid">
            {synthesiaAvatars.map((avatar) => (
              <div 
                key={avatar.id} 
                className="builder-avatar-item"
                onClick={() => handleSelectBuilderAvatar(avatar)}
              >
                <div className="builder-avatar-item-image">
                  <MdPerson size={48} color="#cbd5e1" />
                  {avatar.customizable && (
                    <div className="builder-customize-badge">⭐</div>
                  )}
                </div>
                <div className="builder-avatar-item-label">{avatar.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderBuilderCustomize = () => (
    <div className="builder-customize-container">
      <div className="builder-customize-sidebar">
        <div className="builder-customize-header">
          <button className="back-btn" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <MdArrowBack size={20} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
            <MdUndo size={20} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
            <MdRedo size={20} />
          </button>
        </div>
        <h1 className="builder-customize-title">Avatar Builder</h1>
        <p className="builder-customize-text">Customize an Avatar by recoloring clothes and adding logos.</p>
        
        <div className="builder-section">
          <div className="builder-section-label">Avatar</div>
          <div className="builder-avatar-select">
            <div className="builder-avatar-preview">
              <div className="builder-avatar-thumb"></div>
              <span className="builder-avatar-name">{selectedBuilderAvatar?.name || 'Alex'}</span>
            </div>
            <MdArrowForward size={20} color="#64748b" />
          </div>
        </div>

        <div className="builder-section">
          <div className="builder-section-label">Look name</div>
          <input
            type="text"
            className="builder-input"
            placeholder="Give your look a name..."
            value={lookName}
            onChange={(e) => setLookName(e.target.value)}
          />
        </div>

        <div className="builder-section">
          <div className="builder-section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Dress color</span>
            <button className="builder-color-refresh">
              <MdRefresh size={18} />
            </button>
          </div>
          <div className="builder-color-input">
            <div className="builder-color-preview" style={{ background: dressColor }}></div>
            <input
              type="text"
              className="builder-input builder-color-input-field"
              placeholder="Pick a color"
              value={dressColor}
              onChange={(e) => setDressColor(e.target.value)}
            />
          </div>
        </div>

        <div className="builder-section">
          <div className="builder-section-label">Logos</div>
          <button className="builder-logo-btn">
            <MdAdd size={18} />
            Add logo
          </button>
        </div>

        <div className="builder-actions">
          <button className="builder-btn secondary">
            <MdPlayArrow size={18} style={{ marginRight: '8px' }} />
            Preview
          </button>
          <button className="builder-btn primary">Generate Avatar</button>
        </div>
      </div>
      <div className="builder-preview">
        <div className="builder-preview-grid"></div>
        <div className="builder-preview-avatar">
          <MdPerson size={64} />
        </div>
      </div>
    </div>
  )

  const renderPersonalOverview = () => (
    <div className="personal-avatar-container">
      <div className="personal-avatar-header">
        <div className="personal-avatar-header-left">
          <button className="back-btn" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <MdArrowBack size={20} />
          </button>
          <div className="personal-avatar-name">
            <span>Paulmichael Rowland</span>
            <MdEdit size={16} color="#64748b" style={{ cursor: 'pointer' }} />
          </div>
        </div>
        <div className="personal-avatar-steps">
          <div className={`personal-avatar-step ${personalStep === 1 ? 'active' : 'completed'}`}>
            {personalStep > 1 ? <MdCheckCircle size={16} /> : '1'}
            <span>Overview</span>
          </div>
          <div className={`personal-avatar-step ${personalStep === 2 ? 'active' : ''}`}>
            2
            <span>Create Avatar</span>
          </div>
          <div className="personal-avatar-step">
            3
            <span>Consent</span>
          </div>
          <button className="personal-avatar-guidelines-btn">
            Guidelines
            <MdOpenInNew size={16} />
          </button>
        </div>
      </div>
      <div className="personal-avatar-content">
        <h1 className="personal-avatar-title">
          Personal Avatar <span className="highlight">overview</span>
        </h1>
        <div className="personal-avatar-video">
          <MdPlayArrow size={48} />
        </div>
        <div className="personal-avatar-guidelines-box">
          <div className="personal-avatar-guideline-item">
            <MdCheckCircle className="personal-avatar-guideline-icon" size={20} />
            <span>Use a quiet and well-lit environment</span>
          </div>
          <div className="personal-avatar-guideline-item">
            <MdCheckCircle className="personal-avatar-guideline-icon" size={20} />
            <span>Pause between paragraphs and take a breath</span>
          </div>
          <div className="personal-avatar-guideline-item">
            <MdCheckCircle className="personal-avatar-guideline-icon" size={20} />
            <span>Use natural body language, but <strong>don't cover your face</strong></span>
          </div>
          <div className="personal-avatar-guideline-item">
            <MdCheckCircle className="personal-avatar-guideline-icon" size={20} />
            <span>Make sure to <strong>smile</strong> and be positive 😊</span>
          </div>
        </div>
      </div>
      <div className="personal-avatar-footer">
        <button className="personal-avatar-btn primary" onClick={handlePersonalNext}>
          Next
        </button>
      </div>
    </div>
  )

  const renderPersonalCreate = () => (
    <div className="personal-avatar-container">
      <div className="personal-avatar-header">
        <div className="personal-avatar-header-left">
          <button className="back-btn" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <MdArrowBack size={20} />
          </button>
          <div className="personal-avatar-name">
            <span>Paulmichael Rowland</span>
            <MdEdit size={16} color="#64748b" style={{ cursor: 'pointer' }} />
          </div>
        </div>
        <div className="personal-avatar-steps">
          <div className="personal-avatar-step completed">
            <MdCheckCircle size={16} />
            <span>Overview</span>
          </div>
          <div className="personal-avatar-step active">
            2
            <span>Create Avatar</span>
          </div>
          <div className="personal-avatar-step">
            3
            <span>Consent</span>
          </div>
          <button className="personal-avatar-guidelines-btn">
            Guidelines
            <MdOpenInNew size={16} />
          </button>
        </div>
      </div>
      <div className="personal-avatar-content">
        <h1 className="personal-avatar-title">
          Creating your <span className="highlight">Avatar</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#64748b', margin: '0 0 32px' }}>
          How do you want to create your Avatar?
        </p>
        <div className="personal-avatar-options">
          <div className="personal-avatar-option-card">
            <div className="personal-avatar-option-image">
              <MdVideocam size={48} />
            </div>
            <div className="personal-avatar-option-content">
              <h3 className="personal-avatar-option-title">Use your webcam</h3>
              <p className="personal-avatar-option-description">
                Record yourself reading a short script with your webcam.
              </p>
              <button className="personal-avatar-option-btn">Record yourself</button>
            </div>
          </div>
          <div className="personal-avatar-option-card">
            <div className="personal-avatar-option-image">
              <MdCloudUpload size={48} />
            </div>
            <div className="personal-avatar-option-content">
              <h3 className="personal-avatar-option-title">Upload footage</h3>
              <p className="personal-avatar-option-description">
                Upload between 1 and 5 minutes of video recorded with a camera or smartphone.
              </p>
              <button className="personal-avatar-option-btn">Upload</button>
            </div>
          </div>
        </div>
      </div>
      <div className="personal-avatar-footer">
        <button className="personal-avatar-btn secondary" onClick={handlePersonalPrevious}>
          Previous
        </button>
      </div>
    </div>
  )

  const renderStudio = () => {
    const renderStudioStep = () => {
      switch (studioStep) {
        case 1:
          return (
            <>
              <h1 className="studio-avatar-title">Creating your Studio Avatar</h1>
              <div className="studio-avatar-section">
                <h2 className="studio-avatar-section-title">Overview</h2>
                <p className="studio-avatar-section-text">
                  Creating your Avatar requires three recordings of your actor or client speaking straight to the camera for 2-3 minutes. Whether you are working with a videographer, studio, or you are filming independently, make sure to share and follow these instructions.
                </p>
                <button className="studio-avatar-download-btn">
                  <MdDownload size={18} />
                  Download instructions
                </button>
              </div>
              <div className="studio-avatar-section">
                <h2 className="studio-avatar-section-title">Performance requirements</h2>
                <div className="studio-avatar-video">
                  <div className="studio-avatar-logo"></div>
                  <MdPlayArrow size={48} />
                </div>
              </div>
              <div className="studio-avatar-footer">
                <div></div>
                <button className="studio-avatar-nav-btn primary" onClick={handleStudioNext}>
                  Next
                </button>
              </div>
            </>
          )
        case 2:
          return (
            <>
              <h1 className="studio-avatar-title">Creating your Studio Avatar</h1>
              <div className="studio-avatar-section">
                <h2 className="studio-avatar-section-title">What to do with your hands</h2>
                <div className="studio-avatar-video" style={{ marginBottom: '24px' }}>
                  <div className="studio-avatar-logo"></div>
                  <MdPlayArrow size={48} />
                </div>
              </div>
              <div className="studio-avatar-section">
                <h2 className="studio-avatar-section-title">Scripts</h2>
                <p className="studio-avatar-section-text">
                  To create a great Express-1 Avatar, it's important to follow our scripts.
                </p>
                <div className="studio-avatar-scripts">
                  <button className="studio-avatar-download-btn">
                    <MdDownload size={18} />
                    Performance script
                  </button>
                  <button className="studio-avatar-download-btn">
                    <MdDownload size={18} />
                    Consent script
                  </button>
                </div>
              </div>
              <div className="studio-avatar-section">
                <h2 className="studio-avatar-section-title">Additional help</h2>
                <p className="studio-avatar-section-text">
                  Please view our extensive <a href="#" className="studio-avatar-link">Knowledge Base</a>. Please also feel free to reach out to your customer success rep or our helpful customer support team.
                </p>
              </div>
              <div className="studio-avatar-footer">
                <button className="studio-avatar-nav-btn secondary" onClick={handleStudioPrevious}>
                  Previous
                </button>
                <button className="studio-avatar-nav-btn primary" onClick={handleStudioNext}>
                  Next
                </button>
              </div>
            </>
          )
        case 3:
          return (
            <>
              <h1 className="studio-avatar-title">Creating your Studio Avatar</h1>
              <div className="studio-avatar-section">
                <h2 className="studio-avatar-section-title">Submitting your footage</h2>
                <p className="studio-avatar-section-text">
                  Provide 3 recordings of the performance script. Before uploading, make sure you followed the instructions from the document above.
                </p>
                <div style={{ marginTop: '20px' }}>
                  <div className="studio-avatar-checkbox">
                    <input
                      type="checkbox"
                      checked={studioCheckboxes.recorded4k}
                      onChange={() => handleStudioCheckbox('recorded4k')}
                    />
                    <label className="studio-avatar-checkbox-label">
                      Recorded in Ultra-High Definition (4K) at 30 frames per second
                    </label>
                  </div>
                  <div className="studio-avatar-checkbox">
                    <input
                      type="checkbox"
                      checked={studioCheckboxes.fileSize}
                      onChange={() => handleStudioCheckbox('fileSize')}
                    />
                    <label className="studio-avatar-checkbox-label">
                      Each individual file is less than 2GB
                    </label>
                  </div>
                  <div className="studio-avatar-checkbox">
                    <input
                      type="checkbox"
                      checked={studioCheckboxes.fileLength}
                      onChange={() => handleStudioCheckbox('fileLength')}
                    />
                    <label className="studio-avatar-checkbox-label">
                      Each individual file is over a minute long
                    </label>
                  </div>
                  <div className="studio-avatar-checkbox">
                    <input
                      type="checkbox"
                      checked={studioCheckboxes.goodLighting}
                      onChange={() => handleStudioCheckbox('goodLighting')}
                    />
                    <label className="studio-avatar-checkbox-label">
                      Recorded a video with good lighting and crisp image
                    </label>
                  </div>
                  <div className="studio-avatar-checkbox">
                    <input
                      type="checkbox"
                      checked={studioCheckboxes.noNoise}
                      onChange={() => handleStudioCheckbox('noNoise')}
                    />
                    <label className="studio-avatar-checkbox-label">
                      Recorded with no background noise and the actor clearly audible
                    </label>
                  </div>
                  <div className="studio-avatar-checkbox">
                    <input
                      type="checkbox"
                      checked={studioCheckboxes.correctEmotions}
                      onChange={() => handleStudioCheckbox('correctEmotions')}
                    />
                    <label className="studio-avatar-checkbox-label">
                      Performed the correct emotions during the appropriate part of the script
                    </label>
                  </div>
                  <div className="studio-avatar-checkbox">
                    <input
                      type="checkbox"
                      checked={studioCheckboxes.directCamera}
                      onChange={() => handleStudioCheckbox('directCamera')}
                    />
                    <label className="studio-avatar-checkbox-label">
                      Looked directly at the camera at all times
                    </label>
                  </div>
                  <div className="studio-avatar-checkbox">
                    <input
                      type="checkbox"
                      checked={studioCheckboxes.handsBelow}
                      onChange={() => handleStudioCheckbox('handsBelow')}
                    />
                    <label className="studio-avatar-checkbox-label">
                      Kept hands below the belly button at all times
                    </label>
                  </div>
                </div>
              </div>
              <div className="studio-avatar-footer">
                <button className="studio-avatar-nav-btn secondary" onClick={handleStudioPrevious}>
                  Previous
                </button>
                <button className="studio-avatar-nav-btn primary" onClick={handleStudioNext}>
                  Next
                </button>
              </div>
            </>
          )
        case 4:
          return (
            <>
              <h1 className="studio-avatar-title">Creating your Studio Avatar</h1>
              <div className="studio-avatar-section">
                <h2 className="studio-avatar-section-title">Upload</h2>
                {[1, 2, 3].map((num) => (
                  <div key={num} className="studio-avatar-upload-box">
                    <span className="studio-avatar-upload-label">Recording {num}</span>
                    <button className="studio-avatar-upload-btn">
                      Upload
                    </button>
                  </div>
                ))}
              </div>
              <div className="studio-avatar-section">
                <h2 className="studio-avatar-section-title">Consent</h2>
                <p className="studio-avatar-section-text">
                  We need proof of consent for us to use a recording to create an Avatar. Record and upload a video of your actor reading the consent script in their native language. Check that you:
                </p>
                <div style={{ marginTop: '16px' }}>
                  <div className="studio-avatar-checkbox">
                    <input
                      type="checkbox"
                      checked={studioCheckboxes.followedConsent}
                      onChange={() => handleStudioCheckbox('followedConsent')}
                    />
                    <label className="studio-avatar-checkbox-label">
                      Followed the consent script
                    </label>
                  </div>
                  <div className="studio-avatar-checkbox">
                    <input
                      type="checkbox"
                      checked={studioCheckboxes.nativeLanguage}
                      onChange={() => handleStudioCheckbox('nativeLanguage')}
                    />
                    <label className="studio-avatar-checkbox-label">
                      Used the actor native's language
                    </label>
                  </div>
                </div>
                <div className="studio-avatar-upload-box" style={{ marginTop: '20px' }}>
                  <span className="studio-avatar-upload-label">Consent recording</span>
                  <button className="studio-avatar-upload-btn">
                    Upload
                  </button>
                </div>
              </div>
              <div className="studio-avatar-footer">
                <button className="studio-avatar-nav-btn secondary" onClick={handleStudioPrevious}>
                  Previous
                </button>
                <button className="studio-avatar-nav-btn primary" onClick={handleStudioNext}>
                  Next
                </button>
              </div>
            </>
          )
        case 5:
          return (
            <>
              <h1 className="studio-avatar-title">Creating your Studio Avatar</h1>
              <div className="studio-avatar-section">
                <h2 className="studio-avatar-section-title">Avatar details</h2>
                <p className="studio-avatar-section-text">
                  Give your Avatar a name and select the framing.
                </p>
                <label className="studio-avatar-input-label">
                  Avatar name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="studio-avatar-input"
                  placeholder="Choose a name"
                  value={studioAvatarName}
                  onChange={(e) => setStudioAvatarName(e.target.value)}
                />
                <label className="studio-avatar-input-label" style={{ marginTop: '20px' }}>
                  Avatar framing
                </label>
                <p className="studio-avatar-section-text" style={{ marginTop: '8px', marginBottom: '16px' }}>
                  To reframe your video and deliver your preferred framing we need a 4K recording.
                </p>
              </div>
              <div className="studio-avatar-footer">
                <button className="studio-avatar-nav-btn secondary" onClick={handleStudioPrevious}>
                  Previous
                </button>
                <button className="studio-avatar-nav-btn primary" onClick={handleStudioNext}>
                  Next
                </button>
              </div>
            </>
          )
        case 6:
          return (
            <>
              <h1 className="studio-avatar-title">Creating your Studio Avatar</h1>
              <div className="studio-avatar-section">
                <h2 className="studio-avatar-section-title">Avatar framing</h2>
                <p className="studio-avatar-section-text">
                  To reframe your video and deliver your preferred framing we need a 4K recording.
                </p>
                <div className="studio-avatar-framing-grid">
                  <div
                    className={`studio-avatar-framing-card ${studioFraming === 'chest' ? 'selected' : ''}`}
                    onClick={() => setStudioFraming('chest')}
                  >
                    <div className="studio-avatar-framing-image">
                      <MdPerson size={64} color="#ffffff" />
                    </div>
                    <div className="studio-avatar-framing-label">Chest up</div>
                  </div>
                  <div
                    className={`studio-avatar-framing-card ${studioFraming === 'midtorso' ? 'selected' : ''}`}
                    onClick={() => setStudioFraming('midtorso')}
                  >
                    <div className="studio-avatar-framing-image">
                      <MdPerson size={64} color="#ffffff" />
                    </div>
                    <div className="studio-avatar-framing-label">Mid torso up</div>
                  </div>
                </div>
              </div>
              <div className="studio-avatar-footer">
                <button className="studio-avatar-nav-btn secondary" onClick={handleStudioPrevious}>
                  Previous
                </button>
                <button className="studio-avatar-nav-btn primary" onClick={handleStudioNext}>
                  Next
                </button>
              </div>
            </>
          )
        case 7:
          return (
            <>
              <h1 className="studio-avatar-title">Creating your Studio Avatar</h1>
              <div className="studio-avatar-section">
                <h2 className="studio-avatar-section-title">Submit</h2>
                <p className="studio-avatar-section-text">
                  Once you submit your data, we will review your recordings and process your avatar within 10 working days. Should there be any issue with your recording we will contact you and let you know.
                </p>
                <button className="studio-avatar-submit-btn">
                  Submit for generation
                </button>
              </div>
              <div className="studio-avatar-footer">
                <button className="studio-avatar-nav-btn secondary" onClick={handleStudioPrevious}>
                  Previous
                </button>
              </div>
            </>
          )
        default:
          return null
      }
    }

    return (
      <div className="studio-avatar-container">
        <button className="back-btn" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}>
          <MdArrowBack size={18} />
        </button>
        {renderStudioStep()}
      </div>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className={`avatars-container ${currentView !== 'main' ? 'full-height' : ''}`}>
        {currentView === 'main' && renderMainView()}
        {currentView === 'builder-select' && renderBuilderSelect()}
        {currentView === 'builder-customize' && renderBuilderCustomize()}
        {(currentView === 'personal-overview' || currentView === 'personal-create') && personalStep === 1 && renderPersonalOverview()}
        {currentView === 'personal-create' && personalStep === 2 && renderPersonalCreate()}
        {currentView === 'studio' && renderStudio()}
      </div>

      {showCreateModal && (
        <div className="create-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="create-modal-header">
              <h2 className="create-modal-title">
                Create Avatar
                <a href="#" style={{ fontSize: '14px', color: '#3b82f6', textDecoration: 'none', marginLeft: '8px' }}>
                  Learn more <MdOpenInNew size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </a>
              </h2>
              <button 
                className="create-modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                <MdClose size={24} />
              </button>
            </div>
            <div className="create-modal-content">
              <div className="create-options-grid">
                <div className="create-option-card">
                  <div className="option-image">
                    <MdPerson size={48} />
                  </div>
                  <div className="option-content">
                    <h3 className="option-title">Avatar Builder</h3>
                    <p className="option-description">Add your logo and colors</p>
                    <ul className="option-features">
                      <li className="option-feature">Duplicate and edit existing Avatars</li>
                      <li className="option-feature">Change color of clothing</li>
                      <li className="option-feature">Upload your own logos</li>
                    </ul>
                    <div className="option-buttons">
                      <button className="option-btn primary" onClick={() => handleCreateOption('builder')}>
                        Customize
                      </button>
                    </div>
                  </div>
                </div>

                <div className="create-option-card">
                  <div className="option-image">
                    <MdVideocam size={48} />
                  </div>
                  <div className="option-content">
                    <h3 className="option-title">Personal Avatar</h3>
                    <p className="option-description">Record yourself in minutes</p>
                    <ul className="option-features">
                      <li className="option-feature">Use your webcam</li>
                      <li className="option-feature">Clone your voice</li>
                      <li className="option-feature">Available to use next day</li>
                    </ul>
                    <div className="option-buttons">
                      <button className="option-btn primary" onClick={() => handleCreateOption('personal')}>
                        Create
                      </button>
                      <button className="option-btn secondary">
                        Request
                      </button>
                    </div>
                  </div>
                </div>

                <div className="create-option-card">
                  <div className="option-image">
                    <MdCloudUpload size={48} />
                  </div>
                  <div className="option-content">
                    <h3 className="option-title">Studio Avatar</h3>
                    <p className="option-description">Use your own green screen footage</p>
                    <ul className="option-features">
                      <li className="option-feature">Our most expressive Avatars</li>
                      <li className="option-feature">Chest up or mid torso framing</li>
                      <li className="option-feature">Takes up to 10 days to process</li>
                    </ul>
                    <div className="option-buttons">
                      <button className="option-btn primary" onClick={() => handleCreateOption('studio')}>
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Avatars
