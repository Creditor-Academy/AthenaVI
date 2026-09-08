import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MdAdd,
  MdClose,
  MdFilterList,
  MdGraphicEq,
  MdGridView,
  MdLock,
  MdPublic,
  MdSort,
  MdViewList,
} from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import heygenService, { isSpeechPreviewUnsupportedError } from '../../services/heygenService';
import creditsService, { isInsufficientCreditsError } from '../../services/creditsService';
import { consumeDashboardSearchContext } from '../../utils/dashboardSearchNavigate.js';
import ConfirmDialog from '../../components/ui/ConfirmDialog/ConfirmDialog.jsx';
import '../../components/features/workspace/workspace/WorkspaceStyles.css';
import VoicesSkeleton from '../page-skeleton/VoicesSkeleton';
import { VideosToolbarDropdown, LibrarySearchBar } from '../Videos/VideosToolbar.jsx';
import '../Videos/Videos.css';
import VoiceCreationCard from './VoiceCreationCard.jsx';
import VoiceLibraryCard from './VoiceLibraryCard.jsx';
import VoiceLibraryRow from './VoiceLibraryRow.jsx';
import {
  applyVoiceFilters,
  getVoiceEmptyHint,
  getVoiceEmptyTitle,
  getVoiceSectionSubtitle,
  groupVoices,
  sortVoices,
  VOICE_FILTER_OPTIONS,
  VOICE_GROUP_OPTIONS,
  VOICE_SECTION_TABS,
  VOICE_SORT_OPTIONS,
} from './voicesUtils';
import { isDeletableClonedVoice } from '../../utils/heygenDelete';
import { getSanitizedErrorMessage } from '../../utils/userFacingMessage';
import {
  extractHeygenVoiceList,
  getVoicePreviewUrlFromResponse,
  isClonedVoice,
  mapHeygenVoice,
  SPEECH_PREVIEW_UNSUPPORTED_MESSAGE,
} from '../../utils/heygenVoices';
import { showVoicePreviewUnavailableNotice } from '../../components/ui/VoicePreviewNotice/VoicePreviewNotice';
import { extractVoiceImageFromRow, fetchVoiceAvatarImageMap, resolveVoiceImage } from './voiceAvatarImages';
import HeroCarouselBanner from '../../components/ui/HeroCarouselBanner/HeroCarouselBanner';
import LoadMoreButton from '../../components/ui/LoadMoreButton/LoadMoreButton';
import heroVoicesSlide1 from '../../assets/hero_voices_slide1.jpg';
import voiceBg from '../../assets/Voice.jpg';
import aiIntegrationBg from '../../assets/AIIntegration.png';
import './Voices.css';

const TAB_ICONS = {
  public: MdPublic,
  private: MdLock,
};

function mapVoiceList(voiceList) {
  return (voiceList || [])
    .map((voice, idx) => {
      const mapped = mapHeygenVoice(voice);
      if (!mapped) return null;
      if (!mapped.id) {
        mapped.id = `voice-${idx}`;
      }
      return {
        ...mapped,
        image: extractVoiceImageFromRow(voice),
      };
    })
    .filter(Boolean);
}

function Voices({ onCreateVoice, onVoiceClick, initialFilter = 'public' }) {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [activeSection, setActiveSection] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const ctx = consumeDashboardSearchContext('voices');
    if (ctx?.searchQuery) {
      preserveSearchRef.current = ctx.searchQuery;
      setSearchQuery(ctx.searchQuery);
    }
    if (ctx?.voicesSection) setActiveSection(ctx.voicesSection);
  }, []);
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');
  const [groupBy, setGroupBy] = useState('none');
  const [selectedVoiceForTest, setSelectedVoiceForTest] = useState(null);
  const [speechText, setSpeechText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [previewCreditEstimate, setPreviewCreditEstimate] = useState(null);
  const [testModalError, setTestModalError] = useState('');
  const [voiceImageMap, setVoiceImageMap] = useState(() => new Map());
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [statusBanner, setStatusBanner] = useState(null);
  const [previewUnavailable, setPreviewUnavailable] = useState(null);
  const [previewingVoiceId, setPreviewingVoiceId] = useState(null);
  const [comingSoonToast, setComingSoonToast] = useState(false);
  const previewNoticeTimerRef = useRef(null);
  const previewAudioRef = useRef(null);
  const preserveSearchRef = useRef(null);
  const comingSoonToastTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadVoiceImages = async () => {
      try {
        const publicMap = await fetchVoiceAvatarImageMap(heygenService, { ownership: 'public' });
        let merged = new Map(publicMap);

        if (activeSection === 'private') {
          const privateMap = await fetchVoiceAvatarImageMap(heygenService, {
            ownership: 'private',
            maxPages: 2,
          });
          merged = new Map([...publicMap, ...privateMap]);
        }

        if (!cancelled) setVoiceImageMap(merged);
      } catch (err) {
        console.warn('Failed to load voice avatar images:', err);
      }
    };

    loadVoiceImages();
    return () => {
      cancelled = true;
    };
  }, [activeSection]);

  const voicesWithImages = useMemo(
    () =>
      voices.map((voice) => ({
        ...voice,
        image: resolveVoiceImage(voice, voiceImageMap),
      })),
    [voices, voiceImageMap]
  );

  const [sectionCounts, setSectionCounts] = useState({});
  const fetchRequestRef = useRef(0);

  const fetchVoices = useCallback(async () => {
    const requestId = ++fetchRequestRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await heygenService.getVoices({ type: activeSection });
      if (requestId !== fetchRequestRef.current) return;

      const voiceList = extractHeygenVoiceList(result);
      const mapped = mapVoiceList(voiceList);
      setVoices(mapped);
      setSectionCounts((prev) => ({ ...prev, [activeSection]: mapped.length }));
    } catch (err) {
      if (requestId !== fetchRequestRef.current) return;
      console.error('Failed to fetch voices:', err);
      setVoices([]);
      setError(getSanitizedErrorMessage(err, 'Failed to load voices. Please try again.'));
    } finally {
      if (requestId === fetchRequestRef.current) {
        setLoading(false);
      }
    }
  }, [activeSection]);

  const showStatusBanner = useCallback((message, tone = 'success') => {
    setStatusBanner({ message, tone });
    setTimeout(() => setStatusBanner(null), 4200);
  }, []);

  const stopVoicePreview = useCallback(() => {
    const audio = previewAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      previewAudioRef.current = null;
    }
    setPreviewingVoiceId(null);
  }, []);

  const clearPreviewUnavailable = useCallback(() => {
    if (previewNoticeTimerRef.current) {
      clearTimeout(previewNoticeTimerRef.current);
      previewNoticeTimerRef.current = null;
    }
    setPreviewUnavailable(null);
  }, []);

  useEffect(() => {
    if (preserveSearchRef.current) {
      setSearchQuery(preserveSearchRef.current);
      preserveSearchRef.current = null;
    } else {
      setSearchQuery('');
    }
    setFilterBy('all');
    stopVoicePreview();
    clearPreviewUnavailable();
    fetchVoices();
  }, [activeSection, fetchVoices, stopVoicePreview, clearPreviewUnavailable]);

  useEffect(() => {
    const processingVoices = voices.filter((v) => v.status === 'processing');
    if (processingVoices.length === 0) return;

    const intervalId = setInterval(async () => {
      const results = await Promise.all(
        processingVoices.map(async (v) => {
          try {
            const updated = await heygenService.getVoiceStatus(v.id);
            return { id: v.id, status: updated.status };
          } catch {
            return null;
          }
        })
      );

      const changes = results.filter((r) => r && r.status !== 'processing');
      if (changes.length > 0) {
        setVoices((current) =>
          current.map((v) => {
            const change = changes.find((c) => c.id === v.id);
            return change ? { ...v, status: change.status } : v;
          })
        );
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [voices]);

  const voiceHeroSlides = useMemo(
    () => [
      {
        id: 'voices-expressive',
        tag: 'Expressive Voice Engine',
        title: '300+ Lifelike AI Voices Across 140+ Languages',
        subtitle: 'Natural inflections, emotion control, and hyper-realistic accents designed for studio-grade video voiceovers.',
        ctaText: 'Explore Voices',
        onCtaClick: () => setActiveSection('public'),
        stats: [
          { value: '300+', label: 'Human Voices' },
          { value: '140+', label: 'Global Locales' },
        ],
        bgImage: heroVoicesSlide1,
        themeGlow: 'glow-cyan',
      },
      {
        id: 'voices-cloning',
        tag: 'Instant Voice Cloning',
        title: 'Clone Your Own Voice in Seconds',
        subtitle: 'Upload a short audio sample to train your digital voice clone with full tone fidelity and emotion accuracy.',
        ctaText: 'Create Voice',
        onCtaClick: () => (onCreateVoice ? onCreateVoice() : setActiveSection('private')),
        stats: [
          { value: '15 Sec', label: 'Audio Sample' },
          { value: '100%', label: 'Persona Match' },
        ],
        bgImage: voiceBg,
        themeGlow: 'glow-violet',
      },
      {
        id: 'voices-synthesis',
        tag: 'Multi-Speaker Synthesis',
        title: 'Seamless Narration & Cross-Lingual Translation',
        subtitle: 'Synthesize multi-character conversations and cross-dub narration into international languages instantly.',
        ctaText: 'Speech Preview',
        onCtaClick: () => setActiveSection('public'),
        stats: [
          { value: 'Multi-Speaker', label: 'Dialogue Support' },
          { value: 'Zero', label: 'Studio Hardware' },
        ],
        bgImage: heroVoicesSlide1,
        themeGlow: 'glow-amber',
      },
    ],
    [onCreateVoice]
  );

  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    setVisibleCount(24);
  }, [activeSection, searchQuery, filterBy, sortBy, groupBy]);

  const filteredVoices = useMemo(() => {
    const filtered = applyVoiceFilters(voicesWithImages, { searchQuery, filterBy });
    return sortVoices(filtered, sortBy);
  }, [voicesWithImages, searchQuery, filterBy, sortBy]);

  const visibleVoices = useMemo(() => {
    return filteredVoices.slice(0, visibleCount);
  }, [filteredVoices, visibleCount]);

  const voiceGroups = useMemo(
    () => groupVoices(visibleVoices, groupBy),
    [visibleVoices, groupBy]
  );

  const hasMoreVoices = visibleCount < filteredVoices.length;
  const remainingVoiceCount = filteredVoices.length - visibleCount;

  const hasSearch = Boolean(searchQuery.trim()) || filterBy !== 'all';
  const showCreateCard = activeSection === 'private' && onCreateVoice && !hasSearch;

  const openVoice = (voice) => {
    onVoiceClick?.(voice.raw || voice);
  };

  const handlePreview = async (voice) => {
    if (previewingVoiceId === voice.id) {
      stopVoicePreview();
      return;
    }

    stopVoicePreview();

    const url = voice.previewUrl || voice.raw?.previewAudioUrl || voice.raw?.preview_audio_url;
    if (!url) {
      if (previewNoticeTimerRef.current) clearTimeout(previewNoticeTimerRef.current);
      previewNoticeTimerRef.current = showVoicePreviewUnavailableNotice(setPreviewUnavailable, voice);
      return;
    }

    clearPreviewUnavailable();

    const audio = new Audio(url);
    previewAudioRef.current = audio;
    audio.onended = () => {
      setPreviewingVoiceId(null);
      previewAudioRef.current = null;
    };
    audio.onerror = () => {
      setPreviewingVoiceId(null);
      previewAudioRef.current = null;
    };

    try {
      await audio.play();
      setPreviewingVoiceId(voice.id);
      clearPreviewUnavailable();
    } catch (err) {
      console.error('Voice preview failed:', err);
      stopVoicePreview();
      if (previewNoticeTimerRef.current) clearTimeout(previewNoticeTimerRef.current);
      previewNoticeTimerRef.current = showVoicePreviewUnavailableNotice(setPreviewUnavailable, voice);
    }
  };

  useEffect(
    () => () => {
      if (previewNoticeTimerRef.current) clearTimeout(previewNoticeTimerRef.current);
      stopVoicePreview();
    },
    [stopVoicePreview]
  );

  const openVoiceTest = (voice) => {
    // TEMPORARILY DISABLED — speech preview via Starfish TTS coming soon
    // if (!voice?.supportsSpeechPreview) return;
    // setTestModalError('');
    // setPreviewCreditEstimate(null);
    // setSpeechText('');
    // setSelectedVoiceForTest(voice);
    setComingSoonToast(true);
    if (comingSoonToastTimer.current) clearTimeout(comingSoonToastTimer.current);
    comingSoonToastTimer.current = setTimeout(() => setComingSoonToast(false), 3000);
  };

  useEffect(() => {
    if (!selectedVoiceForTest || !speechText.trim()) {
      setPreviewCreditEstimate(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      creditsService
        .getPersonalEstimate({ feature: 'voice_preview', text: speechText.trim() })
        .then((estimate) => {
          if (!cancelled) setPreviewCreditEstimate(estimate);
        })
        .catch(() => {
          if (!cancelled) setPreviewCreditEstimate(null);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedVoiceForTest, speechText]);

  const handleSpeechSynthesis = async () => {
    if (!speechText.trim() || !selectedVoiceForTest) return;
    if (!selectedVoiceForTest.supportsSpeechPreview) {
      setTestModalError(SPEECH_PREVIEW_UNSUPPORTED_MESSAGE);
      return;
    }

    setIsSynthesizing(true);
    setTestModalError('');
    try {
      const res = await heygenService.previewSpeech({
        text: speechText,
        voice_id: selectedVoiceForTest.id,
        input_type: 'text',
        speed: 1,
      });
      const audioUrl = getVoicePreviewUrlFromResponse(res);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        setTestModalError('Preview audio was not returned. Try again.');
      }
    } catch (err) {
      console.error('Synthesis failed:', err);
      if (isInsufficientCreditsError(err)) {
        setTestModalError('Insufficient credits for voice preview.');
      } else if (isSpeechPreviewUnsupportedError(err)) {
        setTestModalError(SPEECH_PREVIEW_UNSUPPORTED_MESSAGE);
      } else {
        setTestModalError(getSanitizedErrorMessage(err, 'Could not generate speech preview.'));
      }
    } finally {
      setIsSynthesizing(false);
    }
  };

  const requestDeleteVoice = (voice, event) => {
    event?.stopPropagation?.();
    if (activeSection !== 'private' || !isDeletableClonedVoice(voice)) return;
    setConfirmDialog({
      title: 'Delete voice',
      message: `Permanently delete cloned voice ${voice.name}? This cannot be undone.`,
      confirmLabel: 'Delete voice',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await heygenService.deleteVoice(voice.id);
          showStatusBanner(`Deleted voice "${voice.name}".`, 'success');
          fetchVoices();
        } catch (err) {
          showStatusBanner(getSanitizedErrorMessage(err, 'Failed to delete voice.'), 'error');
        }
      },
    });
  };

  const renderVoiceCollection = (collection) => (
    <div
      className={`items-container videos-export-items voices-library-items ${
        viewMode === 'grid' ? 'tile-view' : 'list-view export-list-view'
      }`}
    >
      {viewMode === 'list' ? (
        <div className="list-header export-list-header">
          <div className="col" />
          <div className="col">Name</div>
          <div className="col">Language</div>
          <div className="col">Gender</div>
          <div className="col">Status</div>
          <div className="col" />
          <div className="col" />
        </div>
      ) : null}

      {showCreateCard && viewMode === 'grid' ? (
        <VoiceCreationCard onClick={onCreateVoice} />
      ) : null}

      {collection.map((voice) =>
        viewMode === 'grid' ? (
          <VoiceLibraryCard
            key={voice.id}
            voice={voice}
            onOpen={openVoice}
            onPreview={handlePreview}
            onTest={openVoiceTest}
            isPreviewPlaying={previewingVoiceId === voice.id}
            previewUnavailableReason={
              previewUnavailable?.voiceId === voice.id ? previewUnavailable.reason : null
            }
            showTestButton={voice.supportsSpeechPreview}
            clonePreviewTooltip={isClonedVoice(voice) ? true : false}
            canDelete={activeSection === 'private' && isDeletableClonedVoice(voice)}
            onDelete={requestDeleteVoice}
          />
        ) : (
          <VoiceLibraryRow
            key={voice.id}
            voice={voice}
            onOpen={openVoice}
            onPreview={handlePreview}
            onTest={openVoiceTest}
            isPreviewPlaying={previewingVoiceId === voice.id}
            previewUnavailableReason={
              previewUnavailable?.voiceId === voice.id ? previewUnavailable.reason : null
            }
            showTestButton={voice.supportsSpeechPreview}
            clonePreviewTooltip={isClonedVoice(voice) ? true : false}
            canDelete={activeSection === 'private' && isDeletableClonedVoice(voice)}
            onDelete={requestDeleteVoice}
          />
        )
      )}
    </div>
  );

  return (
    <div className="videos-page voices-page">
      <div className="videos-shell">
        <header className="videos-page-header">
          <div className="videos-title-section">
            <h1 className="videos-page-title">Voices</h1>
            <p className="videos-page-subtitle">{getVoiceSectionSubtitle(activeSection)}</p>
          </div>
          <div className="videos-actions page-header-actions">
            <LibrarySearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search voices by name or language…"
              ariaLabel="Search voices"
            />

            <VideosToolbarDropdown
              label="Filter"
              icon={MdFilterList}
              value={filterBy}
              defaultValue="all"
              options={VOICE_FILTER_OPTIONS}
              onChange={setFilterBy}
              menuLabel="Filter voices"
            />

            <div className="view-toggle" role="group" aria-label="View mode">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                type="button"
              >
                <MdGridView size={18} />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
                type="button"
              >
                <MdViewList size={18} />
              </button>
            </div>

            <VideosToolbarDropdown
              label="Sort"
              icon={MdSort}
              value={sortBy}
              defaultValue="name_asc"
              options={VOICE_SORT_OPTIONS}
              onChange={setSortBy}
              menuLabel="Sort voices"
            />

            {activeSection === 'private' && onCreateVoice ? (
              <button
                type="button"
                className="videos-create-btn"
                onClick={onCreateVoice}
              >
                <MdAdd size={18} />
                <span>Create Voice</span>
              </button>
            ) : null}
          </div>
        </header>

        <div
          className="workspace-root-tabs-wrapper work-root-tabs-wrapper"
          role="tablist"
          aria-label="Voice sections"
        >
          <div className="workspace-root-tabs">
            {VOICE_SECTION_TABS.map((tab) => {
              const Icon = TAB_ICONS[tab.id];
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`workspace-root-tab ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveSection(tab.id)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <main className="videos-main">
          <HeroCarouselBanner slides={voiceHeroSlides} />
          {statusBanner ? (
            <div className={`voices-status-banner voices-status-banner--${statusBanner.tone}`} role="status">
              {statusBanner.message}
            </div>
          ) : null}
          {loading ? (
            <VoicesSkeleton viewMode={viewMode} showCreateCard={showCreateCard} />
          ) : error ? (
            <div className="videos-empty-state">
              <div className="videos-empty-state__card">
                <span className="videos-empty-state__icon-wrap" aria-hidden>
                  <MdGraphicEq size={28} />
                </span>
                <p className="videos-empty-state__eyebrow">Could not load</p>
                <h3 className="videos-empty-state__title">Failed to load voices</h3>
                <p className="videos-empty-state__description">{error}</p>
                <button type="button" className="videos-empty-state__cta" onClick={fetchVoices}>
                  Try again
                </button>
              </div>
            </div>
          ) : filteredVoices.length === 0 && !showCreateCard ? (
            <div className="videos-empty-state">
              <div className="videos-empty-state__card">
                <span className="videos-empty-state__icon-wrap" aria-hidden>
                  <MdGraphicEq size={28} />
                </span>
                <p className="videos-empty-state__eyebrow">
                  {hasSearch ? 'No results' : 'Nothing here yet'}
                </p>
                <h3 className="videos-empty-state__title">
                  {getVoiceEmptyTitle(activeSection, hasSearch)}
                </h3>
                <p className="videos-empty-state__description">
                  {getVoiceEmptyHint(activeSection, hasSearch)}
                </p>
                {!hasSearch && activeSection === 'private' && onCreateVoice ? (
                  <button
                    type="button"
                    className="videos-empty-state__cta"
                    onClick={onCreateVoice}
                  >
                    <MdAdd size={16} aria-hidden />
                    Create Voice
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="videos-groups">
              {voiceGroups.map((group) => (
                <section key={group.key} className="videos-group">
                  {group.label ? (
                    <h3 className="videos-group__heading">{group.label}</h3>
                  ) : null}
                  {renderVoiceCollection(group.voices)}
                </section>
              ))}
            </div>
          )}

          {hasMoreVoices && !loading ? (
            <LoadMoreButton
              onClick={() => setVisibleCount((prev) => prev + 24)}
              label="Load more voices"
              remainingCount={remainingVoiceCount}
            />
          ) : null}
        </main>
      </div>

      {/* SPEECH PREVIEW MODAL — temporarily disabled, coming soon
      {selectedVoiceForTest ? (
        <div
          className="voice-modal-overlay"
          onClick={() => {
            setSelectedVoiceForTest(null);
            setTestModalError('');
          }}
          role="presentation"
        >
          <div
            className="voice-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="voice-test-title"
          >
            <header className="voice-modal-header">
              <div>
                <h3 id="voice-test-title">Preview with text</h3>
                <p>
                  Preview speech for: <strong>{selectedVoiceForTest.name}</strong>
                </p>
              </div>
              <button
                type="button"
                className="voice-modal-close"
                onClick={() => {
                  setSelectedVoiceForTest(null);
                  setTestModalError('');
                }}
                aria-label="Close"
              >
                <MdClose size={24} />
              </button>
            </header>

            <div className="voice-modal-body">
              <div className="input-group">
                <label htmlFor="voice-test-text">Speech text</label>
                <textarea
                  id="voice-test-text"
                  placeholder="Type a sentence to hear how this voice sounds..."
                  value={speechText}
                  onChange={(e) => setSpeechText(e.target.value)}
                  maxLength={500}
                />
                <span className="char-counter">{speechText.length}/500</span>
              </div>

              {previewCreditEstimate?.estimatedCredits != null ||
              previewCreditEstimate?.credits != null ||
              previewCreditEstimate?.cost != null ? (
                <p className="voice-modal-credit-estimate">
                  Estimated cost:{' '}
                  {previewCreditEstimate.estimatedCredits ??
                    previewCreditEstimate.credits ??
                    previewCreditEstimate.cost}{' '}
                  credit
                  {Number(
                    previewCreditEstimate.estimatedCredits ??
                      previewCreditEstimate.credits ??
                      previewCreditEstimate.cost
                  ) === 1
                    ? ''
                    : 's'}
                </p>
              ) : null}

              {testModalError ? (
                <p className="voice-modal-error" role="alert">
                  {testModalError}
                </p>
              ) : null}

              <button
                type="button"
                className={`voice-modal-submit ${isSynthesizing ? 'loading' : ''}`}
                onClick={handleSpeechSynthesis}
                disabled={isSynthesizing || !speechText.trim()}
              >
                {isSynthesizing ? (
                  <>
                    <Loader2 size={20} className="spin-animation" />
                    Generating preview…
                  </>
                ) : (
                  <>
                    <MdGraphicEq size={20} />
                    Generate &amp; Play Preview
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      END SPEECH PREVIEW MODAL */}

      {comingSoonToast && (
        <div className="voice-coming-soon-toast" role="status" aria-live="polite">
          <MdGraphicEq size={18} />
          <span>Text-to-speech preview — <strong>coming soon</strong></span>
        </div>
      )}
      <ConfirmDialog dialog={confirmDialog} onCancel={() => setConfirmDialog(null)} />
    </div>
  );
}

export default Voices;
