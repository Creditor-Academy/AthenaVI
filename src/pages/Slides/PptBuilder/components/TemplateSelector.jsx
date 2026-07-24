import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import '../PptBuilder.css';
import '../../AIPptGenerator.css'; // Import the wizard's premium CSS

import temp1 from '../../../../assets/Template_Image/theme_petrol.png';
import temp2 from '../../../../assets/Template_Image/theme_stardust.png';
import temp3 from '../../../../assets/Template_Image/theme_chocolate.png';
import temp4 from '../../../../assets/Template_Image/theme_moss.png';
import temp5 from '../../../../assets/Template_Image/theme_blue_steel.png';

const TEMPLATES = [
  { id: 'blank', name: 'Blank Presentation', type: 'Basic', img: null },
  { id: 'petrol', name: 'Petrol Corporate', type: 'Professional', img: temp1, hex1: '#0f172a', hex2: '#3b82f6', hex3: '#94a3b8' },
  { id: 'stardust', name: 'Stardust Minimal', type: 'Creative', img: temp2, hex1: '#1e293b', hex2: '#8b5cf6', hex3: '#f1f5f9' },
  { id: 'chocolate', name: 'Chocolate Warmth', type: 'Elegant', img: temp3, hex1: '#3e2723', hex2: '#d7ccc8', hex3: '#a1887f' },
  { id: 'moss', name: 'Moss & Mist', type: 'Nature', img: temp4, hex1: '#1b5e20', hex2: '#a5d6a7', hex3: '#c8e6c9' },
  { id: 'blue-steel', name: 'Blue Steel Tech', type: 'Modern', img: temp5, hex1: '#263238', hex2: '#90a4ae', hex3: '#eceff1' },
];

export default function TemplateSelector({ onSelect, onBack }) {
  const [stepReady, setStepReady] = useState(false);

  useEffect(() => {
    // Trigger the premium entrance animation
    const timer = setTimeout(() => setStepReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="aig-main-fullscreen">
      <div className="aig-top-nav">
        <button className="aig-btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div className={`aig-step aig-step--2 ${stepReady ? 'aig-step-revealed' : 'aig-step-intro'}`}>
        <div className={`aig-step-header ${stepReady ? 'aig-header-settled' : 'aig-header-centered'}`}>
          <h2 className="aig-step-title">Select a Template</h2>
          <p className="aig-step-subtitle">Start with a premium design or build from scratch.</p>
        </div>
        
        <div className={`aig-step-body ${stepReady ? 'aig-body-visible' : 'aig-body-hidden'}`}>
          <div className="aig-selection-section">
            <div className="aig-new-theme-grid-5">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  className={`aig-new-theme-card-premium`}
                  onClick={() => onSelect(t)}
                >
                  <div className="aig-theme-card-header">
                    <span className="aig-theme-card-title">{t.name}</span>
                  </div>
                  
                  {t.id !== 'blank' && (
                    <div className="aig-theme-card-palette">
                      <div className="palette-color" style={{ background: t.hex1 }}></div>
                      <div className="palette-color" style={{ background: t.hex2 }}></div>
                      <div className="palette-color" style={{ background: t.hex3 }}></div>
                    </div>
                  )}

                  <div className="aig-theme-card-image-wrapper">
                    {t.img ? (
                      <img src={t.img} alt={t.name} className="aig-theme-card-image" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#94a3b8', fontSize: '24px' }}>
                        +
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
