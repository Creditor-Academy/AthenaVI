import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MdClose,
  MdChevronRight,
  MdChevronLeft,
  MdAutoAwesome,
  MdSearch,
  MdPlayArrow,
  MdPause,
  MdTranslate,
  MdHistory,
  MdLightbulbOutline,
  MdAddCircleOutline,
} from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import heygenService from '../../../../services/heygenService';
import {
  extractHeygenList,
  filterAvatarIvLooks,
  formatAvatarTypeLabel,
  mapAvatarGroup,
  mapAvatarLook,
} from '../../../../utils/heygenAvatars';
import './QuickCreateModal.css';

const QuickCreateModal = ({ isOpen, onClose, onGenerate }) => {
  const [step, setStep] = useState(1);
  const [avatarPhase, setAvatarPhase] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [looks, setLooks] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [script, setScript] = useState('');

  const [removeBackground, setRemoveBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#F0F0F0');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [expressiveness, setExpressiveness] = useState('medium');

  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingLooks, setLoadingLooks] = useState(false);
  const [looksError, setLooksError] = useState('');
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voiceSearch, setVoiceSearch] = useState('');

  const resetAvatarPicker = useCallback(() => {
    setAvatarPhase('groups');
    setSelectedGroup(null);
    setSelectedAvatar(null);
    setLooks([]);
    setLooksError('');
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      resetAvatarPicker();
      return;
    }
    if (step === 1 && avatarPhase === 'groups' && groups.length === 0) {
      fetchGroups();
    }
  }, [isOpen, step, avatarPhase, groups.length, resetAvatarPicker]);

  useEffect(() => {
    if (isOpen && step === 2 && voices.length === 0) {
      fetchVoices();
    }
  }, [isOpen, step, voices.length]);

  useEffect(() => {
    const handleVideoGenerated = () => {
      if (step === 5) {
        onClose();
        setTimeout(() => setStep(1), 500);
      }
    };
    const handleGenerationFailed = () => {
      if (step === 5) setStep(4);
    };
    window.addEventListener('open-generated-video', handleVideoGenerated);
    window.addEventListener('generation-failed', handleGenerationFailed);
    return () => {
      window.removeEventListener('open-generated-video', handleVideoGenerated);
      window.removeEventListener('generation-failed', handleGenerationFailed);
    };
  }, [step, onClose]);

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const responseData = await heygenService.getAvatarGroups({
        ownership: 'public',
        limit: 20,
      });
      const groupList = extractHeygenList(responseData, [
        'avatar_groups',
        'groups',
        'avatars',
      ]);
      setGroups(groupList.map(mapAvatarGroup).filter((g) => g.id));
    } catch (err) {
      console.error('Failed to load avatar groups:', err);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchLooksForGroup = async (group) => {
    setLoadingLooks(true);
    setLooksError('');
    setSelectedGroup(group);
    setSelectedAvatar(null);
    setAvatarPhase('looks');
    try {
      const responseData = await heygenService.getAvatarLooks({
        group_id: group.id,
        limit: 20,
      });
      const lookList = extractHeygenList(responseData, [
        'avatar_looks',
        'looks',
        'avatars',
      ]);
      const compatible = filterAvatarIvLooks(lookList)
        .map((look) => mapAvatarLook(look, group.name))
        .filter((look) => look.id);

      setLooks(compatible);
      if (compatible.length === 0) {
        setLooksError(
          'No Avatar IV–compatible looks for this character. Pick another character.'
        );
      }
    } catch (err) {
      console.error('Failed to load avatar looks:', err);
      setLooks([]);
      setLooksError('Could not load looks. Please try again.');
    } finally {
      setLoadingLooks(false);
    }
  };

  const fetchVoices = async () => {
    setLoadingVoices(true);
    try {
      const responseData = await heygenService.getVoices({
        type: 'public',
        limit: 50,
      });
      const voiceList = extractHeygenList(responseData, ['voices']);
      const mappedVoices = voiceList.map((v, index) => ({
        id: v.voice_id || v.voiceId || v.id,
        name: v.name || v.voice_name || 'AI Voice',
        gender: v.gender || 'Unknown',
        language: v.language || v.language_code || 'English (US)',
        attributes: index % 2 === 0 ? ['Documentary', 'Narration'] : ['Corporate', 'Ads'],
        subtitle: index % 2 === 0 ? 'Calm & Professional' : 'Friendly & Energetic',
        image: `https://i.pravatar.cc/150?u=${v.voice_id || v.id || index}`,
      }));
      setVoices(mappedVoices.filter((v) => v.id));
    } catch (err) {
      console.error('Failed to load voices:', err);
    } finally {
      setLoadingVoices(false);
    }
  };

  const filteredVoices = useMemo(() => {
    if (!voiceSearch) return voices;
    return voices.filter((v) =>
      v.name.toLowerCase().includes(voiceSearch.toLowerCase())
    );
  }, [voices, voiceSearch]);

  const buildGeneratePayload = () => ({
    avatarType: selectedAvatar.id,
    avatarGroupId: selectedGroup?.id,
    avatarImage: selectedAvatar.image,
    avatarName: selectedAvatar.name,
    avatarTypeLabel: selectedAvatar.avatarType,
    voiceId: selectedVoice.id,
    voiceName: selectedVoice.name,
    script,
    removeBackground,
    backgroundColor,
    aspectRatio,
    expressiveness,
  });

  const handleGenerate = () => {
    if (selectedAvatar?.id && selectedVoice && script) {
      setStep(5);
      onGenerate(buildGeneratePayload());
    } else {
      alert('Please select a look, voice, and provide a script.');
    }
  };

  const handleSmartStoryboard = () => {
    if (selectedAvatar?.id && selectedVoice && script) {
      setStep(5);
      onGenerate({ ...buildGeneratePayload(), isStoryboard: true });
    } else {
      alert('Please select a look, voice, and enter a script first.');
    }
  };

  const handleBack = () => {
    if (step === 1 && avatarPhase === 'looks') {
      setAvatarPhase('groups');
      setSelectedAvatar(null);
      setLooks([]);
      setLooksError('');
      return;
    }
    if (step > 1) setStep(step - 1);
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  if (!isOpen) return null;

  const renderHeader = () => {
    const titles = [
      {
        title:
          avatarPhase === 'looks'
            ? `Choose a look — ${selectedGroup?.name || 'Character'}`
            : 'Select your presenter',
        subtitle:
          avatarPhase === 'looks'
            ? 'Only Avatar IV–compatible looks are shown.'
            : 'Pick a character, then choose a compatible look.',
      },
      {
        title: 'Choose a Voice',
        subtitle: 'Select the perfect AI voice for your video script.',
      },
      { title: 'Step 3: Script Input', subtitle: '' },
      { title: 'Quick Create Wizard', subtitle: 'Configure advanced settings.' },
      { title: 'Generating Video', subtitle: 'Your masterpiece is being created.' },
    ];

    const current = titles[step - 1] || titles[0];

    return (
      <div className="qc-header">
        <div className="qc-header-top">
          <div className="qc-step-indicator">
            <span className="qc-step-text">Step {Math.min(step, 4)} of 4</span>
          </div>
          <button className="qc-close-btn" onClick={onClose} disabled={step === 5}>
            <MdClose size={20} />
          </button>
        </div>

        <div className="qc-progress-container">
          <div
            className="qc-progress-bar"
            style={{ width: `${(Math.min(step, 4) / 4) * 100}%` }}
          />
        </div>

        {(current.title || current.subtitle) && (
          <div className="qc-title-area">
            {step === 1 && avatarPhase === 'looks' && (
              <button
                type="button"
                className="qc-breadcrumb-back"
                onClick={() => {
                  setAvatarPhase('groups');
                  setSelectedAvatar(null);
                  setLooks([]);
                  setLooksError('');
                }}
              >
                <MdChevronLeft size={16} /> All characters
              </button>
            )}
            {current.title && <h2 className="qc-title">{current.title}</h2>}
            {current.subtitle && <p className="qc-subtitle">{current.subtitle}</p>}
          </div>
        )}
      </div>
    );
  };

  const renderAvatarStep = () => {
    if (avatarPhase === 'groups') {
      if (loadingGroups) {
        return (
          <div className="qc-loading">
            <Loader2 className="qc-spinner" size={32} />
            <p>Loading characters...</p>
          </div>
        );
      }
      if (groups.length === 0) {
        return (
          <div className="qc-loading">
            <p>No characters available. Check your HeyGen connection.</p>
          </div>
        );
      }
      return (
        <div className="qc-avatar-grid premium-scrollbar">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`qc-avatar-card ${selectedGroup?.id === group.id ? 'selected' : ''}`}
              onClick={() => fetchLooksForGroup(group)}
            >
              <div className="qc-avatar-img-wrap">
                <img src={group.image} alt={group.name} />
              </div>
              <div className="qc-avatar-info">
                <h4>{group.name}</h4>
                <p>{group.subtitle || 'View looks'}</p>
              </div>
            </div>
          ))}
          <div className="qc-avatar-card upload-card">
            <div className="qc-upload-content">
              <MdAddCircleOutline size={32} />
              <p>
                Upload Custom
                <br />
                Avatar
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (loadingLooks) {
      return (
        <div className="qc-loading">
          <Loader2 className="qc-spinner" size={32} />
          <p>Loading looks...</p>
        </div>
      );
    }

    if (looksError) {
      return (
        <div className="qc-loading">
          <p className="qc-looks-error">{looksError}</p>
        </div>
      );
    }

    return (
      <div className="qc-avatar-grid premium-scrollbar">
        {looks.map((look) => {
          const isSelected = selectedAvatar?.id === look.id;
          const typeLabel = formatAvatarTypeLabel(look.avatarType);
          return (
            <div
              key={look.id}
              className={`qc-avatar-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedAvatar(look)}
            >
              <div className="qc-avatar-img-wrap">
                <img src={look.image} alt={look.name} />
                {typeLabel && <span className="qc-avatar-type-badge">{typeLabel}</span>}
                {isSelected && <div className="qc-avatar-check">✓</div>}
              </div>
              <div className="qc-avatar-info">
                <h4 className={isSelected ? 'text-primary' : ''}>
                  {look.name} {isSelected && '(Active)'}
                </h4>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="qc-overlay">
      <div className="qc-modal">
        {renderHeader()}

        <div className="qc-content">
          {step === 1 && <div className="qc-step-pane">{renderAvatarStep()}</div>}

          {step === 2 && (
            <div className="qc-step-pane">
              <div className="qc-voice-filters">
                <div className="qc-search-box">
                  <MdSearch size={20} />
                  <input
                    type="text"
                    placeholder="Search voices by name or style..."
                    value={voiceSearch}
                    onChange={(e) => setVoiceSearch(e.target.value)}
                  />
                </div>
                <select className="qc-select">
                  <option>Gender: All</option>
                </select>
                <select className="qc-select">
                  <option>Language: English</option>
                </select>
              </div>

              <div className="qc-voice-chips">
                <span className="qc-chip active">
                  English (US) <MdClose size={14} />
                </span>
                <span className="qc-chip">Male</span>
                <span className="qc-chip">Female</span>
                <span className="qc-chip">Neural Plus</span>
                <span className="qc-chip clear-all">Clear all</span>
              </div>

              {loadingVoices ? (
                <div className="qc-loading">
                  <Loader2 className="qc-spinner" size={32} />
                </div>
              ) : (
                <div className="qc-voice-table premium-scrollbar">
                  <div className="qc-vt-header">
                    <div className="qc-vt-col">VOICE NAME</div>
                    <div className="qc-vt-col">GENDER</div>
                    <div className="qc-vt-col">LANGUAGE</div>
                    <div className="qc-vt-col">ATTRIBUTES</div>
                    <div className="qc-vt-col center">PREVIEW</div>
                  </div>

                  {filteredVoices.map((voice) => {
                    const isSelected = selectedVoice?.id === voice.id;
                    return (
                      <div
                        key={voice.id}
                        className={`qc-vt-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedVoice(voice)}
                      >
                        <div className="qc-vt-col voice-name-col">
                          <img
                            src={voice.image}
                            alt={voice.name}
                            className="qc-voice-avatar"
                          />
                          <div>
                            <strong>
                              {voice.name} <span className="qc-badge">NEURAL</span>
                            </strong>
                            <span className="qc-voice-sub">{voice.subtitle}</span>
                          </div>
                        </div>
                        <div className="qc-vt-col">{voice.gender}</div>
                        <div className="qc-vt-col">{voice.language}</div>
                        <div className="qc-vt-col tags-col">
                          {voice.attributes.map((attr) => (
                            <span key={attr} className="qc-attr-tag">
                              {attr}
                            </span>
                          ))}
                        </div>
                        <div className="qc-vt-col center">
                          <button
                            className={`qc-play-btn ${isSelected ? 'playing' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isSelected ? (
                              <MdPause size={18} />
                            ) : (
                              <MdPlayArrow size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="qc-step-pane">
              <div className="qc-script-container">
                <div className="qc-script-header">
                  <span className="qc-label">VIDEO SCRIPT</span>
                  <span className="qc-char-count">{script.length} / 1000</span>
                </div>

                <div className="qc-textarea-wrapper">
                  <textarea
                    className="qc-script-textarea premium-scrollbar"
                    placeholder="Enter your script here or use AI to generate one..."
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    maxLength={1000}
                  />
                  <button type="button" className="qc-ai-fab">
                    <MdAutoAwesome size={20} />
                  </button>
                </div>

                <div className="qc-script-actions">
                  <button type="button" className="qc-action-btn">
                    <MdAutoAwesome /> AI Polish
                  </button>
                  <button type="button" className="qc-action-btn">
                    <MdTranslate /> Translate
                  </button>
                  <button type="button" className="qc-action-btn">
                    <MdHistory /> Last Draft
                  </button>
                  <button
                    type="button"
                    className="qc-action-btn"
                    onClick={handleSmartStoryboard}
                    style={{
                      marginLeft: 'auto',
                      background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                      color: 'white',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(168, 85, 247, 0.25)',
                    }}
                  >
                    <MdAutoAwesome /> Smart Storyboard
                  </button>
                </div>
              </div>

              <div className="qc-pro-tip">
                <MdLightbulbOutline size={20} className="qc-tip-icon" />
                <div className="qc-tip-content">
                  <strong>Pro Creative Tip</strong>
                  <p>
                    Keep your script under 500 characters for optimal social media
                    engagement. Use the &quot;AI Polish&quot; tool to summarize long
                    paragraphs into punchy, high-conversion hooks.
                  </p>
                </div>
                <button type="button" className="qc-tip-close">
                  <MdClose />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="qc-step-pane">
              <div className="qc-settings-grid premium-scrollbar">
                <div className="qc-setting-section">
                  <label className="qc-label">BACKGROUND PROCESSING</label>
                  <div className="qc-toggle-card">
                    <div className="qc-toggle-label">
                      <MdAutoAwesome size={18} className="text-primary" />
                      <span>Remove Background</span>
                    </div>
                    <label className="qc-switch">
                      <input
                        type="checkbox"
                        checked={removeBackground}
                        onChange={(e) => setRemoveBackground(e.target.checked)}
                      />
                      <span className="qc-slider" />
                    </label>
                  </div>

                  {!removeBackground && (
                    <div className="qc-color-section">
                      <label className="qc-label">BACKGROUND COLOR</label>
                      <div className="qc-color-swatches">
                        {[
                          '#ffffff',
                          '#a855f7',
                          '#64748b',
                          '#e2e8f0',
                          '#d4a373',
                          '#94a3b8',
                        ].map((color) => (
                          <div
                            key={color}
                            className={`qc-swatch ${backgroundColor === color ? 'active' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setBackgroundColor(color)}
                          />
                        ))}
                      </div>
                      <div className="qc-color-input-wrapper">
                        <div
                          className="qc-color-preview"
                          style={{ backgroundColor }}
                        />
                        <input
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="qc-setting-section">
                  <label className="qc-label">VIDEO FORMAT</label>
                  <div className="qc-format-cards">
                    <div
                      className={`qc-format-card landscape ${aspectRatio === '16:9' ? 'active' : ''}`}
                      onClick={() => setAspectRatio('16:9')}
                    >
                      <div className="qc-format-icon" />
                      <span>16:9 Landscape</span>
                    </div>
                    <div
                      className={`qc-format-card portrait ${aspectRatio === '9:16' ? 'active' : ''}`}
                      onClick={() => setAspectRatio('9:16')}
                    >
                      <div className="qc-format-icon" />
                      <span>9:16 Portrait</span>
                    </div>
                  </div>
                </div>

                <div className="qc-setting-section full-width">
                  <label className="qc-label">EXPRESSIVENESS</label>
                  <div className="qc-express-cards">
                    <label
                      className={`qc-express-card ${expressiveness === 'low' ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="exp"
                        value="low"
                        checked={expressiveness === 'low'}
                        onChange={() => setExpressiveness('low')}
                      />
                      <div className="qc-express-content">
                        <strong>Low</strong>
                        <p>Subtle delivery for formal or instructional content.</p>
                      </div>
                    </label>
                    <label
                      className={`qc-express-card ${expressiveness === 'medium' ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="exp"
                        value="medium"
                        checked={expressiveness === 'medium'}
                        onChange={() => setExpressiveness('medium')}
                      />
                      <div className="qc-express-content">
                        <strong>Medium</strong>
                        <p>Natural facial movements for standard presentations.</p>
                      </div>
                    </label>
                    <label
                      className={`qc-express-card ${expressiveness === 'high' ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="exp"
                        value="high"
                        checked={expressiveness === 'high'}
                        onChange={() => setExpressiveness('high')}
                      />
                      <div className="qc-express-content">
                        <strong>High</strong>
                        <p>Exaggerated emotions for dynamic social content.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div
              className="qc-step-pane"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
              }}
            >
              <Loader2
                className="qc-spinner"
                size={64}
                style={{ color: '#1a73e8', marginBottom: '24px' }}
              />
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: '#1a1b1c',
                }}
              >
                Generating Video...
              </h3>
              <p
                style={{
                  color: '#5f6368',
                  textAlign: 'center',
                  maxWidth: '300px',
                }}
              >
                Please wait while our AI creates your masterpiece. This may take a few
                moments.
              </p>
            </div>
          )}
        </div>

        {step !== 5 && (
          <div className="qc-footer">
            {step === 1 && avatarPhase === 'groups' ? (
              <button type="button" className="qc-btn-secondary" onClick={onClose}>
                Cancel
              </button>
            ) : (
              <button type="button" className="qc-btn-secondary" onClick={handleBack}>
                <MdChevronLeft size={18} /> Back
              </button>
            )}

            <div className="qc-footer-right">
              {step === 2 && selectedVoice && (
                <div className="qc-selected-info">
                  <span>SELECTED VOICE</span>
                  <strong>{selectedVoice.name}</strong>
                </div>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  className="qc-btn-primary"
                  onClick={handleNext}
                  disabled={
                    (step === 1 &&
                      (avatarPhase !== 'looks' || !selectedAvatar?.id)) ||
                    (step === 2 && !selectedVoice) ||
                    (step === 3 && !script.trim())
                  }
                >
                  Next: {step === 1 ? 'Voice' : step === 2 ? 'Script' : 'Advanced'}{' '}
                  <MdChevronRight size={18} />
                </button>
              ) : (
                <button type="button" className="qc-btn-primary" onClick={handleGenerate}>
                  Generate Video{' '}
                  <MdAutoAwesome size={16} style={{ marginLeft: '6px' }} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickCreateModal;
