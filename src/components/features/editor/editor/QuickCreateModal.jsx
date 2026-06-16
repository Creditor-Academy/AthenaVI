import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  MdClose,
  MdChevronRight,
  MdChevronLeft,
  MdAutoAwesome,
  MdSearch,
  MdRecordVoiceOver,
  MdSkipNext,
  MdLayers,
  MdPalette,
  MdMonitor,
  MdPhoneAndroid,
  MdTune,
  MdPlayArrow,
  MdPause,
} from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import heygenService from '../../../../services/heygenService';
import {
  AVATAR_IV_ENGINE,
  AVATAR_V_ENGINE,
  LEGACY_V2_ENGINE,
  extractHeygenList,
  formatLookBadgeLabel,
  LOOK_ENGINE_FILTERS,
  getGeneratableLooks,
  getGeneratableLookCount,
  mapAvatarGroup,
  mapAvatarLook,
  mergeAvatarLooksPages,
  normalizeAvatarEngine,
  parseAvatarLooksResponse,
  resolveGroupGeneratableLooks,
  mapResolvedLooks,
  fetchMappedGroupLooks,
  getLooksApiGroupId,
  isDeclaredSingleLookGroup,
  isSingleAppearanceGroup,
  finalizeVideoCreatePayload,
  canUseExpressiveness,
  resolveAvatarEngine,
} from '../../../../utils/heygenAvatars';
import './QuickCreateModal.css';

const VOICE_PREVIEW_SAMPLE =
  'Hello! This is a quick preview of how this voice sounds for your video narration.';

const AVATAR_DISPLAY_PAGE = 10;
const TOTAL_STEPS = 5;
const GENERATING_STEP = 6;
const STEP_LABELS = ['Presenter', 'Look', 'Voice', 'Script', 'Settings'];

const mapVoiceFromApi = (voice) => ({
  id: voice.voice_id || voice.voiceId || voice.id,
  name: voice.name || voice.voice_name || voice.display_name || 'AI Voice',
  gender: voice.gender || 'Unknown',
  language: voice.language || voice.language_code || voice.language_name || 'English (US)',
  previewUrl: voice.preview_audio_url || voice.preview_url || voice.preview_audio || null,
});

const BACKGROUND_COLOR_PALETTE = [
  {
    id: 'neutrals',
    label: 'Neutrals',
    colors: [
      { color: '#ffffff', label: 'White' },
      { color: '#f8fafc', label: 'Off white' },
      { color: '#f1f5f9', label: 'Light gray' },
      { color: '#e2e8f0', label: 'Silver' },
      { color: '#94a3b8', label: 'Slate' },
      { color: '#64748b', label: 'Gray' },
      { color: '#334155', label: 'Charcoal' },
      { color: '#101828', label: 'Near black' },
      { color: '#000000', label: 'Black' },
    ],
  },
  {
    id: 'blues',
    label: 'Blues',
    colors: [
      { color: '#eff6ff', label: 'Ice' },
      { color: '#dbeafe', label: 'Sky' },
      { color: '#93c5fd', label: 'Periwinkle' },
      { color: '#3b82f6', label: 'Blue' },
      { color: '#1d4ed8', label: 'Royal blue' },
      { color: '#1e3a8a', label: 'Navy' },
    ],
  },
  {
    id: 'greens',
    label: 'Greens',
    colors: [
      { color: '#ecfdf5', label: 'Frost' },
      { color: '#dcfce7', label: 'Mint' },
      { color: '#86efac', label: 'Sage' },
      { color: '#22c55e', label: 'Green' },
      { color: '#166534', label: 'Forest' },
      { color: '#0f766e', label: 'Teal' },
    ],
  },
  {
    id: 'purples',
    label: 'Purples',
    colors: [
      { color: '#faf5ff', label: 'Lilac' },
      { color: '#ede9fe', label: 'Lavender' },
      { color: '#c4b5fd', label: 'Violet' },
      { color: '#5b3a7a', label: 'Brand' },
      { color: '#7c3aed', label: 'Purple' },
      { color: '#4c1d95', label: 'Plum' },
    ],
  },
  {
    id: 'warm',
    label: 'Warm',
    colors: [
      { color: '#fffbeb', label: 'Ivory' },
      { color: '#fef3c7', label: 'Cream' },
      { color: '#fde68a', label: 'Butter' },
      { color: '#f59e0b', label: 'Amber' },
      { color: '#d4a373', label: 'Sand' },
      { color: '#ea580c', label: 'Orange' },
    ],
  },
  {
    id: 'accent',
    label: 'Accent',
    colors: [
      { color: '#fff1f2', label: 'Petal' },
      { color: '#fecdd3', label: 'Blush' },
      { color: '#fda4af', label: 'Pink' },
      { color: '#f43f5e', label: 'Rose' },
      { color: '#e11d48', label: 'Crimson' },
      { color: '#881337', label: 'Wine' },
    ],
  },
];

const QuickCreateModal = ({ isOpen, onClose, onGenerate }) => {
  const [step, setStep] = useState(1);
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
  const [avatarSearch, setAvatarSearch] = useState('');
  const [skipVoice, setSkipVoice] = useState(false);
  const [activeColorCategory, setActiveColorCategory] = useState('neutrals');
  const [previewingVoiceId, setPreviewingVoiceId] = useState(null);
  const [previewLoadingVoiceId, setPreviewLoadingVoiceId] = useState(null);
  const [looksDisplayLimit, setLooksDisplayLimit] = useState(AVATAR_DISPLAY_PAGE);
  const previewAudioRef = useRef(null);

  const stopVoicePreview = useCallback(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setPreviewingVoiceId(null);
    setPreviewLoadingVoiceId(null);
  }, []);

  const resetAvatarPicker = useCallback(() => {
    setSelectedGroup(null);
    setSelectedAvatar(null);
    setLooks([]);
    setLooksError('');
    setLooksHasMore(false);
    setLooksNextToken(null);
    setLooksPageData(null);
    setLookEngineFilter(LOOK_ENGINE_FILTERS.ALL);
    setLooksDisplayLimit(AVATAR_DISPLAY_PAGE);
    setAvatarSearch('');
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopVoicePreview();
      setStep(1);
      setSkipVoice(false);
      setSelectedVoice(null);
      setVoiceSearch('');
      setAvatarSearch('');
      setActiveColorCategory('neutrals');
      setLooksDisplayLimit(AVATAR_DISPLAY_PAGE);
      resetAvatarPicker();
      return;
    }
    if (step === 1 && groups.length === 0) {
      fetchGroups();
    }
  }, [isOpen, step, groups.length, resetAvatarPicker, stopVoicePreview]);

  useEffect(() => {
    if (isOpen && step === 3 && voices.length === 0) {
      fetchVoices();
    }
  }, [isOpen, step, voices.length]);

  useEffect(() => {
    if (!isOpen || step !== 2 || !selectedGroup) return;
    loadLooksForGroup(selectedGroup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step, selectedGroup?.id]);

  useEffect(() => {
    if (!selectedAvatar?.id) return;
    stopVoicePreview();
    setSelectedVoice(null);
    setSkipVoice(false);
  }, [selectedAvatar?.id, stopVoicePreview]);

  const applyAvatarDefaultVoice = useCallback(async () => {
    const defaultVoiceId = selectedAvatar?.defaultVoiceId;
    if (!defaultVoiceId) return;

    const fromList = voices.find((voice) => voice.id === defaultVoiceId);
    if (fromList) {
      setSelectedVoice(fromList);
      setSkipVoice(false);
      return;
    }

    try {
      const detail = await heygenService.getVoiceStatus(defaultVoiceId);
      const data = detail?.data ?? detail ?? {};
      const mapped = mapVoiceFromApi({
        ...data,
        voice_id: defaultVoiceId,
        id: defaultVoiceId,
        name: data.name || data.voice_name || selectedAvatar.defaultVoiceName,
        voice_name: data.voice_name || selectedAvatar.defaultVoiceName,
      });
      if (!mapped.id) return;

      setVoices((prev) =>
        prev.some((voice) => voice.id === mapped.id) ? prev : [mapped, ...prev]
      );
      setSelectedVoice(mapped);
      setSkipVoice(false);
    } catch (err) {
      console.warn('Could not load default voice for presenter:', err);
      const fallback = mapVoiceFromApi({
        voice_id: defaultVoiceId,
        id: defaultVoiceId,
        name: selectedAvatar.defaultVoiceName || 'Default voice',
      });
      setVoices((prev) =>
        prev.some((voice) => voice.id === fallback.id) ? prev : [fallback, ...prev]
      );
      setSelectedVoice(fallback);
      setSkipVoice(false);
    }
  }, [selectedAvatar, voices]);

  useEffect(() => {
    if (!isOpen || step !== 3) return;
    if (!selectedAvatar?.defaultVoiceId) return;
    if (skipVoice || selectedVoice) return;
    if (loadingVoices) return;

    applyAvatarDefaultVoice();
  }, [
    isOpen,
    step,
    selectedAvatar?.id,
    selectedAvatar?.defaultVoiceId,
    skipVoice,
    selectedVoice,
    loadingVoices,
    applyAvatarDefaultVoice,
  ]);

  useEffect(() => {
    const handleVideoGenerated = () => {
      if (step === GENERATING_STEP) {
        onClose();
        setTimeout(() => setStep(1), 500);
      }
    };
    const handleGenerationFailed = () => {
      if (step === GENERATING_STEP) setStep(TOTAL_STEPS);
    };
    window.addEventListener('open-generated-video', handleVideoGenerated);
    window.addEventListener('generation-failed', handleGenerationFailed);
    return () => {
      window.removeEventListener('open-generated-video', handleVideoGenerated);
      window.removeEventListener('generation-failed', handleGenerationFailed);
    };
  }, [step, onClose]);

  const mapGroupList = (responseData) =>
    extractHeygenList(responseData, ['avatar_groups', 'groups'])
      .map(mapAvatarGroup)
      .filter((group) => group.id);

  const extractGroupsPagination = (responseData) => {
    const data = responseData?.data ?? responseData ?? {};
    return {
      hasMore: !!(data?.has_more ?? responseData?.has_more ?? data?.hasMore ?? responseData?.hasMore),
      nextToken:
        data?.token ??
        responseData?.token ??
        data?.next_token ??
        responseData?.next_token ??
        null,
    };
  };

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const responseData = await heygenService.getAvatarGroups({
        ownership: 'public',
        limit: AVATAR_DISPLAY_PAGE,
      });
      const pagination = extractGroupsPagination(responseData);
      setGroups(mapGroupList(responseData));
      setGroupsHasMore(pagination.hasMore);
      setGroupsNextToken(pagination.nextToken);
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
        limit: AVATAR_DISPLAY_PAGE,
        token: groupsNextToken,
      });
      const pagination = extractGroupsPagination(responseData);
      const mapped = mapGroupList(responseData);
      setGroups((prev) => {
        const seen = new Set(prev.map((group) => group.id));
        const next = [...prev];
        mapped.forEach((group) => {
          if (!seen.has(group.id)) next.push(group);
        });
        return next;
      });
      setGroupsHasMore(pagination.hasMore);
      setGroupsNextToken(pagination.nextToken);
    } catch (err) {
      console.error('Failed to load more avatar groups:', err);
      setGroupsHasMore(false);
      setGroupsNextToken(null);
    } finally {
      setLoadingMoreGroups(false);
    }
  };

  const applyLooksDisplay = useCallback((pageData, filter, group) => {
    const groupName = group?.name || 'Look';
    let rawList = resolveGroupGeneratableLooks(pageData, group);

    if (filter !== LOOK_ENGINE_FILTERS.ALL) {
      const filtered = getGeneratableLooks(
        { ...pageData, allLooks: rawList, lookCount: rawList.length },
        filter
      );
      if (filtered.length > 0) rawList = filtered;
    }

    const mapped = rawList
      .map((look) => mapAvatarLook(look, groupName, pageData))
      .filter((l) => l.id);
    setLooks(mapped);
    if (mapped.length === 0) {
      const filterLabels = {
        [LOOK_ENGINE_FILTERS.ALL]: 'supported',
        [LOOK_ENGINE_FILTERS.AVATAR_IV]: 'Avatar IV',
        [LOOK_ENGINE_FILTERS.AVATAR_V]: 'Avatar V',
        [LOOK_ENGINE_FILTERS.LEGACY_V2]: 'Expressive',
      };
      setLooksError(`No ${filterLabels[filter] || 'supported'} looks for this character. Try another character or engine.`);
    } else {
      setLooksError('');
    }
  }, []);

  const handleLookEngineFilter = (filter) => {
    setLookEngineFilter(filter);
    if (looksPageData && selectedGroup) {
      applyLooksDisplay(looksPageData, filter, selectedGroup);
    }
  };

  const applyLookSelection = useCallback((mappedLook, group, pageData = looksPageData) => {
    setSelectedGroup(group);
    setSelectedAvatar(mappedLook);
    setAvatarEngine(
      mappedLook.generatableEngine ||
        finalizeVideoCreatePayload({
          avatarId: mappedLook.id,
          avatarType: mappedLook.avatarType,
          avatarEngine: mappedLook.generatableEngine,
          isLegacyV2: mappedLook.isLegacyV2,
          supportedEngines: mappedLook.supportedEngines,
        })
    );
  }, [looksPageData]);

  const applySingleLookSelection = useCallback(
    (mappedLook, group, pageData = looksPageData) => {
      setLooks([mappedLook]);
      applyLookSelection(mappedLook, group, pageData);
      setLooksError('');
    },
    [applyLookSelection, looksPageData]
  );

  const selectPresenterGroup = (group) => {
    setSelectedGroup(group);
    setSelectedAvatar(null);
    setLooks([]);
    setLooksPageData(null);
    setLooksError('');
    setLooksHasMore(false);
    setLooksNextToken(null);
    setLookEngineFilter(LOOK_ENGINE_FILTERS.ALL);
    setLooksDisplayLimit(AVATAR_DISPLAY_PAGE);
  };

  const loadLooksForGroup = async (group) => {
    const groupId = getLooksApiGroupId(group);
    if (!groupId) {
      setLooksError('Could not resolve presenter id for looks.');
      setLooks([]);
      setSelectedAvatar(null);
      return;
    }

    setLoadingLooks(true);
    setLooksError('');
    setLooksDisplayLimit(AVATAR_DISPLAY_PAGE);

    const prefetchMapped = mapResolvedLooks(null, group, group.name);
    if (prefetchMapped.length >= 1) {
      applySingleLookSelection(prefetchMapped[0], group, null);
    }

    try {
      const { parsed, mappedLooks } = await fetchMappedGroupLooks(heygenService, group, {
        limit: 20,
      });

      if (mappedLooks.length === 0) {
        setLooks([]);
        setLooksPageData(null);
        setLooksError('No supported looks for this character. Go back and try another presenter.');
        setLooksHasMore(false);
        setLooksNextToken(null);
        setSelectedAvatar(null);
        return;
      }

      setLooksPageData(parsed);
      setLookEngineFilter(LOOK_ENGINE_FILTERS.ALL);
      setLooks(mappedLooks);
      setLooksHasMore(!!parsed?.hasMore);
      setLooksNextToken(parsed?.nextToken ?? null);
      setLooksError('');

      if (mappedLooks.length === 1 || isSingleAppearanceGroup(parsed, group) || isDeclaredSingleLookGroup(group)) {
        applyLookSelection(mappedLooks[0], group, parsed);
      }
    } catch (err) {
      console.error('Failed to load avatar looks:', err);
      const fallbackMapped = mapResolvedLooks(null, group, group.name);
      if (fallbackMapped.length >= 1) {
        setLooks(fallbackMapped);
        applyLookSelection(fallbackMapped[0], group, null);
        setLooksPageData(null);
        setLooksHasMore(false);
        setLooksNextToken(null);
        setLooksError('');
      } else {
        setLooks([]);
        setLooksPageData(null);
        setLooksError('Could not load looks. Please try again.');
        setLooksHasMore(false);
        setLooksNextToken(null);
        setSelectedAvatar(null);
      }
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
        ownership: 'public',
        limit: 20,
        token: looksNextToken,
      });
      const nextParsed = parseAvatarLooksResponse(responseData);
      const merged = mergeAvatarLooksPages(looksPageData, nextParsed);
      setLooksPageData(merged);
      applyLooksDisplay(merged, lookEngineFilter, selectedGroup);
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

  const handleLoadMoreGroups = async () => {
    if (loadingMoreGroups) return;
    await loadMoreGroups();
  };

  const handleLoadMoreLooks = async () => {
    if (loadingMoreLooks) return;

    if (looksDisplayLimit < looks.length) {
      setLooksDisplayLimit((prev) => prev + AVATAR_DISPLAY_PAGE);
      return;
    }

    if (!looksHasMore || !looksNextToken) return;

    await loadMoreLooks();
    setLooksDisplayLimit((prev) => prev + AVATAR_DISPLAY_PAGE);
  };

  const fetchVoices = async () => {
    setLoadingVoices(true);
    try {
      const responseData = await heygenService.getVoices({
        type: 'public',
        limit: 100,
      });
      const voiceList = extractHeygenList(responseData, ['voices']);
      const mappedVoices = voiceList.map(mapVoiceFromApi).filter((voice) => voice.id);
      setVoices(mappedVoices);
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

  const filteredGroups = useMemo(() => {
    const query = avatarSearch.trim().toLowerCase();
    if (!query) return groups;
    return groups.filter((group) => group.name.toLowerCase().includes(query));
  }, [groups, avatarSearch]);

  const filteredLooks = useMemo(() => {
    const query = avatarSearch.trim().toLowerCase();
    if (!query) return looks.slice(0, looksDisplayLimit);
    return looks.filter((look) => look.name.toLowerCase().includes(query));
  }, [looks, looksDisplayLimit, avatarSearch]);

  const buildGeneratePayload = () => {
    const avatarKind = selectedAvatar.avatarType || 'studio_avatar';
    const resolvedEngine = finalizeVideoCreatePayload({
      avatarId: selectedAvatar.id,
      avatarType: avatarKind,
      avatarEngine: selectedAvatar.generatableEngine || avatarEngine,
      isLegacyV2: selectedAvatar.isLegacyV2,
      supportedEngines: selectedAvatar.supportedEngines,
    });
    const includeExpressiveness = canUseExpressiveness(
      {
        id: selectedAvatar.id,
        avatar_type: avatarKind,
        supportedEngines: selectedAvatar.supportedEngines,
        isLegacyV2: selectedAvatar.isLegacyV2,
      },
      resolvedEngine
    );

    return {
      avatarLookId: selectedAvatar.id,
      avatarGroupId: selectedGroup?.id,
      avatarImage: selectedAvatar.image,
      avatarName: selectedAvatar.name,
      avatarTypeLabel: avatarKind,
      avatarEngine: resolvedEngine,
      supportedEngines: selectedAvatar.supportedEngines,
      isLegacyV2: selectedAvatar.isLegacyV2,
      engineUnknown: selectedAvatar.engineUnknown,
      voiceId: skipVoice ? null : selectedVoice?.id,
      voiceName: skipVoice ? null : selectedVoice?.name,
      skipVoice,
      script,
      removeBackground,
      backgroundColor,
      aspectRatio,
      ...(includeExpressiveness ? { expressiveness } : {}),
    };
  };

  const canProceedFromVoice = skipVoice || !!selectedVoice;

  const handleGenerate = () => {
    if (!selectedAvatar?.id || !script.trim()) {
      alert('Please select a presenter look and provide a script.');
      return;
    }
    if (!skipVoice && !selectedVoice) {
      alert('Please select a voice or choose Skip voice for now.');
      return;
    }
    const payload = buildGeneratePayload();
    if (skipVoice) {
      onGenerate(payload);
      onClose();
      return;
    }
    setStep(GENERATING_STEP);
    onGenerate(payload);
  };

  const handleSelectVoice = (voice) => {
    setSkipVoice(false);
    setSelectedVoice(voice);
  };

  const handleSkipVoice = () => {
    setSkipVoice(true);
    setSelectedVoice(null);
    stopVoicePreview();
  };

  const playVoicePreview = async (e, voice) => {
    e.stopPropagation();

    if (previewingVoiceId === voice.id) {
      stopVoicePreview();
      return;
    }

    stopVoicePreview();
    setPreviewLoadingVoiceId(voice.id);

    try {
      let audioUrl = voice.previewUrl;

      if (!audioUrl) {
        const res = await heygenService.previewSpeech({
          text: VOICE_PREVIEW_SAMPLE,
          voice_id: voice.id,
        });
        audioUrl = res?.preview_audio_url || res?.audio_url || res?.url;
      }

      if (!audioUrl) {
        alert('Preview audio is not available for this voice.');
        return;
      }

      const audio = new Audio(audioUrl);
      previewAudioRef.current = audio;
      audio.onended = () => {
        setPreviewingVoiceId(null);
        previewAudioRef.current = null;
      };
      audio.onerror = () => {
        setPreviewingVoiceId(null);
        previewAudioRef.current = null;
      };

      await audio.play();
      setPreviewingVoiceId(voice.id);
    } catch (err) {
      console.error('Voice preview failed:', err);
      alert('Could not play voice preview. Try again in a moment.');
    } finally {
      setPreviewLoadingVoiceId(null);
    }
  };

  const activePaletteCategory = useMemo(
    () => BACKGROUND_COLOR_PALETTE.find((cat) => cat.id === activeColorCategory)
      || BACKGROUND_COLOR_PALETTE[0],
    [activeColorCategory]
  );

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const expressivenessOptions = [
    { id: 'low', label: 'Low', hint: 'Formal, subtle delivery' },
    { id: 'medium', label: 'Medium', hint: 'Natural presentation' },
    { id: 'high', label: 'High', hint: 'Dynamic, expressive' },
  ];

  const showExpressiveness =
    selectedAvatar && canUseExpressiveness(selectedAvatar, avatarEngine);

  if (!isOpen) return null;

  const renderHeader = () => {
    const titles = [
      {
        title: 'Choose your presenter',
        subtitle: 'Pick the character you want for this video.',
      },
      {
        title: selectedGroup?.name ? `Choose a look for ${selectedGroup.name}` : 'Choose avatar look',
        subtitle: 'Select the appearance your presenter will use in the video.',
      },
      {
        title: 'Select a voice',
        subtitle: skipVoice
          ? 'Voice skipped — you can add one later before generating video.'
          : selectedVoice
            ? `Default voice for ${selectedAvatar?.name || 'this presenter'} is pre-selected. Change it below if you like.`
            : 'Pick a voice for narration, or skip and configure later.',
      },
      { title: 'Write your script', subtitle: 'Enter what your presenter should say.' },
      { title: 'Video settings', subtitle: 'Background, format, and delivery options.' },
      { title: 'Generating video', subtitle: 'This may take a few moments.' },
    ];

    const current = titles[step - 1] || titles[0];

    return (
      <div className="qc-header">
        <div className="qc-header-top">
          <div className="qc-brand">
            <span className="qc-brand-title">Quick Create</span>
            <span className="qc-brand-step">
              Step {Math.min(step, TOTAL_STEPS)} of {TOTAL_STEPS}
            </span>
          </div>
          <button
            type="button"
            className="qc-close-btn"
            onClick={onClose}
            disabled={step === GENERATING_STEP}
            aria-label="Close"
          >
            <MdClose size={20} />
          </button>
        </div>

        <div className="qc-step-nav" aria-hidden={step === GENERATING_STEP}>
          {STEP_LABELS.map((label, index) => {
            const stepNum = index + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div
                key={label}
                className={`qc-step-pill ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              >
                <span className="qc-step-pill-num">{stepNum}</span>
                <span className="qc-step-pill-label">{label}</span>
              </div>
            );
          })}
        </div>

        {(current.title || current.subtitle) && (
          <div className="qc-title-area">
            {current.title && <h2 className="qc-title">{current.title}</h2>}
            {current.subtitle && <p className="qc-subtitle">{current.subtitle}</p>}

            {step === 2 && looksPageData && (
              <div className="qc-engine-filters">
                {[
                  {
                    id: LOOK_ENGINE_FILTERS.ALL,
                    label: 'All supported',
                    count: getGeneratableLookCount(looksPageData),
                  },
                  { id: LOOK_ENGINE_FILTERS.AVATAR_IV, label: 'Avatar IV', count: looksPageData.engineCounts.avatar_iv },
                  { id: LOOK_ENGINE_FILTERS.AVATAR_V, label: 'Avatar V', count: looksPageData.engineCounts.avatar_v },
                  ...(looksPageData.engineCounts.legacy_v2 > 0
                    ? [{ id: LOOK_ENGINE_FILTERS.LEGACY_V2, label: 'Expressive', count: looksPageData.engineCounts.legacy_v2 }]
                    : []),
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className={`qc-engine-chip ${lookEngineFilter === chip.id ? 'active' : ''}`}
                    onClick={() => handleLookEngineFilter(chip.id)}
                  >
                    {chip.label} ({chip.count})
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAvatarSearchBar = (placeholder) => (
    <div className="qc-avatar-toolbar">
      <div className="qc-search-box">
        <MdSearch size={18} />
        <input
          type="search"
          placeholder={placeholder}
          value={avatarSearch}
          onChange={(e) => setAvatarSearch(e.target.value)}
          aria-label={placeholder}
        />
      </div>
    </div>
  );

  const renderPresenterStep = () => {
    if (loadingGroups) {
      return (
        <div className="qc-loading">
          <Loader2 className="qc-spinner" size={32} />
          <p>Loading presenters…</p>
        </div>
      );
    }
    if (groups.length === 0) {
      return (
        <div className="qc-loading">
          <p>No presenters available. Check your HeyGen connection.</p>
        </div>
      );
    }
    const showMoreGroups =
      !avatarSearch.trim() && groupsHasMore && !!groupsNextToken;

    return (
      <>
        {renderAvatarSearchBar('Search presenters by name...')}
        {filteredGroups.length === 0 ? (
          <div className="qc-loading">
            <p>No presenters match &ldquo;{avatarSearch.trim()}&rdquo;.</p>
          </div>
        ) : (
          <div className="qc-avatar-grid premium-scrollbar">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className={`qc-avatar-card ${selectedGroup?.id === group.id ? 'selected' : ''}`}
                onClick={() => selectPresenterGroup(group)}
              >
                <div className="qc-avatar-img-wrap">
                  <img src={group.image} alt={group.name} />
                  {selectedGroup?.id === group.id && (
                    <div className="qc-avatar-check">✓</div>
                  )}
                </div>
                <div className="qc-avatar-info">
                  <h4 className={selectedGroup?.id === group.id ? 'text-primary' : ''}>
                    {group.name}
                  </h4>
                  <p>
                    {selectedGroup?.id === group.id
                      ? 'Selected'
                      : group.subtitle || 'Select presenter'}
                  </p>
                </div>
              </div>
            ))}
            {showMoreGroups && (
              <button
                type="button"
                className="qc-avatar-card qc-load-more-tile"
                onClick={handleLoadMoreGroups}
                disabled={loadingMoreGroups}
              >
                <div className="qc-load-more-tile-body">
                  {loadingMoreGroups ? (
                    <Loader2 className="qc-spinner qc-load-more-spinner" size={22} />
                  ) : (
                    <span className="qc-load-more-plus" aria-hidden>+</span>
                  )}
                </div>
                <div className="qc-avatar-info">
                  <h4>{loadingMoreGroups ? 'Loading…' : 'Load more'}</h4>
                  <p>More characters</p>
                </div>
              </button>
            )}
          </div>
        )}
      </>
    );
  };

  const renderLookStep = () => {
    if (!selectedGroup) {
      return (
        <div className="qc-loading">
          <p>Select a presenter first, then choose a look.</p>
        </div>
      );
    }

    if (loadingLooks) {
      return (
        <div className="qc-loading">
          <Loader2 className="qc-spinner" size={32} />
          <p>Loading looks…</p>
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

    const showMoreLooks =
      !avatarSearch.trim() &&
      (looksDisplayLimit < looks.length || (looksHasMore && !!looksNextToken));

    return (
      <>
        {renderAvatarSearchBar('Search looks by name...')}
        {filteredLooks.length === 0 ? (
          <div className="qc-loading">
            <p>No looks match &ldquo;{avatarSearch.trim()}&rdquo;.</p>
          </div>
        ) : (
          <div className="qc-avatar-grid premium-scrollbar">
            {filteredLooks.map((look) => {
              const isSelected = selectedAvatar?.id === look.id;
              const typeLabel = formatLookBadgeLabel(look);
              return (
                <div
                  key={look.id}
                  className={`qc-avatar-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    applyLookSelection(look, selectedGroup, looksPageData);
                  }}
                >
                  <div className="qc-avatar-img-wrap">
                    <img src={look.image} alt={look.name} />
                    {typeLabel && <span className="qc-avatar-type-badge">{typeLabel}</span>}
                    {isSelected && <div className="qc-avatar-check">✓</div>}
                  </div>
                  <div className="qc-avatar-info">
                    <h4 className={isSelected ? 'text-primary' : ''}>
                      {look.name} {isSelected && '(Selected)'}
                    </h4>
                  </div>
                </div>
              );
            })}

            {showMoreLooks && (
              <button
                type="button"
                className="qc-avatar-card qc-load-more-tile"
                onClick={handleLoadMoreLooks}
                disabled={loadingMoreLooks}
              >
                <div className="qc-load-more-tile-body">
                  {loadingMoreLooks ? (
                    <Loader2 className="qc-spinner qc-load-more-spinner" size={22} />
                  ) : (
                    <span className="qc-load-more-plus" aria-hidden>+</span>
                  )}
                </div>
                <div className="qc-avatar-info">
                  <h4>{loadingMoreLooks ? 'Loading…' : 'Load more'}</h4>
                  <p>More looks</p>
                </div>
              </button>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="qc-overlay">
      <div className="qc-modal">
        {renderHeader()}

        <div className="qc-content">
          {step === 1 && (
            <div className="qc-step-pane qc-avatar-step-wrap">{renderPresenterStep()}</div>
          )}

          {step === 2 && (
            <div className="qc-step-pane qc-avatar-step-wrap">{renderLookStep()}</div>
          )}

          {step === 3 && (
            <div className="qc-step-pane">
              <button
                type="button"
                className={`qc-skip-voice-card ${skipVoice ? 'active' : ''}`}
                onClick={handleSkipVoice}
              >
                <span className="qc-skip-voice-icon" aria-hidden>
                  <MdSkipNext size={20} />
                </span>
                <div className="qc-skip-voice-copy">
                  <strong>Skip voice for now</strong>
                  <p>Set up the scene first and choose a voice later in the editor.</p>
                </div>
              </button>

              <div className="qc-voice-toolbar">
                <div className="qc-search-box">
                  <MdSearch size={18} />
                  <input
                    type="text"
                    placeholder="Search voices by name..."
                    value={voiceSearch}
                    onChange={(e) => setVoiceSearch(e.target.value)}
                  />
                </div>
              </div>

              {loadingVoices ? (
                <div className="qc-loading">
                  <Loader2 className="qc-spinner" size={32} />
                  <p>Loading voices…</p>
                </div>
              ) : (
                <div className="qc-voice-list premium-scrollbar">
                  {filteredVoices.map((voice) => {
                    const isSelected = !skipVoice && selectedVoice?.id === voice.id;
                    const isPreviewing = previewingVoiceId === voice.id;
                    const isPreviewLoading = previewLoadingVoiceId === voice.id;
                    return (
                      <div
                        key={voice.id}
                        className={`qc-voice-card ${isSelected ? 'selected' : ''}`}
                      >
                        <button
                          type="button"
                          className="qc-voice-card-main"
                          onClick={() => handleSelectVoice(voice)}
                        >
                          <span className="qc-voice-card-icon" aria-hidden>
                            <MdRecordVoiceOver size={18} />
                          </span>
                          <div className="qc-voice-card-copy">
                            <strong>{voice.name}</strong>
                            <span>{voice.gender} · {voice.language}</span>
                          </div>
                          {isSelected && <span className="qc-voice-card-check">Selected</span>}
                        </button>
                        <button
                          type="button"
                          className={`qc-play-btn ${isPreviewing ? 'playing' : ''}`}
                          onClick={(e) => playVoicePreview(e, voice)}
                          disabled={isPreviewLoading}
                          aria-label={isPreviewing ? `Stop preview for ${voice.name}` : `Preview ${voice.name}`}
                        >
                          {isPreviewLoading ? (
                            <Loader2 className="qc-spinner" size={14} />
                          ) : isPreviewing ? (
                            <MdPause size={16} />
                          ) : (
                            <MdPlayArrow size={16} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="qc-step-pane">
              <div className="qc-script-container">
                <div className="qc-script-header">
                  <span className="qc-label">Video script</span>
                  <span className="qc-char-count">{script.length} / 1000</span>
                </div>

                <div className="qc-textarea-wrapper">
                  <textarea
                    className="qc-script-textarea premium-scrollbar"
                    placeholder="Write what your presenter should say…"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    maxLength={1000}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="qc-step-pane qc-settings-pane">
              <div className="qc-settings-summary">
                {selectedAvatar?.image && (
                  <img
                    src={selectedAvatar.image}
                    alt=""
                    className="qc-settings-summary-thumb"
                  />
                )}
                <div className="qc-settings-summary-copy">
                  <strong>{selectedAvatar?.name || 'Presenter'}</strong>
                  <span>
                    {skipVoice ? 'Voice skipped' : selectedVoice?.name || 'No voice'}
                    {' · '}
                    {script.trim().length} characters
                  </span>
                </div>
              </div>

              <div className="qc-settings-grid premium-scrollbar">
                <section className="qc-settings-card qc-settings-card--background">
                  <header className="qc-settings-card-head">
                    <span className="qc-settings-card-icon" aria-hidden>
                      <MdLayers size={17} />
                    </span>
                    <div>
                      <h3>Background</h3>
                      <p>Transparent cutout or a solid backdrop behind your presenter.</p>
                    </div>
                  </header>

                  <div className="qc-settings-row">
                    <div className="qc-settings-row-copy">
                      <strong>Remove background</strong>
                      <span>Export presenter without a backdrop</span>
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
                    <div className="qc-settings-subsection">
                      <span className="qc-settings-subtitle">
                        <MdPalette size={14} />
                        Color palette
                      </span>
                      <div className="qc-color-categories">
                        {BACKGROUND_COLOR_PALETTE.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            className={`qc-color-category-chip ${activeColorCategory === category.id ? 'active' : ''}`}
                            onClick={() => setActiveColorCategory(category.id)}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                      <div className="qc-color-swatches">
                        {activePaletteCategory.colors.map((preset) => (
                          <button
                            key={`${activePaletteCategory.id}-${preset.label}`}
                            type="button"
                            className={`qc-swatch-btn ${backgroundColor.toLowerCase() === preset.color.toLowerCase() ? 'active' : ''}`}
                            style={{ backgroundColor: preset.color }}
                            title={preset.label}
                            aria-label={preset.label}
                            onClick={() => setBackgroundColor(preset.color)}
                          />
                        ))}
                      </div>
                      <div className="qc-color-input-wrapper">
                        <div
                          className="qc-color-preview"
                          style={{ backgroundColor }}
                          aria-hidden
                        />
                        <input
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          aria-label="Custom background color"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  )}
                </section>

                <section className="qc-settings-card qc-settings-card--format">
                  <header className="qc-settings-card-head">
                    <span className="qc-settings-card-icon" aria-hidden>
                      <MdMonitor size={17} />
                    </span>
                    <div>
                      <h3>Video format</h3>
                      <p>Aspect ratio for your scene.</p>
                    </div>
                  </header>

                  <div className="qc-format-options qc-format-options--stacked">
                    <button
                      type="button"
                      className={`qc-format-option ${aspectRatio === '16:9' ? 'active' : ''}`}
                      onClick={() => setAspectRatio('16:9')}
                    >
                      <span className="qc-format-option-icon qc-format-option-icon--landscape" aria-hidden>
                        <MdMonitor size={20} />
                      </span>
                      <strong>16:9 Landscape</strong>
                      <span>YouTube, web, presentations</span>
                    </button>
                    <button
                      type="button"
                      className={`qc-format-option ${aspectRatio === '9:16' ? 'active' : ''}`}
                      onClick={() => setAspectRatio('9:16')}
                    >
                      <span className="qc-format-option-icon qc-format-option-icon--portrait" aria-hidden>
                        <MdPhoneAndroid size={20} />
                      </span>
                      <strong>9:16 Portrait</strong>
                      <span>Reels, TikTok, Stories</span>
                    </button>
                  </div>
                </section>

                {showExpressiveness && (
                  <section className="qc-settings-card qc-settings-card--express">
                    <header className="qc-settings-card-head">
                      <span className="qc-settings-card-icon" aria-hidden>
                        <MdTune size={17} />
                      </span>
                      <div>
                        <h3>Expressiveness</h3>
                        <p>How animated the presenter should appear on camera.</p>
                      </div>
                    </header>

                    <div className="qc-express-options">
                      {expressivenessOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={`qc-express-option ${expressiveness === option.id ? 'active' : ''}`}
                          onClick={() => setExpressiveness(option.id)}
                        >
                          <strong>{option.label}</strong>
                          <span>{option.hint}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}

          {step === GENERATING_STEP && (
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

        {step !== GENERATING_STEP && (
          <div className="qc-footer">
            {step === 1 && !selectedGroup ? (
              <button type="button" className="qc-btn-secondary" onClick={onClose}>
                Cancel
              </button>
            ) : (
              <button type="button" className="qc-btn-secondary" onClick={handleBack}>
                <MdChevronLeft size={18} /> Back
              </button>
            )}

            <div className="qc-footer-right">
              {step === 3 && (
                <div className="qc-selected-info">
                  <span>VOICE</span>
                  <strong>{skipVoice ? 'Skipped' : selectedVoice?.name || 'Not selected'}</strong>
                </div>
              )}

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  className="qc-btn-primary"
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !selectedGroup?.id) ||
                    (step === 2 && !selectedAvatar?.id) ||
                    (step === 3 && !canProceedFromVoice) ||
                    (step === 4 && !script.trim())
                  }
                >
                  Continue{' '}
                  <MdChevronRight size={18} />
                </button>
              ) : (
                <button type="button" className="qc-btn-primary" onClick={handleGenerate}>
                  {skipVoice ? 'Add to scene' : 'Generate video'}{' '}
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
