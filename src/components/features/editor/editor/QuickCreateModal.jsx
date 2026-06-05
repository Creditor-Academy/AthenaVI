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
  AVATAR_IV_ENGINE,
  AVATAR_V_ENGINE,
  extractHeygenList,
  formatAvatarTypeLabel,
  LOOK_ENGINE_FILTERS,
  looksForEngineFilter,
  mapAvatarGroup,
  mapAvatarLook,
  mergeAvatarLooksPages,
  normalizeAvatarEngine,
  parseAvatarLooksResponse,
  canUseExpressiveness,
  resolveAvatarEngine,
} from '../../../../utils/heygenAvatars';
import './QuickCreateModal.css';

const QuickCreateModal = ({ isOpen, onClose, onGenerate }) => {
  const [step, setStep] = useState(1);
  const [avatarPhase, setAvatarPhase] = useState('groups');
  const [avatarEngine, setAvatarEngine] = useState(() => normalizeAvatarEngine('avatar_iv'));
  const [groups, setGroups] = useState([]);
  const [groupsHasMore, setGroupsHasMore] = useState(false);
  const [groupsNextToken, setGroupsNextToken] = useState(null);
  const [loadingMoreGroups, setLoadingMoreGroups] = useState(false);
  const [looks, setLooks] = useState([]);
  const [looksHasMore, setLooksHasMore] = useState(false);
  const [looksNextToken, setLooksNextToken] = useState(null);
  const [loadingMoreLooks, setLoadingMoreLooks] = useState(false);
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
  const [lookEngineFilter, setLookEngineFilter] = useState(LOOK_ENGINE_FILTERS.ALL);
  const [looksPageData, setLooksPageData] = useState(null);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voiceSearch, setVoiceSearch] = useState('');

  const resetAvatarPicker = useCallback(() => {
    setAvatarPhase('groups');
    setSelectedGroup(null);
    setSelectedAvatar(null);
    setLooks([]);
    setLooksError('');
    setLooksHasMore(false);
    setLooksNextToken(null);
    setLooksPageData(null);
    setLookEngineFilter(LOOK_ENGINE_FILTERS.ALL);
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
      const data = responseData?.data || responseData;
      const groupList = extractHeygenList(responseData, [
        'avatar_groups',
        'groups',
        'avatars',
      ]);
      setGroups(groupList.map(mapAvatarGroup).filter((g) => g.id));
      setGroupsHasMore(!!(data?.has_more ?? responseData?.has_more));
      setGroupsNextToken(data?.token ?? responseData?.token ?? data?.next_token ?? responseData?.next_token ?? null);
    } catch (err) {
      console.error('Failed to load avatar groups:', err);
      setGroups([]);
      setGroupsHasMore(false);
      setGroupsNextToken(null);
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadMoreGroups = async () => {
    if (!groupsHasMore || !groupsNextToken || loadingMoreGroups) return;
    setLoadingMoreGroups(true);
    try {
      const responseData = await heygenService.getAvatarGroups({
        ownership: 'public',
        limit: 20,
        token: groupsNextToken,
      });
      const data = responseData?.data || responseData;
      const groupList = extractHeygenList(responseData, ['avatar_groups', 'groups', 'avatars']);
      const mapped = groupList.map(mapAvatarGroup).filter((g) => g.id);
      setGroups((prev) => {
        const seen = new Set(prev.map((g) => g.id));
        const next = [...prev];
        mapped.forEach((g) => { if (!seen.has(g.id)) next.push(g); });
        return next;
      });
      setGroupsHasMore(!!(data?.has_more ?? responseData?.has_more));
      setGroupsNextToken(data?.token ?? responseData?.token ?? data?.next_token ?? responseData?.next_token ?? null);
    } catch (err) {
      console.error('Failed to load more avatar groups:', err);
      setGroupsHasMore(false);
      setGroupsNextToken(null);
    } finally {
      setLoadingMoreGroups(false);
    }
  };

  const applyLooksDisplay = useCallback((pageData, filter, groupName) => {
    const rawList = looksForEngineFilter(pageData, filter);
    const mapped = rawList.map((look) => mapAvatarLook(look, groupName)).filter((l) => l.id);
    setLooks(mapped);
    if (mapped.length === 0) {
      const filterLabels = {
        [LOOK_ENGINE_FILTERS.ALL]: 'any',
        [LOOK_ENGINE_FILTERS.AVATAR_IV]: 'Avatar IV',
        [LOOK_ENGINE_FILTERS.AVATAR_V]: 'Avatar V',
        [LOOK_ENGINE_FILTERS.UNKNOWN]: 'unspecified-engine',
      };
      setLooksError(`No ${filterLabels[filter] || ''} looks for this character. Pick another character.`);
    } else {
      setLooksError('');
    }
  }, []);

  const handleLookEngineFilter = (filter) => {
    setLookEngineFilter(filter);
    if (looksPageData && selectedGroup) {
      applyLooksDisplay(looksPageData, filter, selectedGroup.name);
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
      const parsed = parseAvatarLooksResponse(responseData);
      setLooksPageData(parsed);
      setLookEngineFilter(LOOK_ENGINE_FILTERS.ALL);
      applyLooksDisplay(parsed, LOOK_ENGINE_FILTERS.ALL, group.name);
      setLooksHasMore(parsed.hasMore);
      setLooksNextToken(parsed.nextToken);
    } catch (err) {
      console.error('Failed to load avatar looks:', err);
      setLooks([]);
      setLooksPageData(null);
      setLooksError('Could not load looks. Please try again.');
      setLooksHasMore(false);
      setLooksNextToken(null);
    } finally {
      setLoadingLooks(false);
    }
  };

  const loadMoreLooks = async () => {
    if (!selectedGroup || !looksHasMore || !looksNextToken || loadingMoreLooks || !looksPageData) return;
    setLoadingMoreLooks(true);
    try {
      const responseData = await heygenService.getAvatarLooks({
        group_id: selectedGroup.id,
        limit: 20,
        token: looksNextToken,
      });
      const nextParsed = parseAvatarLooksResponse(responseData);
      const merged = mergeAvatarLooksPages(looksPageData, nextParsed);
      setLooksPageData(merged);
      applyLooksDisplay(merged, lookEngineFilter, selectedGroup.name);
      setLooksHasMore(merged.hasMore);
      setLooksNextToken(merged.nextToken);
    } catch (err) {
      console.error('Failed to load more looks:', err);
      setLooksHasMore(false);
      setLooksNextToken(null);
    } finally {
      setLoadingMoreLooks(false);
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

  const buildGeneratePayload = () => {
    const preferredFromFilter =
      lookEngineFilter === LOOK_ENGINE_FILTERS.AVATAR_IV
        ? AVATAR_IV_ENGINE
        : lookEngineFilter === LOOK_ENGINE_FILTERS.AVATAR_V
          ? AVATAR_V_ENGINE
          : avatarEngine;
    const resolvedEngine = resolveAvatarEngine(
      {
        avatar_type: selectedAvatar.avatarType,
        supportedEngines: selectedAvatar.supportedEngines,
      },
      preferredFromFilter
    );
    const avatarKind = selectedAvatar.avatarType || 'studio_avatar';
    const includeExpressiveness = canUseExpressiveness(selectedAvatar, resolvedEngine);

    return {
      avatarType: selectedAvatar.id,
      avatarLookId: selectedAvatar.id,
      avatarGroupId: selectedGroup?.id,
      avatarImage: selectedAvatar.image,
      avatarName: selectedAvatar.name,
      avatarTypeLabel: avatarKind,
      avatarEngine: resolvedEngine,
      supportedEngines: selectedAvatar.supportedEngines,
      engineUnknown: selectedAvatar.engineUnknown,
      voiceId: selectedVoice.id,
      voiceName: selectedVoice.name,
      script,
      removeBackground,
      backgroundColor,
      aspectRatio,
      ...(includeExpressiveness ? { expressiveness } : {}),
    };
  };

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
      setLooksPageData(null);
      setLookEngineFilter(LOOK_ENGINE_FILTERS.ALL);
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
            ? 'Filter by rendering engine, then pick a look.'
            : 'Pick a character, then choose a look.',
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
                  setLooksPageData(null);
                  setLookEngineFilter(LOOK_ENGINE_FILTERS.ALL);
                  setLooksError('');
                }}
              >
                <MdChevronLeft size={16} /> All characters
              </button>
            )}
            {current.title && <h2 className="qc-title">{current.title}</h2>}
            {current.subtitle && <p className="qc-subtitle">{current.subtitle}</p>}

            {step === 1 && avatarPhase === 'looks' && looksPageData && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {[
                  { id: LOOK_ENGINE_FILTERS.ALL, label: 'All', count: looksPageData.engineCounts.totalLooks },
                  { id: LOOK_ENGINE_FILTERS.AVATAR_IV, label: 'Avatar IV', count: looksPageData.engineCounts.avatar_iv },
                  { id: LOOK_ENGINE_FILTERS.AVATAR_V, label: 'Avatar V', count: looksPageData.engineCounts.avatar_v },
                  ...(looksPageData.engineCounts.unknown > 0
                    ? [{ id: LOOK_ENGINE_FILTERS.UNKNOWN, label: 'Other', count: looksPageData.engineCounts.unknown }]
                    : []),
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleLookEngineFilter(chip.id)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 999,
                      border: '1px solid rgba(0,0,0,0.1)',
                      background:
                        lookEngineFilter === chip.id
                          ? chip.id === LOOK_ENGINE_FILTERS.AVATAR_V
                            ? 'rgba(168,85,247,0.12)'
                            : 'rgba(26,115,232,0.10)'
                          : '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {chip.label} ({chip.count})
                  </button>
                ))}
              </div>
            )}
            {step === 1 && avatarPhase === 'looks' && lookEngineFilter === LOOK_ENGINE_FILTERS.UNKNOWN && (
              <p style={{ margin: '8px 0 0', fontSize: 11, color: '#64748b', lineHeight: 1.45 }}>
                Engine compatibility not specified by provider.
              </p>
            )}
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

          {groupsHasMore && (
            <div className="qc-avatar-card upload-card" onClick={loadMoreGroups} style={{ cursor: loadingMoreGroups ? 'not-allowed' : 'pointer' }}>
              <div className="qc-upload-content">
                <MdAddCircleOutline size={32} />
                <p>{loadingMoreGroups ? 'Loading…' : 'Load more'}</p>
              </div>
            </div>
          )}
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
              onClick={() => {
                setSelectedAvatar(look);
                const preferred =
                  lookEngineFilter === LOOK_ENGINE_FILTERS.AVATAR_IV
                    ? AVATAR_IV_ENGINE
                    : lookEngineFilter === LOOK_ENGINE_FILTERS.AVATAR_V
                      ? AVATAR_V_ENGINE
                      : avatarEngine;
                setAvatarEngine(
                  resolveAvatarEngine(
                    { avatar_type: look.avatarType, supportedEngines: look.supportedEngines },
                    preferred
                  )
                );
              }}
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

        {looksHasMore && (
          <div className="qc-avatar-card upload-card" onClick={() => loadMoreLooks()} style={{ cursor: loadingMoreLooks ? 'not-allowed' : 'pointer' }}>
            <div className="qc-upload-content">
              <MdAddCircleOutline size={32} />
              <p>{loadingMoreLooks ? 'Loading…' : 'Load more looks'}</p>
            </div>
          </div>
        )}
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

                {selectedAvatar?.engineUnknown && (
                  <p style={{ margin: '0 0 12px', fontSize: 11, color: '#64748b', lineHeight: 1.45 }}>
                    Engine compatibility not specified for this look. We will pick the best engine automatically.
                  </p>
                )}

                {selectedAvatar &&
                  canUseExpressiveness(selectedAvatar, avatarEngine) && (
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
                )}
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
