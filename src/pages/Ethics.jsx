import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import EthicsBg from '../assets/EthicsBg.png'

import { motion, useScroll, useSpring } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  Lock,
  Scale,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Check,
  Brain,
  Layers,
  Target,
  UserCheck,
  Activity,
  ShieldAlert,
  Tag,
  AlertCircle
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const styles = `
.ethics-page {
  min-height: 100vh;
  position: relative;
  background: #ffffff;
  color: #1e293b;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

/* Progress Bar */
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #1e40af;
  transform-origin: 0%;
  z-index: 1001;
}



/* Section Components */
.ethics-content {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 80px 40px;
}

.ethics-hero {
  position: relative;
  min-height: 100vh;
  padding: 180px 80px 120px;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-bottom: 1px solid rgba(30, 64, 175, 0.05);
  overflow: hidden;
}

.ethics-hero::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 40%, transparent 100%);
  z-index: 1;
}

.decoration-blob {
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  filter: blur(60px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

.blob-1 { top: -100px; left: -100px; }
.blob-2 { bottom: 10%; left: 30%; width: 300px; height: 300px; }

.ethics-hero-content {
  max-width: 850px;
  text-align: left;
  z-index: 2;
  margin-top: -300px;
}

.hero-tag {
  display: inline-block;
  padding: 8px 20px;
  background: rgba(30, 64, 175, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(30, 64, 175, 0.15);
  color: #1e40af;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 32px;
  letter-spacing: 2px;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(30, 64, 175, 0.1);
}

.ethics-title {
  font-size: clamp(40px, 8vw, 96px);
  font-weight: 900;
  line-height: 0.95;
  margin: 0 0 32px 0;
  color: #0f172a;
  letter-spacing: -0.06em;
}

.ethics-subtitle {
  font-size: clamp(18px, 2.2vw, 22px);
  color: #475569;
  max-width: 750px;
  line-height: 1.5;
  margin: 0;
  font-weight: 500;
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 80px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: rgba(30, 64, 175, 0.6);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  z-index: 2;
}

.scroll-line {
  width: 40px;
  height: 2px;
  background: rgba(30, 64, 175, 0.2);
  position: relative;
  overflow: hidden;
}

.scroll-line::after {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: #1e40af;
  animation: scroll-anim 2s infinite;
}

@keyframes scroll-anim {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.hero-accent {
  background: linear-gradient(to right, #1e40af, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Vision Split Layout */
.split-layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 80px;
  align-items: center;
  padding: 100px 80px;
  background: #ffffff;
  position: relative;
}

.split-layout::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(ellipse at 70% 50%, rgba(59,130,246,0.04) 0%, transparent 65%);
  pointer-events: none;
}

.vision-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(30, 64, 175, 0.06);
  border: 1px solid rgba(30, 64, 175, 0.15);
  color: #1e40af;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 24px;
}

.vision-tag-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3b82f6;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.7); }
}

.split-heading {
  font-size: clamp(30px, 3.5vw, 44px);
  font-weight: 800;
  color: #0f172a;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin: 0 0 24px;
}

.split-heading span {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.split-body {
  font-size: 16px;
  color: #64748b;
  line-height: 1.75;
  margin: 0 0 16px;
}

.vision-stats {
  display: flex;
  gap: 40px;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid rgba(30, 64, 175, 0.08);
}

.vision-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vision-stat-number {
  font-size: 32px;
  font-weight: 800;
  color: #1e40af;
  letter-spacing: -0.04em;
  line-height: 1;
}

.vision-stat-label {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* Vision Graphic Card */
.vision-graphic-card {
  position: relative;
  height: 420px;
  border-radius: 32px;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 40%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(30, 64, 175, 0.3), 0 0 0 1px rgba(255,255,255,0.08);
}

.vision-graphic-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
}

.vision-graphic-ring:nth-child(1) { width: 200px; height: 200px; }
.vision-graphic-ring:nth-child(2) { width: 300px; height: 300px; }
.vision-graphic-ring:nth-child(3) { width: 400px; height: 400px; }

.vision-center-icon {
  position: relative;
  z-index: 2;
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.25);
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.vision-badge {
  position: absolute;
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 14px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 3;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.vision-badge-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.vision-badge-text {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.3;
}

.vision-badge-sub {
  font-size: 10px;
  color: rgba(255,255,255,0.65);
  font-weight: 400;
}


/* Risks Section */
.risks-box {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a8a 100%);
  padding: 72px 80px;
  margin: 50px 0;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(30, 27, 75, 0.4), 0 0 0 1px rgba(255,255,255,0.06);
}

.risks-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}

.risks-blob-1 {
  width: 300px;
  height: 300px;
  background: rgba(239, 68, 68, 0.15);
  top: -80px;
  right: -60px;
}

.risks-blob-2 {
  width: 200px;
  height: 200px;
  background: rgba(59, 130, 246, 0.12);
  bottom: -60px;
  left: 20%;
}

.risks-inner {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.risks-left {}

.risks-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #fca5a5;
  margin-bottom: 20px;
}

.risks-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.risks-header h2 {
  font-size: 36px;
  margin: 0;
  color: #ffffff;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.risks-body {
  font-size: 16px;
  color: rgba(255,255,255,0.65);
  line-height: 1.75;
  margin: 0 0 32px;
  max-width: 580px;
}

.risks-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.risks-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 16px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 100px;
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  font-weight: 500;
  backdrop-filter: blur(8px);
}

.risks-chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f87171;
  flex-shrink: 0;
}

.risks-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.risks-icon-wrap {
  width: 100px;
  height: 100px;
  border-radius: 28px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40px rgba(239, 68, 68, 0.2);
}

.risks-stat {
  text-align: center;
}

.risks-stat-number {
  font-size: 28px;
  font-weight: 800;
  color: #f87171;
  letter-spacing: -0.04em;
  line-height: 1;
}

.risks-stat-label {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 4px;
}


/* Principles Grid */
.principles-header {
  text-align: center;
  margin-top: 100px;
  margin-bottom: 40px;
}

.values-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(30, 64, 175, 0.06);
  border: 1px solid rgba(30, 64, 175, 0.15);
  color: #1e40af;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.principles-slider-container {
  position: relative;
  padding: 0 40px;
}

.principles-grid {
  display: flex;
  flex-wrap: nowrap;
  gap: 32px;
  overflow-x: auto;
  padding: 40px 10px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.principles-grid::-webkit-scrollbar {
  display: none;
}

.principles-nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(30, 64, 175, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e40af;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.principles-nav-button:hover:not(:disabled) {
  background: #1e40af;
  color: #ffffff;
  border-color: #1e40af;
  box-shadow: 0 10px 25px rgba(30, 64, 175, 0.3);
}

.principles-nav-button:disabled {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-50%) scale(0.9);
}

.nav-prev { left: 0; }
.nav-next { right: 0; }

.glass-card {
  padding: 30px 25px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 28px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  height: inherit;
  max-width: 500px;
  flex: 0 0 auto;
  scroll-snap-align: center;
}

.leadership-grid-layout {
  display: grid;
  grid-template-columns: 0.8fr 2fr;
  gap: 60px;
  align-items: start;
  padding: 80px 40px;
  position: relative;
  background: rgba(30, 64, 175, 0.02);
  border-radius: 40px;
  margin: 40px 0;
  border: 1px solid rgba(30, 64, 175, 0.04);
}

.leadership-side-header {
  text-align: left;
  margin-top: 20px;
}

.leadership-side-header .ethics-section-title {
  font-size: 42px;
  line-height: 1.1;
  margin-top: 16px;
  color: #0f172a;
}

.leadership-slider-container {
  position: relative;
  min-width: 0; /* Important for grid slider */
}

.leadership-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 0;
}

.leadership-card {
  width: 100%;
  padding: 32px;
  background: #ffffff;
  border: 1px solid rgba(30, 64, 175, 0.08);
  border-radius: 24px;
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.leadership-card:hover {
  transform: translateY(-8px);
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow: 0 20px 40px rgba(34, 197, 94, 0.1);
}

.leadership-card-icon {
  width: 48px;
  height: 48px;
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.leadership-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

.leadership-card p {
  font-size: 14px;
  line-height: 1.6;
  color: #64748b;
  margin: 0;
}

.leadership-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  z-index: 5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.leadership-nav-btn:hover:not(:disabled) {
  background: #16a34a;
  color: #ffffff;
  border-color: #16a34a;
}

.leadership-nav-btn:disabled {
  opacity: 0;
  pointer-events: none;
}

.l-prev { left: -22px; }
.l-next { right: -22px; }

@media (max-width: 1200px) {
  .leadership-grid-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

.glass-card:hover {
  transform: translateY(-8px);
  border-color: rgba(30, 64, 175, 0.25);
  box-shadow: 
    0 30px 60px rgba(30, 64, 175, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

.glass-card:hover::before {
  opacity: 1;
}

.card-icon-container {
  width: 52px;
  height: 52px;
  background: rgba(30, 64, 175, 0.06);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: #1e40af;
  transition: all 0.5s ease;
  border: 1px solid rgba(30, 64, 175, 0.1);
}

.glass-card:hover .card-icon-container {
  background: #1e40af;
  color: #ffffff;
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 10px 20px rgba(30, 64, 175, 0.2);
}

.glass-card h3 {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 12px;
  color: #0f172a;
  letter-spacing: -0.03em;
}

.glass-card p {
  font-size: 15px;
  color: #475569;
  line-height: 1.55;
  margin: 0;
  font-weight: 500;
}

.card-arrow {
  margin-top: auto;
  padding-top: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e40af;
  font-size: 14px;
  font-weight: 700;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.4s ease;
}

.glass-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}


/* Leadership Section Header */
.leadership-header {
  text-align: center;
  margin-bottom: 60px;
}

/* Checklist UI */
.checklist-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 32px;
  background: #ffffff;
  border: 1px solid rgba(30, 64, 175, 0.08);
  border-radius: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
}

.checklist-item::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 0;
  background: linear-gradient(to right, #1e40af, #3b82f6);
  transition: width 0.4s ease;
}

.checklist-item:hover {
  transform: translateY(-8px) scale(1.01);
  border-color: rgba(30, 64, 175, 0.15);
  box-shadow: 0 20px 40px rgba(30, 64, 175, 0.08);
}

.checklist-item:hover::after {
  width: 100%;
}

.check-icon {
  width: 44px;
  height: 44px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.checklist-item:hover .check-icon {
  background: #22c55e;
  color: #ffffff;
  transform: rotate(10deg);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.checklist-item p {
  font-size: 16px;
  color: #334155;
  font-weight: 500;
  line-height: 1.5;
  margin: 0;
}


.ethics-section-title {
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 700;
  margin: 0 0 24px 0;
  color: #1e293b;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.ethics-text {
  font-size: clamp(16px, 1.2vw, 20px);
  line-height: 1.6;
  margin: 0 0 24px 0;
  color: #64748b;
  font-weight: 400;
}

/* Ongoing Promise */
.promise-block {
  text-align: center;
  padding: 100px 80px;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.03) 0%, rgba(255, 255, 255, 1) 50%, rgba(30, 64, 175, 0.03) 100%);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin: 100px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.promise-icon-wrap {
  width: 60px;
  height: 60px;
  background: #1e40af;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 10px 25px rgba(30, 64, 175, 0.25);
}

.promise-text {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.04em;
  line-height: 1.1;
  max-width: 900px;
  margin: 0 auto;
}

/* Signature Section */
.signature-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 100px 0 140px;
}

.founder-avatar-wrap {
  position: relative;
  margin-bottom: 40px;
}

.founder-avatar {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 20px 50px rgba(30, 64, 175, 0.15);
}

.founder-avatar-inner {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e40af;
}

.signature-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #22c55e;
  color: #ffffff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3);
}

.signature-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.signature-name {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
  margin: 0;
}

.signature-role {
  font-size: 14px;
  font-weight: 700;
  color: #1e40af;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;
}

.pledge-verified {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 16px;
}

.ethics-date {
  font-weight: 700;
  color: #0f172a;
}


@media (max-width: 1024px) {
  .split-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .ethics-hero {
    padding: 140px 24px 80px;
    text-align: center;
    justify-content: center;
  }
  .ethics-hero-content {
    text-align: center;
  }
  .ethics-subtitle {
    margin: 0 auto;
  }
  .side-nav {
    display: none;
  }
  .section-container {
    padding: 60px 24px;
  }
}
`

function Ethics({ onLoginClick, onLogoClick, onNavigateToCompany, onNavigateToProduct, onNavigateToSolution, onNavigateToEthics, onNavigateToTechnology, onNavigateToUseCases }) {
  const { scrollYProgress } = useScroll()
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', updateScrollState)
    updateScrollState()
    window.addEventListener('resize', updateScrollState)
    return () => {
      if (el) el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  const handleScroll = (direction, ref) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -400 : 400
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const [activeSection, setActiveSection] = useState('Introduction')

  const sections = [
    { id: 'Introduction', label: 'Introduction' },
    { id: 'Vision', label: 'Responsibility' },
    { id: 'Commitment', label: 'Commitment' },
    { id: 'Principles', label: 'Principles' },
    { id: 'Leadership', label: 'Leadership' },
    { id: 'Promise', label: 'Promise' }
  ]

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id))
      const scrollPosition = window.scrollY + 200

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i]
        if (el && scrollPosition >= el.offsetTop) {
          setActiveSection(sections[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: 'smooth'
      })
    }
  }

  return (
    <>
      <style>{styles}</style>
      <motion.div className="progress-bar" style={{ scaleX }} />



      <div className="ethics-page">
        <Navbar
          onLoginClick={onLoginClick}
          onLogoClick={onLogoClick}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToTechnology={onNavigateToTechnology}
          onNavigateToCompany={onNavigateToCompany}
        />

        {/* Section 1: Hero */}
        <div className="ethics-hero" id="Introduction" style={{ backgroundImage: `url(${EthicsBg})` }}>
          <motion.div
            className="decoration-blob blob-1"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
              x: [0, 50, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="decoration-blob blob-2"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          <motion.div
            className="ethics-hero-content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="hero-tag"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Ethics First
            </motion.span>
            <h1 className="ethics-title">
              Ethical Pledge for <br />
              <span className="hero-accent">Synthetic Media</span>
            </h1>
            <p className="ethics-subtitle">
              At Athena Virtual Instructor, we believe synthetic media represents one of the most powerful technological advancements of our generation.
            </p>
          </motion.div>

          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="scroll-line" />
            <span>Scroll to Explore</span>
          </motion.div>
        </div>

        <div className="section-container">
          {/* Section 2: Vision + Responsibility */}
          <motion.div
            className="split-layout"
            id="Vision"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            {/* Left Text */}
            <div className="split-text">
              <div className="vision-tag">
                <span className="vision-tag-dot" />
                Our Foundation
              </div>
              <h2 className="split-heading">
                Vision
              </h2>
              <p className="split-body">
                Through generative AI, we can unlock creativity, increase access to knowledge, and dramatically improve how people learn, communicate, and build businesses.
              </p>
              <p className="split-body">
                With this power comes responsibility. Synthetic media must be developed and deployed with care — to empower people, not deceive, exploit, or manipulate them.
              </p>
              <div className="vision-stats">
                <div className="vision-stat">
                  <span className="vision-stat-number">120+</span>
                  <span className="vision-stat-label">Languages</span>
                </div>
                <div className="vision-stat">
                  <span className="vision-stat-number">1M+</span>
                  <span className="vision-stat-label">Users</span>
                </div>
                <div className="vision-stat">
                  <span className="vision-stat-number">80%</span>
                  <span className="vision-stat-label">Cost Reduced</span>
                </div>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="vision-graphic-card">
              <div className="vision-graphic-ring" />
              <div className="vision-graphic-ring" />
              <div className="vision-graphic-ring" />

              <motion.div
                className="vision-center-icon"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Layers size={36} color="#ffffff" />
              </motion.div>

              {/* Badge: Top Left */}
              <motion.div
                className="vision-badge"
                style={{ top: 40, left: 32 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="vision-badge-icon"><Eye size={16} /></div>
                <div>
                  <div className="vision-badge-text">Transparency</div>
                  <div className="vision-badge-sub">Always disclosed</div>
                </div>
              </motion.div>

              {/* Badge: Bottom Right */}
              <motion.div
                className="vision-badge"
                style={{ bottom: 40, right: 32 }}
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="vision-badge-icon"><Shield size={16} /></div>
                <div>
                  <div className="vision-badge-text">Accountability</div>
                  <div className="vision-badge-sub">Full responsibility</div>
                </div>
              </motion.div>

              {/* Badge: Bottom Left */}
              <motion.div
                className="vision-badge"
                style={{ bottom: 40, left: 32 }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="vision-badge-icon"><Lock size={16} /></div>
                <div>
                  <div className="vision-badge-text">Privacy</div>
                  <div className="vision-badge-sub">Data protected</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Section 3: Risks Section */}
          <motion.div
            className="risks-box"
            id="Commitment"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Decorative blobs */}
            <div className="risks-blob risks-blob-1" />
            <div className="risks-blob risks-blob-2" />

            <div className="risks-inner">
              <div className="risks-left">
                <div className="risks-tag">
                  <span className="risks-chip-dot" style={{ background: '#f87171' }} />
                  Our Commitment
                </div>
                <div className="risks-header">
                  <h2>The Responsibility</h2>
                </div>
                <p className="risks-body">
                  Operating at the frontier of AI-powered communication, we accept the responsibility to protect individuals, safeguard data, and ensure our technology creates real value for society.
                </p>
                <div className="risks-chips">
                  {['Bias Prevention', 'Privacy Violations', 'Misinformation', 'Misuse by Bad Actors'].map((risk) => (
                    <div key={risk} className="risks-chip">
                      <span className="risks-chip-dot" />
                      {risk}
                    </div>
                  ))}
                </div>
              </div>

              <div className="risks-right">
                <motion.div
                  className="risks-icon-wrap"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <AlertTriangle size={44} color="#f87171" />
                </motion.div>
                <div className="risks-stat">
                  <div className="risks-stat-number">4</div>
                  <div className="risks-stat-label">Risk Areas</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 4: Core Principles */}
          <div className="ethics-section" id="Principles">
            <div className="principles-header">
              <motion.div
                className="values-tag"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Core Values
              </motion.div>
              <motion.h2
                className="ethics-section-title"
                style={{ margin: 0 }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Our Core Principles
              </motion.h2>
            </div>

            <div className="principles-slider-container">
              <button
                className="principles-nav-button nav-prev"
                onClick={() => handleScroll('left', scrollRef)}
                disabled={!canScrollLeft}
                aria-label="Previous principle"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="principles-grid" ref={scrollRef}>
                {[
                  { icon: <Eye />, title: "Transparency", desc: "Users will always know when content is AI-generated, ensuring authentic interactions." },
                  { icon: <CheckCircle />, title: "Consent", desc: "No identity, voice, or likeness will ever be used without explicit, verifiable permission." },
                  { icon: <Lock />, title: "Privacy", desc: "Personal data is strictly protected using industry-leading encryption and never exploited." },
                  { icon: <Scale />, title: "Fairness", desc: "We actively work to minimize algorithmic bias and prevent harmful or discriminatory outputs." },
                  { icon: <Shield />, title: "Accountability", desc: "We take full responsibility for our tools and maintain strict usage policies for all partners." }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="glass-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                  >
                    <div className="card-icon-container">
                      {item.icon}
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <div className="card-arrow">
                      Read Policy
                      <Check size={14} />
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                className="principles-nav-button nav-next"
                onClick={() => handleScroll('right', scrollRef)}
                disabled={!canScrollRight}
                aria-label="Next principle"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Section 5: How We Will Lead */}
          <div className="leadership-grid-layout" id="Leadership">
            <div className="leadership-side-header">
              <motion.div
                className="values-tag"
                style={{ background: 'rgba(34, 197, 94, 0.08)', color: '#16a34a', borderColor: 'rgba(34, 197, 94, 0.2)' }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                Leadership
              </motion.div>
              <motion.h2
                className="ethics-section-title"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                How We Will Lead
              </motion.h2>
            </div>

            <div className="leadership-slider-container">
              <div className="leadership-grid">
                {[
                  { icon: <UserCheck />, title: "Identity Protection", desc: "Requiring proper authorization for any real person's identity before synthesis." },
                  { icon: <ShieldAlert />, title: "Abuse Prevention", desc: "Maintaining strong safeguards and active monitoring to prevent deepfake misuse." },
                  { icon: <Tag />, title: "Clear Labeling", desc: "Providing unequivocal labeling for all AI-generated content to ensure viewer clarity." },
                  { icon: <Activity />, title: "Continuous Audit", desc: "Regularly auditing our systems for safety, fairness, and potential algorithmic bias." },
                  { icon: <AlertCircle />, title: "Safety First", desc: "Preventing the use of our technology for impersonation, fraud, or intentional harm." }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="leadership-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="leadership-card-icon">
                      {item.icon}
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <div className="card-arrow" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
                      Read Policy
                      <Check size={14} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Ongoing Promise */}
        <div className="promise-block" id="Promise">
          <motion.div
            className="promise-icon-wrap"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <ShieldCheck size={32} weight="fill" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="promise-text">
              This pledge is not a one-time statement — it is a <span className="hero-accent">living commitment</span>.
            </p>
            <p className="ethics-text" style={{ marginTop: '32px', maxWidth: '700px', margin: '32px auto 0' }}>
              We invite the broader AI community to join us in building a future where synthetic media is trusted, ethical, and beneficial for everyone.
            </p>
          </motion.div>
        </div>

        {/* Section 7: Signature */}
        <motion.div
          className="signature-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="founder-avatar-wrap">
            <div className="founder-avatar">
              <div className="founder-avatar-inner">
                <Target size={48} weight="bold" />
              </div>
            </div>
            <div className="signature-badge">
              <CheckCircle size={20} weight="fill" />
            </div>
          </div>

          <div className="signature-info">
            <p className="signature-name">Paulmichael Rowland</p>
            <p className="signature-role">Founder, Athena Virtual Instructor</p>
            <div className="pledge-verified">
              <ShieldCheck size={14} color="#22c55e" weight="fill" />
              Official Pledge Verified
            </div>
            <p className="ethics-date" style={{ marginTop: '24px', fontSize: '12px', opacity: 0.6 }}>
              ESTABLISHED <span className="ethics-date">JANUARY 2024</span>
            </p>
          </div>
        </motion.div>

        <Footer
          onLogoClick={onLogoClick}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToTechnology={onNavigateToTechnology}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToUseCases={onNavigateToUseCases}
        />
      </div>
    </>
  )
}
export default Ethics
