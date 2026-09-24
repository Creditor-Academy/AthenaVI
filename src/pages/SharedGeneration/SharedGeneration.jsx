import React, { useEffect, useState } from 'react';
import { BsStars } from 'react-icons/bs';
import { MdArrowForward } from 'react-icons/md';
import axios from 'axios';
import LogoImg from '../../assets/herologo.png';
import './SharedGeneration.css';

export default function SharedGeneration() {
  const [token, setToken] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  useEffect(() => {
    // Extract token from /share/:token safely
    const path = window.location.pathname || '';
    const match = path.match(/\/share\/([a-zA-Z0-9-]+)/i);
    
    if (match && match[1]) {
      setToken(match[1]);
    } else {
      setError(`Invalid share link. (Path was: ${path})`);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    async function fetchShared() {
      try {
        const response = await axios.get(`/api/image-gen/public/share/${token}`);
        setGeneration(response.data);
      } catch (err) {
        setError('This shared image is no longer available or the link is invalid.');
      } finally {
        setLoading(false);
      }
    }
    fetchShared();
  }, [token]);

  if (loading) {
    return (
      <div className="shared-gen-container">
        <div className="shared-gen-loader">
          <BsStars className="spinning-sparkle" size={32} />
          <p>Loading creation...</p>
        </div>
      </div>
    );
  }

  if (error || !generation) {
    return (
      <div className="shared-gen-container">
        <div className="shared-gen-error">
          <img src={LogoImg} alt="Athena" className="shared-brand-logo" />
          <h2>Image Not Found</h2>
          <p>{error}</p>
          <button onClick={() => window.location.href = '/'} className="editorial-cta-btn">
            Create your own with Athena <MdArrowForward size={16} />
          </button>
        </div>
      </div>
    );
  }

  const isLongPrompt = generation.prompt && generation.prompt.length > 120;
  const displayPrompt = (!showFullPrompt && isLongPrompt) 
    ? generation.prompt.substring(0, 120).trim() + '...'
    : generation.prompt;

  return (
    <div className="shared-gen-container">
      <header className="shared-header">
        <div className="shared-brand" onClick={() => window.location.href = '/'}>
          <img src={LogoImg} alt="Athena" />
          <span>Athena <span style={{ fontWeight: 400, color: '#666' }}>Virtual Studio</span></span>
        </div>
        <button onClick={() => window.location.href = '/'} className="shared-try-btn">
          Try Athena for free
        </button>
      </header>
      
      <main className="shared-main">
        <div className="shared-content-wrapper split-view">
          
          <div className="split-left">
            <div className="shared-image-wrapper">
              <span className="shared-image-label">Created with Virtual Studio</span>
              <div className="shared-image-frame">
                <img src={generation.url} alt={generation.prompt} className="shared-image" />
              </div>
            </div>
          </div>

          <div className="split-right">
            <div className="editorial-hero">
              <h1 className="editorial-headline">Created with Virtual Studio</h1>
              <p className="editorial-subheadline">An idea brought to life by <strong>{generation.creatorName}</strong></p>
            </div>

            <div className="editorial-idea">
              <span className="idea-label">The Idea</span>
              <p className="idea-prompt">"{displayPrompt}"</p>
              {isLongPrompt && !showFullPrompt && (
                <button 
                  onClick={() => setShowFullPrompt(true)}
                  style={{ background: 'none', border: 'none', color: '#666', fontSize: '13px', marginTop: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  View full prompt <MdArrowForward size={14} />
                </button>
              )}
            </div>
            
            <div className="editorial-cta-section">
              <h2 className="cta-headline">Create something of your own.</h2>
              <p className="cta-support">Describe what you imagine. Athena turns your idea into a visual.</p>
              <button onClick={() => window.location.href = '/signup'} className="editorial-cta-btn">
                Try Athena for free <MdArrowForward size={18} />
              </button>
              
              <div className="editorial-sequence">
                <span>IDEA</span>
                <span className="sequence-arrow">→</span>
                <span>CREATE</span>
                <span className="sequence-arrow">→</span>
                <span>REFINE</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
