import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, RotateCcw, Sparkles, Edit3, Wand2, Download, 
  X, Send, AlertCircle, CheckCircle2, ChevronRight, Copy, Share2, User, ThumbsUp, ThumbsDown,
  Link2, Facebook, Twitter, MessageCircle, Linkedin,
  PanelLeft, Plus, Library, Search, Clock, LogOut, Image as ImageIcon, BarChart3, Printer
} from 'lucide-react';
import { FaInstagram, FaFacebookF, FaYoutube, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import imageGenService, { ImageGenProviderError } from '../../../services/imageGenService.js';
import creditsService, { isInsufficientCreditsError } from '../../../services/creditsService.js';
import { resolvePresentationWorkspaceContext } from '../../../utils/presentationContext.js';
import LogoImg from '../../../assets/herologo.png';
import InfographicAnimatedBackground from './InfographicAnimatedBackground.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import ImageGenCreditsGate from '../../../components/features/image-generation/ImageGenCreditsGate.jsx';
import ImageGenContextAttach from '../../../components/features/image-generation/ImageGenContextAttach.jsx';
import { checkImageGenCredits } from '../../../utils/imageGenCreditsCheck.js';
import MarkdownPromptInput from '../../../components/features/image-generation/MarkdownPromptInput.jsx';
import { highlightMarkdownSource } from '../../../utils/markdownPrompt.jsx';
import '../../../components/features/image-generation/MarkdownPromptInput.css';
import './AIConversationalStudio.css';
import RecentChatMenu from './RecentChatMenu.jsx';
import WorkspaceImageLibrary from './WorkspaceImageLibrary.jsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog.jsx';

const GENERATION_STEPS = [
  "Drafting vision...",
  "Adding visual elements & typography",
  "Refining details & rendering"
];

const VALID_STYLES = [
  'scene', 'photo', 'still-life', 'spot-color', 'illustration', 'flat-line',
  'modern-art', 'isometric', 'gouache', 'bold-poster', 'watercolor', 'bauhaus',
  '3d', 'neon-glow', 'cinematic', 'mesh'
];

const VALID_ARCHETYPES = ['process', 'timeline', 'comparison', 'stats', 'hierarchy', 'list', 'cycle'];

function resolveSocialPlatform(chat) {
  const direct = String(chat?.platform || chat?.head?.platform || '').toLowerCase();
  if (direct) return direct;
  const fid = String(chat?.formatId || chat?.head?.formatId || '').toLowerCase();
  if (fid.includes('instagram')) return 'instagram';
  if (fid.includes('facebook')) return 'facebook';
  if (fid.includes('linkedin')) return 'linkedin';
  if (fid.includes('twitter') || fid.startsWith('x-') || fid.includes('x-twitter')) return 'twitter';
  if (fid.includes('youtube')) return 'youtube';
  return '';
}

function SocialPlatformIcon({ platform, size = 15 }) {
  const key = String(platform || '').toLowerCase();
  const s = { width: size, height: size, flexShrink: 0 };
  if (key.includes('youtube')) return <FaYoutube style={{ ...s, color: '#FF0000' }} title="YouTube" />;
  if (key.includes('instagram')) return <FaInstagram style={{ ...s, color: '#E4405F' }} title="Instagram" />;
  if (key.includes('facebook')) return <FaFacebookF style={{ ...s, color: '#1877F2' }} title="Facebook" />;
  if (key.includes('linkedin')) return <FaLinkedinIn style={{ ...s, color: '#0A66C2' }} title="LinkedIn" />;
  if (key.includes('twitter') || key === 'x') return <FaXTwitter style={{ ...s, color: '#111827' }} title="X" />;
  return <Share2 size={size} />;
}

const FOLLOWUP_BY_MODE = {
  image: {
    before: 'Would you like to ',
    mid: ', or ',
    after: '?',
    actions: [
      { label: 'brighten the lighting', send: 'Brighten the lighting and keep the same composition.' },
      { label: 'add more background detail', send: 'Add more detail in the background while keeping the main subject the same.' },
    ],
  },
  infographic: {
    before: 'Would you like to ',
    mid: ', or ',
    after: '?',
    actions: [
      { label: 'simplify the layout', send: 'Simplify the layout and keep the same information.' },
      { label: 'make the numbers larger', send: 'Make the numbers and labels larger and easier to read.' },
    ],
  },
  social: {
    before: 'Would you like to ',
    mid: ', or ',
    after: '?',
    actions: [
      { label: 'make the headline bolder', send: 'Make the headline larger and bolder, keep the same layout.' },
      { label: 'increase contrast for mobile', send: 'Increase contrast so the text reads clearly on a phone.' },
    ],
  },
  printable: {
    before: 'Would you like to ',
    mid: ', or ',
    after: '?',
    actions: [
      { label: 'change the date', send: 'Change the date in the copy and keep the same layout.' },
      { label: 'make the background darker', send: 'Make the background darker while keeping the same size and text.' },
    ],
  },
};

function printKindOf(print) {
  return String(print?.kind || '').replace(/_/g, '-');
}

function printPhysicalLabel(print = {}) {
  if (print.widthIn && print.heightIn) return `${print.widthIn}×${print.heightIn} in`;
  if (print.widthMm && print.heightMm) return `${print.widthMm}×${print.heightMm} mm`;
  return '';
}

function printFromRaw(raw) {
  return raw?.print || raw?.request?.print || null;
}

function warningsFromRaw(raw) {
  const w = raw?.request?.warnings || raw?.warnings;
  if (!w) return [];
  return (Array.isArray(w) ? w : [w]).map((item) => String(item || '').trim()).filter(Boolean);
}

function modeLabel(mode) {
  if (mode === 'infographic') return 'Infographic';
  if (mode === 'social') return 'Social';
  if (mode === 'printable') return 'Print';
  return 'Image';
}

function refsFromContext(ctx) {
  if (!ctx) return [];
  const local = Array.isArray(ctx.localImages)
    ? ctx.localImages
        .map((img) => ({ name: img?.name || 'Reference', src: img?.src || img?.url || '' }))
        .filter((img) => img.src)
    : [];
  if (local.length) return local;
  const previews = ctx.previews || ctx.request?.contextSnapshot?.previews || ctx.contextSnapshot?.previews || {};
  const fromImages = (previews.images || []).map((img) => ({
    name: img?.name || 'Reference',
    src: img?.url || img?.src || '',
  }));
  const fromAssets = (previews.assetRefs || []).map((ref) => ({
    name: ref?.name || 'Library image',
    src: ref?.url || '',
  }));
  return [...fromImages, ...fromAssets].filter((img) => img.src);
}

async function resolveContextImages(workspaceId, ctx, generation) {
  const fromCtx = refsFromContext(ctx);
  if (fromCtx.length) return fromCtx;
  const fromGen = refsFromContext(generation) || refsFromContext(generation?.request);
  if (fromGen.length) return fromGen;
  const contextId = generation?.contextId || generation?.request?.contextId || ctx?.id;
  if (!workspaceId || !contextId) return [];
  try {
    const live = await imageGenService.getContext(workspaceId, contextId);
    return refsFromContext(live);
  } catch {
    return [];
  }
}

export default function AIConversationalStudio({
  onBack,
  onOpenBilling,
  onNewChat = null,
  onOpenLibrary = null,
  onSelectThread = null,
  createContext = null,
  initialPrompt = '',
  activeMode = 'image',
  selectedModel = 'gpt-image-1',
  selectedFormat = 'square',
  selectedStyle = null,
  activeThreadId: propThreadId = null,
  onLocationChange = null,
  initialContext = null,
}) {
  const [workspaceId, setWorkspaceId] = useState(createContext?.workspaceId || null);
  const [folderId, setFolderId] = useState(createContext?.folderId || null);
  const [threadId, setThreadId] = useState(propThreadId || createContext?.threadId || null);

  const { user } = useAuth();
  const [credits, setCredits] = useState(0);

  // Prompt & Config (Persisted)
  const [basePrompt, setBasePrompt] = useState(initialPrompt || '');
  const [mode, setMode] = useState(activeMode || 'image');
  const [modelId, setModelId] = useState(selectedModel || 'gpt-image-1');
  const [formatId, setFormatId] = useState(selectedFormat || (activeMode === 'infographic' ? 'landscape' : 'square'));
  const [styleId, setStyleId] = useState(selectedStyle || null);
  const [imageContext, setImageContext] = useState(initialContext || null);
  const [pendingRefs, setPendingRefs] = useState([]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Versions & History
  const [generations, setGenerations] = useState([]);
  const [activeGenIndex, setActiveGenIndex] = useState(-1);
  const [conversation, setConversation] = useState([]);
  
  // Feedback Modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackThanks, setFeedbackThanks] = useState(false);
  
  // Share Modal
  const [shareModalGen, setShareModalGen] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [userFeedback, setUserFeedback] = useState({});
  
  const [chatInput, setChatInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [studioView, setStudioView] = useState('chat');
  const [railFlyout, setRailFlyout] = useState(null);
  const [railQuery, setRailQuery] = useState('');
  const [railRecents, setRailRecents] = useState([]);
  const [recentMenuId, setRecentMenuId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const railFlyoutRef = useRef(null);
  const [editMode, setEditMode] = useState('auto');
  const [downloadMenuFor, setDownloadMenuFor] = useState(null);
  const [dismissedWarnings, setDismissedWarnings] = useState({});

  // UI Modals
  const [fullscreenUrl, setFullscreenUrl] = useState(null);
  const [pendingPrompt, setPendingPrompt] = useState('');
  const [creditsGate, setCreditsGate] = useState(null);
  const creditsRetryRef = useRef(null);

  const showCreditsGate = async (retryFn, wsId = workspaceId) => {
    creditsRetryRef.current = retryFn;
    if (!wsId) return;
    try {
      const check = await checkImageGenCredits(wsId, { modelId, mode });
      setCreditsGate({
        workspaceId: wsId,
        needed: check.needed,
        pool: check.pool,
        personal: check.personal,
        isTeam: check.isTeam,
      });
    } catch {
      setCreditsGate({
        workspaceId: wsId,
        needed: 1,
        pool: 0,
        personal: 0,
        isTeam: true,
      });
    }
  };

  // Refs
  const composerInputRef = useRef(null);
  const chatBottomRef = useRef(null);
  const stepTimerRef = useRef(null);
  const initialTriggeredRef = useRef(false);

  // Active generation item
  const activeGeneration = useMemo(() => {
    if (activeGenIndex >= 0 && activeGenIndex < generations.length) {
      return generations[activeGenIndex];
    }
    return generations[generations.length - 1] || null;
  }, [generations, activeGenIndex]);

  // Format aspect ratio / specs display
  const specLabel = useMemo(() => {
    const parts = [];
    const modelName = modelId.includes('gemini') ? 'Gemini Pro' : 'GPT Image';
    parts.push(modelName);

    if (formatId === 'square') parts.push('1:1');
    else if (formatId === 'landscape') parts.push('16:9');
    else if (formatId === 'portrait') parts.push('9:16');
    else parts.push(formatId);

    parts.push(modeLabel(mode));
    if (styleId) {
      parts.push(typeof styleId === 'string' ? styleId.charAt(0).toUpperCase() + styleId.slice(1) : 'Custom');
    }
    return parts;
  }, [modelId, formatId, mode, styleId]);

  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!recentMenuId) return undefined;
    const close = (e) => {
      if (e.target.closest('.recent-chat-menu-wrap') || e.target.closest('.recent-chat-menu')) return;
      setRecentMenuId(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [recentMenuId]);

  useEffect(() => {
    if (!railFlyout) return undefined;
    const onDoc = (e) => {
      if (railFlyoutRef.current && !railFlyoutRef.current.contains(e.target)) {
        setRailFlyout(null);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setRailFlyout(null);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [railFlyout]);

  // Load Workspace, Folder, and Credits
  useEffect(() => {
    let active = true;

    async function initWorkspace() {
      try {
        const preferredWs = createContext?.workspaceId || null;
        const preferredFld = createContext?.folderId || null;
        const ctx = await resolvePresentationWorkspaceContext(
          preferredWs ? { preferredWorkspaceId: preferredWs, preferredFolderId: preferredFld } : {}
        );
        if (!active) return;
        const wsId = ctx.workspaceId;
        const fldId = ctx.folderId;
        setWorkspaceId(wsId);
        setFolderId(fldId);
        onLocationChange?.({ workspaceId: wsId, folderId: fldId });

        // Fetch workspace credits now that we have the workspaceId
        creditsService.getWorkspaceBalance(wsId)
          .then(balance => {
            if (active) {
              const wsCredits = balance.workspaceCredits || balance.personalCredits || balance.credits || 0;
              setCredits(wsCredits);
            }
          })
          .catch(e => console.warn("Could not load workspace credits balance", e));

        // Trigger initial generation or load thread with resolved workspaceId and folderId
        if (threadId) {
          loadThread(wsId, threadId);
        } else if (basePrompt.trim() && !initialTriggeredRef.current) {
          initialTriggeredRef.current = true;
          executeGenerate(basePrompt, wsId, fldId);
        }
      } catch (err) {
        console.error("Failed resolving presentation context", err);
        setErrorMsg("Failed to connect to workspace.");
      }
    }
    initWorkspace();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!workspaceId) return undefined;
    let live = true;
    imageGenService.listThreads(workspaceId, { take: 100 })
      .then((rows) => { if (live) setRailRecents(rows || []); })
      .catch(() => { if (live) setRailRecents([]); });
    return () => { live = false; };
  }, [workspaceId, generations.length]);

  // Scroll to bottom when new messages/generations are added or generation starts
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generations, isGenerating]);

  // Cycle step status while generating
  useEffect(() => {
    if (isGenerating) {
      setActiveStepIdx(0);
      stepTimerRef.current = setInterval(() => {
        setActiveStepIdx(prev => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
      }, 3500);
    } else {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    }
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [isGenerating]);

  useEffect(() => {
    const refs = refsFromContext(imageContext);
    if (!refs.length) return;
    setGenerations((prev) => {
      if (!prev.length) return prev;
      let changed = false;
      const next = prev.map((g) => {
        if (g.contextImages?.length) return g;
        changed = true;
        return { ...g, contextImages: refs };
      });
      return changed ? next : prev;
    });
  }, [imageContext]);

  useEffect(() => {
    if (!fullscreenUrl) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setFullscreenUrl(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreenUrl]);

  // Fetch thread history
  const loadThread = async (wsId = workspaceId, tId = threadId) => {
    const activeWs = wsId || workspaceId;
    if (!activeWs || !tId) return;
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const data = await imageGenService.getThread(activeWs, tId);
      const msgs = data?.messages || [];
      const loadedGens = [];
      const chatItems = [];

      let latestUserPrompt = '';

      for (let i = 0; i < msgs.length; i++) {
        const m = msgs[i];
        if (m.role === 'user') {
          latestUserPrompt = m.content;
          // The very first user message is the base prompt (rendered at the top)
          if (i === 0) {
            setBasePrompt(m.content);
          } else {
            chatItems.push({ role: 'user', content: m.content });
          }
        } else if (m.role === 'assistant' || m.generationId) {
          const imgUrl = m.url || m.asset?.url || null;
          if (imgUrl) {
            const vNum = loadedGens.length + 1;
            loadedGens.push({
              id: m.generationId || `gen_${i}`,
              url: imgUrl,
              prompt: m.content || m.prompt || latestUserPrompt,
              version: `v${vNum}`,
              threadId: tId,
              contextImages: refsFromContext(m),
            });
          }
          if (m.content && i > 1) {
            chatItems.push({ role: 'assistant', content: m.content });
          }
        }
      }

      const withRefs = await Promise.all(
        loadedGens.map(async (g) => {
          if (g.contextImages?.length) return g;
          try {
            const full = await imageGenService.getGeneration(activeWs, g.id);
            const images = await resolveContextImages(activeWs, null, full);
            return { ...g, raw: full, contextImages: images };
          } catch {
            return g;
          }
        })
      );

      setGenerations(withRefs);
      setActiveGenIndex(loadedGens.length - 1);
      setConversation(chatItems);
      const head = data?.thread || data?.head || withRefs[0]?.raw || {};
      if (head.mode) setMode(head.mode);
      if (head.formatId) setFormatId(head.formatId);
      else if (withRefs[0]?.raw?.formatId) setFormatId(withRefs[0].raw.formatId);
    } catch (err) {
      console.error("Failed to load thread:", err);
      setErrorMsg("Failed to load previous generation session.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Initial generation call
  const executeGenerate = async (promptText, wsId = workspaceId, fldId = folderId) => {
    const activeWs = wsId || workspaceId;
    const activeFld = fldId || folderId;
    
    if (isGenerating) return;
    
    if (!activeWs || !activeFld) {
      setErrorMsg("Workspace connection failed. Please refresh the page or log in again.");
      return;
    }

    if ((mode === 'social' || mode === 'printable') && !formatId) {
      setErrorMsg(mode === 'printable' ? 'Select a print size first.' : 'Select a destination first.');
      return;
    }

    try {
      const check = await checkImageGenCredits(activeWs, {
        modelId: modelId || (mode === 'image' ? 'gpt-image-1-hd' : 'gemini-3-pro-image'),
        mode: mode || 'image',
      });
      if (!check.ok) {
        await showCreditsGate(() => executeGenerate(promptText, wsId, fldId), activeWs);
        return;
      }
    } catch {
      /* let generate report a real 402 */
    }
    
    setIsGenerating(true);
    setPendingPrompt(promptText);
    setPendingRefs(refsFromContext(imageContext));
    setErrorMsg('');

    try {
      const formatForMode =
        mode === 'social' || mode === 'printable'
          ? formatId
          : formatId || (mode === 'infographic' ? 'landscape' : 'square');
      if ((mode === 'social' || mode === 'printable') && !formatForMode) {
        setErrorMsg(mode === 'printable' ? 'Select a print size first.' : 'Select a destination first.');
        return;
      }

      const payload = {
        mode: mode || 'image',
        folderId: activeFld,
        modelId: modelId || (mode === 'image' ? 'gpt-image-1-hd' : 'gemini-3-pro-image'),
        formatId: formatForMode,
        prompt: mode === 'infographic' ? `${promptText.trim()}, clean minimalist layout, no text, no words, empty placeholders` : promptText.trim()
      };
      if (mode !== 'social' && styleId) {
        if (VALID_STYLES.includes(styleId)) {
          payload.style = styleId;
          payload.styleId = styleId;
        } else if (mode === 'infographic' && VALID_ARCHETYPES.includes(styleId)) {
          payload.archetypeHint = styleId;
        }
      }
      if (imageContext?.id) payload.contextId = imageContext.id;

      const res = await imageGenService.generate(activeWs, payload);
      const gen = res?.generation;
      const newThreadId = res?.thread?.id || gen?.threadId || threadId;
      if (newThreadId) setThreadId(newThreadId);

      const imgUrl = gen?.url || gen?.asset?.url || null;
      if (!imgUrl) {
        throw new Error("No image returned from generation service.");
      }

      const contextImages = await resolveContextImages(activeWs, imageContext, gen);
      const newGenItem = {
        id: gen.id,
        url: imgUrl,
        prompt: promptText,
        version: `v${generations.length + 1}`,
        threadId: newThreadId,
        raw: gen,
        creditsCharged: res?.creditsCharged,
        contextImages,
      };

      setGenerations(prev => {
        const next = [...prev, newGenItem];
        setActiveGenIndex(next.length - 1);
        return next;
      });

      // Refresh credits
      try {
        const bal = await creditsService.getPersonalBalance();
        setCredits(bal.personalCredits || 0);
      } catch (e) {}

    } catch (err) {
      console.error("Generation failed:", err);
      if (isInsufficientCreditsError(err)) {
        await showCreditsGate(() => executeGenerate(promptText, wsId, fldId), activeWs);
      } else if (err instanceof ImageGenProviderError || err.status === 503) {
        setErrorMsg(err.message || 'Gemini isn’t available on this server. Switch to an OpenAI model.');
      } else {
        const msg = err?.data?.message || err.message || "Image generation failed. Please try again.";
        setErrorMsg(msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Conversational Re-Prompt / Tweak
  const handleSendPrompt = async (preset, fromGen) => {
    const text = (typeof preset === 'string' ? preset : chatInput).trim();
    if (!text || isGenerating) return;
    const activeWs = workspaceId || createContext?.workspaceId;
    if (!activeWs) {
      setErrorMsg('Workspace connection failed. Please refresh the page or log in again.');
      return;
    }

    setChatInput(text);

    try {
      const check = await checkImageGenCredits(activeWs, { modelId, mode });
      if (!check.ok) {
        await showCreditsGate(() => handleSendPrompt(text, fromGen));
        return;
      }
    } catch {
      /* continue */
    }

    setChatInput('');
    setIsGenerating(true);
    setPendingPrompt(text);
    setPendingRefs(refsFromContext(imageContext));
    setErrorMsg('');

    try {
      let res;
      const parentGen = fromGen || activeGeneration || generations[generations.length - 1];

      const tweakText = mode === 'infographic' ? `${text}, maintain clean minimalist layout, no text, no words` : text;

      if (threadId) {
        res = await imageGenService.sendThreadMessage(activeWs, threadId, tweakText, {
          fromGenerationId: parentGen?.id,
          mode,
          modelId,
          editMode: (mode === 'printable' || mode === 'social' || mode === 'infographic') && editMode !== 'auto' ? editMode : undefined,
        });
      } else if (parentGen?.id) {
        res = await imageGenService.tweak(activeWs, parentGen.id, tweakText, {
          mode,
          modelId,
          editMode: (mode === 'printable' || mode === 'social' || mode === 'infographic') && editMode !== 'auto' ? editMode : undefined,
        });
      } else {
        // Fallback to fresh generate with combined prompt
        const fallbackBody = {
          mode: mode || 'image',
          folderId,
          modelId: modelId || 'gpt-image-1',
          formatId: formatId || (mode === 'infographic' ? 'landscape' : 'square'),
          prompt: mode === 'infographic' ? `${basePrompt}. Modification: ${text}, clean minimalist layout, no text, no words` : `${basePrompt}. Modification: ${text}`
        };
        if (styleId) {
          if (VALID_STYLES.includes(styleId)) {
            fallbackBody.style = styleId;
            fallbackBody.styleId = styleId;
          } else if (mode === 'infographic' && VALID_ARCHETYPES.includes(styleId)) {
            fallbackBody.archetypeHint = styleId;
          }
        }
        if (imageContext?.id) fallbackBody.contextId = imageContext.id;
        res = await imageGenService.generate(activeWs, fallbackBody);
      }

      const gen = res?.generation;
      const nextThreadId = res?.thread?.id || gen?.threadId || threadId;
      if (nextThreadId) setThreadId(nextThreadId);

      const imgUrl = gen?.url || gen?.asset?.url || null;
      if (!imgUrl) throw new Error("No image was returned from refinement.");

      const contextImages =
        refsFromContext(imageContext).length
          ? refsFromContext(imageContext)
          : (parentGen?.contextImages || await resolveContextImages(activeWs, imageContext, gen));
      const newGenItem = {
        id: gen.id,
        url: imgUrl,
        prompt: text,
        version: `v${generations.length + 1}`,
        threadId: nextThreadId,
        raw: gen,
        creditsCharged: res?.creditsCharged,
        contextImages,
      };

      setGenerations(prev => {
        const next = [...prev, newGenItem];
        setActiveGenIndex(next.length - 1);
        return next;
      });

      // Update credit balance
      try {
        const bal = await creditsService.getPersonalBalance();
        setCredits(bal.personalCredits || 0);
      } catch (e) {}

    } catch (err) {
      console.error("Re-prompt failed:", err);
      if (isInsufficientCreditsError(err)) {
        setChatInput(text);
        await showCreditsGate(() => handleSendPrompt(text, fromGen));
      } else {
        const msg = err?.data?.message || err.message || "Failed to refine image. Please try again.";
        setErrorMsg(msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate action
  const handleRegenerate = async (targetGen) => {
    if (isGenerating || !workspaceId) return;
    // Use passed gen, or active, or last
    const parentGen = targetGen || activeGeneration || generations[generations.length - 1];
    if (!parentGen?.id) return;

    setIsGenerating(true);
    setPendingPrompt("Regenerate alternative");
    setPendingRefs(parentGen.contextImages || []);
    setErrorMsg('');

    try {
      const regenBody = {
        mode,
        modelId,
        prompt: mode === 'infographic' ? `${basePrompt}, clean minimalist layout, no text, no words, empty placeholders` : basePrompt
      };
      if (mode !== 'social' && mode !== 'printable' && formatId) regenBody.formatId = formatId;
      if (styleId) {
        if (VALID_STYLES.includes(styleId)) {
          regenBody.style = styleId;
          regenBody.styleId = styleId;
        } else if (mode === 'infographic' && VALID_ARCHETYPES.includes(styleId)) {
          regenBody.archetypeHint = styleId;
        }
      }

      const res = await imageGenService.regenerate(workspaceId, parentGen.id, regenBody);

      const gen = res?.generation;
      const imgUrl = gen?.url || gen?.asset?.url || null;
      if (!imgUrl) throw new Error("Could not regenerate variation.");

      const newGenItem = {
        id: gen.id,
        url: imgUrl,
        prompt: parentGen.prompt,
        version: `v${generations.length + 1}`,
        threadId: threadId,
        raw: gen,
        creditsCharged: res?.creditsCharged,
        contextImages: parentGen.contextImages || [],
      };

      setGenerations(prev => {
        const next = [...prev, newGenItem];
        setActiveGenIndex(next.length - 1);
        return next;
      });

      try {
        const bal = await creditsService.getPersonalBalance();
        setCredits(bal.personalCredits || 0);
      } catch (e) {}

    } catch (err) {
      console.error("Regenerate error:", err);
      if (isInsufficientCreditsError(err)) {
        await showCreditsGate(() => handleRegenerate(targetGen));
      } else {
        setErrorMsg(err?.data?.message || err.message || "Regeneration failed.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Download action
  const handleDownload = async (targetGen, format = 'png', { bleed = false } = {}) => {
    const gen = targetGen || activeGeneration;
    if (!gen?.id || !workspaceId) return;
    setDownloadMenuFor(null);
    try {
      await imageGenService.downloadAndSave(workspaceId, gen.id, format, { bleed });
    } catch (err) {
      console.error("Download failed:", err);
      setErrorMsg(err?.data?.message || err.message || 'Download failed.');
      if (!bleed && format === 'png' && gen.url) {
        const a = document.createElement('a');
        a.href = gen.url;
        a.download = `athena-${mode}-${gen.version || 'v1'}.png`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    }
  };

  const printAspectFor = (fId, print) => {
    if (print?.widthMm && print?.heightMm) {
      const kind = printKindOf(print);
      const landscape = print.orientation === 'landscape' || Number(print.widthMm) > Number(print.heightMm);
      const maxWidth = kind.includes('business')
        ? '480px'
        : kind.includes('invitation')
          ? '340px'
          : landscape
            ? '640px'
            : '400px';
      return { aspectRatio: `${print.widthMm}/${print.heightMm}`, maxWidth };
    }
    if (print?.widthIn && print?.heightIn) {
      return { aspectRatio: `${print.widthIn}/${print.heightIn}`, maxWidth: '480px' };
    }
    switch (fId) {
      case 'poster-a4-portrait':
        return { aspectRatio: '210/297', maxWidth: '400px' };
      case 'poster-a4-landscape':
        return { aspectRatio: '297/210', maxWidth: '640px' };
      case 'poster-a3-portrait':
        return { aspectRatio: '297/420', maxWidth: '400px' };
      case 'poster-a3-landscape':
        return { aspectRatio: '420/297', maxWidth: '640px' };
      case 'poster-a2-portrait':
        return { aspectRatio: '420/594', maxWidth: '400px' };
      case 'poster-a2-landscape':
        return { aspectRatio: '594/420', maxWidth: '640px' };
      case 'business-card':
        return { aspectRatio: '3.5/2', maxWidth: '480px' };
      case 'invitation-a6-portrait':
        return { aspectRatio: '105/148', maxWidth: '340px' };
      default:
        return null;
    }
  };

  const getAspectDims = (fId, print) => {
    const printDims = printAspectFor(fId, print);
    if (printDims) return printDims;
    switch (fId) {
      case 'landscape': return { aspectRatio: '16/9', maxWidth: '720px' };
      case 'portrait': return { aspectRatio: '9/16', maxWidth: '360px' };
      case 'landscape-3-2':
      case 'landscape-16-9': return { aspectRatio: '16/9', maxWidth: '720px' };
      case 'portrait-2-3':
      case 'portrait-9-16': return { aspectRatio: '9/16', maxWidth: '360px' };
      case 'youtube-thumbnail':
      case 'youtube-banner':
      case 'twitter-post': return { aspectRatio: '16/9', maxWidth: '720px' };
      case 'instagram-post': return { aspectRatio: '4/5', maxWidth: '400px' };
      case 'facebook-post': return { aspectRatio: '940/788', maxWidth: '560px' };
      case 'facebook-cover': return { aspectRatio: '851/315', maxWidth: '720px' };
      case 'linkedin-banner': return { aspectRatio: '1584/396', maxWidth: '720px' };
      case 'square': default: return { aspectRatio: '1/1', maxWidth: '480px' };
    }
  };
  const aspectStyle = getAspectDims(formatId, printFromRaw(activeGeneration?.raw));

  // Share action
  const handleShare = async (gen) => {
    if (gen?.id) {
      setShareCopied(false);
      setShareModalGen(gen);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareModalGen?.id) return;
    const link = `${window.location.origin}/share/${shareModalGen.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Focus composer when clicking Tweak or Re-prompt
  const focusComposer = () => {
    if (composerInputRef.current) {
      composerInputRef.current.focus();
      composerInputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const chatLabel = (chat) => chat.title || chat.prompt || chat.name || 'Untitled chat';

  const shareChat = (chat) => {
    const genId = chat.headGenerationId || chat.head?.id;
    if (genId) {
      setShareModalGen({ id: genId });
      return;
    }
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  const commitRename = async (chat) => {
    const next = renameDraft.trim();
    setRenamingId(null);
    setRecentMenuId(null);
    if (!workspaceId || !chat?.id || !next || next === chatLabel(chat)) return;
    try {
      await imageGenService.renameThread(workspaceId, chat.id, next);
      setRailRecents((rows) => rows.map((row) => (row.id === chat.id ? { ...row, title: next } : row)));
    } catch (err) {
      console.error('Rename chat failed', err);
    }
  };

  const deleteChat = (chat) => {
    setRecentMenuId(null);
    if (!workspaceId || !chat?.id) return;
    setConfirmDialog({
      title: 'Delete chat?',
      message: 'This chat will be removed from Recents. Images may still stay in Library.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await imageGenService.deleteThread(workspaceId, chat.id);
          setRailRecents((rows) => rows.filter((row) => row.id !== chat.id));
          if (chat.id === threadId) (onNewChat || onBack)?.();
        } catch (err) {
          console.error('Delete chat failed', err);
        }
      },
    });
  };

  const filteredRailRecents = useMemo(() => {
    const q = railQuery.trim().toLowerCase();
    if (!q) return railRecents;
    return railRecents.filter((chat) => {
      const label = `${chat.title || ''} ${chat.prompt || ''} ${chat.name || ''}`.toLowerCase();
      return label.includes(q);
    });
  }, [railRecents, railQuery]);

  const renderRecentRows = (onPick) => (
    <>
      {filteredRailRecents.map((chat) => {
        const chatMode = String(chat.mode || chat.head?.mode || '').toLowerCase();
        const label = chat.title || chat.prompt || chat.name || 'Untitled chat';
        const platform = resolveSocialPlatform(chat);
        const isSocial = chatMode === 'social' || Boolean(platform);
        const Icon = chatMode === 'printable' ? Printer : chatMode === 'infographic' ? BarChart3 : ImageIcon;
        return (
          <li key={chat.id}>
            {renamingId === chat.id ? (
              <input
                className="recent-chat-rename-input"
                value={renameDraft}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setRenameDraft(e.target.value)}
                onBlur={() => commitRename(chat)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename(chat);
                  if (e.key === 'Escape') setRenamingId(null);
                }}
              />
            ) : (
              <button
                type="button"
                className={chat.id === threadId ? 'is-on' : ''}
                title={label}
                onClick={() => {
                setStudioView('chat');
                onSelectThread?.(chat.id);
                onPick?.();
                }}
              >
                {isSocial ? (
                  <SocialPlatformIcon platform={platform} size={15} />
                ) : (
                  <Icon size={15} className="conv-rail-chat-icon" />
                )}
                <span>{label}</span>
              </button>
            )}
            <RecentChatMenu
              open={recentMenuId === chat.id}
              onToggle={() => setRecentMenuId((id) => (id === chat.id ? null : chat.id))}
              onShare={(e) => {
                e?.stopPropagation?.();
                setRecentMenuId(null);
                shareChat(chat);
              }}
              onRename={(e) => {
                e?.stopPropagation?.();
                setRecentMenuId(null);
                setRenameDraft(label);
                setRenamingId(chat.id);
              }}
              onDelete={(e) => {
                e?.stopPropagation?.();
                deleteChat(chat);
              }}
            />
          </li>
        );
      })}
      {filteredRailRecents.length === 0 && (
        <li className="conv-rail-empty">{railQuery.trim() ? 'No matching chats' : 'No recent chats'}</li>
      )}
    </>
  );

  return (
    <div className={`conv-studio-root${sidebarOpen ? '' : ' is-rail-collapsed'}${studioView === 'library' ? ' is-library-view' : ''}`}>
      <aside className="conv-rail" aria-label="Studio menu" ref={railFlyoutRef}>
        <div className="conv-rail-top">
          {sidebarOpen && (
            <div className="conv-rail-search">
              <Search size={16} />
              <input
                type="search"
                placeholder="Search chats"
                value={railQuery}
                onChange={(e) => setRailQuery(e.target.value)}
              />
            </div>
          )}
          <button
            type="button"
            className="conv-rail-icon-btn"
            title={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
            onClick={() => {
              setRailFlyout(null);
              setSidebarOpen((o) => !o);
            }}
          >
            <PanelLeft size={18} />
          </button>
        </div>
        <button
          type="button"
          className={`conv-rail-item${studioView === 'library' ? ' is-on' : ''}`}
          title="Library"
          onClick={() => {
            setRailFlyout(null);
            setStudioView('library');
          }}
        >
          <Library size={18} />
          {sidebarOpen && <span>Library</span>}
        </button>
        {!sidebarOpen && (
          <>
            <button
              type="button"
              className={`conv-rail-item${railFlyout === 'search' ? ' is-on' : ''}`}
              title="Search chats"
              onClick={() => setRailFlyout((v) => (v === 'search' ? null : 'search'))}
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              className={`conv-rail-item${railFlyout === 'recents' ? ' is-on' : ''}`}
              title="Recents"
              onClick={() => setRailFlyout((v) => (v === 'recents' ? null : 'recents'))}
            >
              <MessageCircle size={18} />
            </button>
          </>
        )}
        {sidebarOpen && (
          <div className="conv-rail-recent-wrap">
            <div className="conv-rail-label">
              <Clock size={14} /> Recent
            </div>
            <ul className="conv-rail-recents">
              {renderRecentRows()}
            </ul>
          </div>
        )}
        <div className="conv-rail-footer">
          <button type="button" className="conv-rail-new" onClick={() => (onNewChat || onBack)?.()} title="New chat">
            <Plus size={16} />
            {sidebarOpen && <span>New chat</span>}
          </button>
          <button type="button" className="conv-rail-exit" onClick={onBack} title="Exit to studio home">
            <LogOut size={16} />
            {sidebarOpen && <span>Exit</span>}
          </button>
        </div>
        {!sidebarOpen && railFlyout && (
          <div className="conv-rail-flyout" role="dialog" aria-label="Recents">
            {railFlyout === 'search' && (
              <div className="conv-rail-flyout-search">
                <Search size={14} />
                <input
                  type="search"
                  placeholder="Search chats"
                  autoFocus
                  value={railQuery}
                  onChange={(e) => setRailQuery(e.target.value)}
                />
              </div>
            )}
            <div className="conv-rail-flyout-title">Recents</div>
            <ul className="conv-rail-flyout-list">
              {renderRecentRows(() => setRailFlyout(null))}
            </ul>
          </div>
        )}
      </aside>

      <div className="conv-studio-shell">
      {/* Ambient background glow & infographic network matching theme */}
      <div className="conv-studio-bg">
        {mode === 'infographic' && (
          <div className="infographic-bg-wrapper" style={{ position: 'absolute', inset: 0, opacity: 0.8, pointerEvents: 'none' }}>
            <InfographicAnimatedBackground theme="blue" mode="light" />
          </div>
        )}
        <div className="glow-orb-1" />
        <div className="glow-orb-2" />
      </div>

      {studioView !== 'library' && (
      <header className="conv-studio-header">
        <div className="conv-studio-header-left">
          <div className="conv-brand-badge">
            <img src={LogoImg} alt="" className="conv-brand-logo" />
            <span>Athena Studio</span>
          </div>
        </div>

        <div className="conv-studio-header-right">
          <div className="conv-credits-tag">
            <Sparkles size={14} />
            <span>{credits} credits</span>
          </div>
        </div>
      </header>
      )}

      {/* Main Generation & Showcase Body */}
      <main className={`conv-studio-body${studioView === 'library' ? ' is-library' : ''}`}>
        {studioView === 'library' ? (
          <WorkspaceImageLibrary
            workspaceId={workspaceId}
            onImageClick={(id) => {
              if (!id) return;
              setStudioView('chat');
              onSelectThread?.(id);
            }}
          />
        ) : (
        <div className="conv-chat-feed-container" style={{ width: '100%', paddingBottom: '40px' }}>
          {generations.map((gen, idx) => (
            <React.Fragment key={gen.id || idx}>
              {/* User Prompt Bubble */}
              <div className="conv-chat-row user-row">
                <div className="conv-user-bubble-container">
                  <div className="conv-user-bubble-actions">
                     <button className="conv-icon-btn" title="Copy" onClick={() => navigator.clipboard.writeText(gen.prompt)}><Copy size={16}/></button>
                     <button className="conv-icon-btn" title="Edit" onClick={() => { setChatInput(gen.prompt); focusComposer(); }}><Edit3 size={16}/></button>
                  </div>
                  <div className="conv-user-bubble">
                    {(gen.contextImages || []).length > 0 && (
                      <div className="conv-user-refs" aria-label="Reference images">
                        {gen.contextImages.map((img, i) => (
                          <button
                            key={`${img.src}-${i}`}
                            type="button"
                            className="conv-user-ref"
                            title={img.name || 'Reference'}
                            onClick={() => setFullscreenUrl(img.src)}
                          >
                            <img src={img.src} alt={img.name || 'Reference'} />
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="conv-user-bubble-text aig-md-preview">{highlightMarkdownSource(gen.prompt)}</span>
                  </div>
                </div>
                <div className="conv-chat-avatar user-avatar">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <User size={20} />
                  )}
                </div>
              </div>

              {/* AI Image Generation Bubble */}
              <div className="conv-chat-row ai-row" id={`gen-${gen.id || idx}`}>
                <div className="conv-chat-avatar ai-avatar">
                  <img src={LogoImg} alt="Athena" />
                </div>
                <div className="conv-showcase-container">
                  {(() => {
                    const raw = gen.raw || {};
                    const print = printFromRaw(raw);
                    const warns = warningsFromRaw(raw);
                    const charged = gen.creditsCharged ?? raw.creditsCharged;
                    const showBleed = Boolean(print?.bleedAvailable);
                    const frameStyle = getAspectDims(raw.formatId || formatId, print);
                    return (
                  <>
                  <div className="conv-unified-frame slide-in-left" style={frameStyle}>
                    <button
                      type="button"
                      className="conv-hero-open"
                      title="View larger"
                      onClick={() => setFullscreenUrl(gen.url)}
                    >
                      <img src={gen.url} alt={gen.prompt || "Generated output"} className={`conv-hero-img-front${print ? ' is-print' : ''}`} />
                    </button>
                  </div>
                  {print && (
                    <div className="conv-print-meta">
                      {printPhysicalLabel(print)}
                      {print.dpi ? ` · ${print.dpi} DPI` : ''}
                      {print.orientation ? ` · ${print.orientation}` : ''}
                    </div>
                  )}
                  {warns.length > 0 && !dismissedWarnings[gen.id] && (
                    <div className="conv-print-warning">
                      <AlertCircle size={14} />
                      <span>{warns.join(' ')}</span>
                      <button type="button" aria-label="Dismiss" onClick={() => setDismissedWarnings((p) => ({ ...p, [gen.id]: true }))}>
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  
                  <div className="conv-actions-bar-icons slide-in-bottom" style={{ width: '100%', display: 'flex', gap: '8px', position: 'relative' }}>
                     <button className={`conv-action-icon-btn ${userFeedback[gen.id] === 'like' ? 'active' : ''}`} title="Like" onClick={() => setUserFeedback(prev => ({...prev, [gen.id]: 'like'}))}><ThumbsUp size={16}/></button>
                     <button className={`conv-action-icon-btn ${userFeedback[gen.id] === 'dislike' ? 'active' : ''}`} title="Dislike" onClick={() => setUserFeedback(prev => ({...prev, [gen.id]: 'dislike'}))}><ThumbsDown size={16}/></button>
                     <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' }}></div>
                     <button className="conv-action-icon-btn" title="Share" onClick={() => handleShare(gen)}><Share2 size={16}/></button>
                     <button className="conv-action-icon-btn" title="Regenerate" onClick={() => handleRegenerate(gen)}><RotateCcw size={16}/></button>
                     <div className="conv-download-wrap">
                       <button
                         className="conv-action-icon-btn"
                         title="Download"
                         onClick={() => setDownloadMenuFor(downloadMenuFor === gen.id ? null : gen.id)}
                       >
                         <Download size={16}/>
                       </button>
                       {downloadMenuFor === gen.id && (
                         <div className="conv-download-menu" role="menu">
                           <button type="button" onClick={() => handleDownload(gen, 'png')}>PNG</button>
                           <button type="button" onClick={() => handleDownload(gen, 'jpg')}>JPG</button>
                           {mode === 'printable' || print ? (
                             <>
                               <button type="button" onClick={() => handleDownload(gen, 'pdf')}>PDF</button>
                               {showBleed && (
                                 <button type="button" onClick={() => handleDownload(gen, 'pdf', { bleed: true })}>
                                   PDF for print
                                 </button>
                               )}
                             </>
                           ) : (
                             <button type="button" onClick={() => handleDownload(gen, 'pdf')}>PDF</button>
                           )}
                         </div>
                       )}
                     </div>
                     <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '8px' }}>
                       <Sparkles size={12} /> {charged ? `-${charged} credits` : 'charged on success'}
                     </span>
                  </div>
                  </>
                    );
                  })()} 
                  {/* Conversational Follow-up (only for latest generation) */}
                  {idx === generations.length - 1 && !isGenerating && (
                    <div className="conv-followup-text slide-in-bottom">
                      {(() => {
                        const follow = FOLLOWUP_BY_MODE[mode] || FOLLOWUP_BY_MODE.image;
                        return (
                          <>
                            {follow.before}
                            <button
                              type="button"
                              className="conv-followup-link"
                              disabled={isGenerating}
                              onClick={() => handleSendPrompt(follow.actions[0].send, gen)}
                            >
                              {follow.actions[0].label}
                            </button>
                            {follow.mid}
                            <button
                              type="button"
                              className="conv-followup-link"
                              disabled={isGenerating}
                              onClick={() => handleSendPrompt(follow.actions[1].send, gen)}
                            >
                              {follow.actions[1].label}
                            </button>
                            {follow.after}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}

          {/* Pending Generation Block */}
          {isGenerating && (
            <React.Fragment>
              <div className="conv-chat-row user-row">
                <div className="conv-user-bubble-container">
                  <div className="conv-user-bubble">
                    {pendingRefs.length > 0 && (
                      <div className="conv-user-refs" aria-label="Reference images">
                        {pendingRefs.map((img, i) => (
                          <button
                            key={`pending-${img.src}-${i}`}
                            type="button"
                            className="conv-user-ref"
                            title={img.name || 'Reference'}
                            onClick={() => setFullscreenUrl(img.src)}
                          >
                            <img src={img.src} alt={img.name || 'Reference'} />
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="conv-user-bubble-text aig-md-preview">{highlightMarkdownSource(pendingPrompt)}</span>
                  </div>
                </div>
                <div className="conv-chat-avatar user-avatar">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <User size={20} />
                  )}
                </div>
              </div>
              <div className="conv-chat-row ai-row">
                <div className="conv-chat-avatar ai-avatar">
                  <img src={LogoImg} alt="Athena" />
                </div>
                <div className="conv-showcase-container">
                  {/* Status text above the image */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', minHeight: '24px' }}>
                    
                    <div key={activeStepIdx} className="slide-up-fade" style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
                      {GENERATION_STEPS[activeStepIdx] || GENERATION_STEPS[2]}
                    </div>
                  </div>
                  
                  <div className="conv-unified-frame slide-in-left" style={aspectStyle}>
                    <div style={{ width: '100%', height: '100%', background: 'var(--bg-surface, #ffffff)', position: 'relative', overflow: 'hidden' }}>
                      <div className="conv-gen-shimmer-sweep" />
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}

          {/* Previous Versions Selector (Scrolls to block) */}
          {generations.length > 0 && (
            <div className="conv-versions-bar" style={{ marginTop: '32px' }}>
              <span className="conv-versions-label">Previous versions</span>
              <div className="conv-version-pills">
                {generations.map((g, idx) => {
                  const isLatest = idx === generations.length - 1;
                  return (
                    <button
                      key={g.id || idx}
                      className="conv-version-pill"
                      onClick={() => {
                        const el = document.getElementById(`gen-${g.id || idx}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    >
                      {g.version || `v${idx + 1}`} {isLatest ? '(Latest)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMsg && (
            <div className="conv-error-banner">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
              <button
                className="conv-error-retry-btn"
                onClick={() => executeGenerate(pendingPrompt || basePrompt, workspaceId, folderId)}
              >
                Retry
              </button>
            </div>
          )}

          {/* Feedback Modal Overlay */}
          {showFeedbackModal && (
            <div className="conv-feedback-modal-overlay">
              <div className="conv-feedback-modal slide-in-bottom">
                <button className="conv-feedback-close" onClick={() => setShowFeedbackModal(false)}>
                  <X size={16} />
                </button>
                {feedbackThanks ? (
                  <div style={{ padding: '24px 0' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>Thank you!</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Your feedback helps us improve Athena.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a' }}>How do you like your first image?</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Your feedback helps us improve the Athena engine.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        className="conv-feedback-btn" 
                        onClick={() => { 
                          setFeedbackThanks(true); 
                          setFeedbackSubmitted(true);
                          setTimeout(() => setShowFeedbackModal(false), 2000);
                        }}
                      >
                        👍 Looks great!
                      </button>
                      <button 
                        className="conv-feedback-btn" 
                        onClick={() => { 
                          setFeedbackThanks(true); 
                          setFeedbackSubmitted(true);
                          setTimeout(() => setShowFeedbackModal(false), 2000);
                        }}
                      >
                        👎 Needs work
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
        )}
      </main>

      {studioView === 'chat' && (
      <footer className="conv-composer-dock">
        <div className="conv-composer-box">
          <div className="conv-composer-header">You</div>
          {(mode === 'printable' || mode === 'social' || mode === 'infographic') && (
            <div className="conv-edit-mode" role="group" aria-label="Edit type">
              {[
                { id: 'auto', label: 'Auto' },
                { id: 'spec', label: 'Copy' },
                { id: 'pixel', label: 'Visual' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={editMode === opt.id ? 'active' : ''}
                  onClick={() => setEditMode(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          <ImageGenContextAttach
            workspaceId={workspaceId}
            context={imageContext}
            onContextChange={setImageContext}
            compact
            plusMenu
            disabled={isGenerating}
          >
            {({ thumbs, trigger, composerBind, isDragOver }) => (
              <div className={`conv-composer-attach${isDragOver ? ' is-file-over' : ''}`} {...composerBind}>
                {thumbs}
                <div className="conv-composer-input-row">
                  {trigger}
                  <MarkdownPromptInput
                    ref={composerInputRef}
                    className="conv-composer-textarea"
                    placeholder={
                      mode === 'printable'
                        ? "Change the date, add a phone number, or make the background darker..."
                        : mode === 'infographic'
                          ? "Make the infographic more minimal and use larger typography..."
                          : "Make the colors softer and add warmer lighting..."
                    }
                    value={chatInput}
                    onPaste={composerBind.onPaste}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendPrompt();
                      }
                    }}
                    aria-label="Follow-up prompt"
                  />
                  <button
                    className="conv-send-btn"
                    disabled={isGenerating || !chatInput.trim()}
                    onClick={handleSendPrompt}
                  >
                    <span>Send</span>
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </ImageGenContextAttach>
        </div>
      </footer>
      )}

      {shareModalGen && (
        <div
          className="conv-share-overlay"
          onClick={() => setShareModalGen(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Share"
        >
          <div className="conv-share-card slide-in-bottom" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="conv-share-close" onClick={() => setShareModalGen(null)} aria-label="Close">
              <X size={16} />
            </button>
            <div className="conv-share-icon">
              <Link2 size={24} color="#334155" />
            </div>
            <h3>Share</h3>
            <p>Copy a link or send this design to a social app.</p>
            <div className="conv-share-link-label">Share your link</div>
            <div className="conv-share-link-row">
              <input type="text" readOnly value={`${window.location.origin}/share/${shareModalGen.id}`} />
              <button
                type="button"
                className={shareCopied ? 'is-copied' : ''}
                onClick={handleCopyShareLink}
                aria-label={shareCopied ? 'Copied' : 'Copy link'}
              >
                {shareCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <div className="conv-share-link-label">Share to</div>
            <div className="conv-share-apps">
              <button type="button" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/share/' + shareModalGen.id)}`)}>
                <span className="conv-share-app-icon" style={{ background: '#1877f2' }}><Facebook size={22} /></span>
                Facebook
              </button>
              <button type="button" onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out my AI creation on Athena!&url=${encodeURIComponent(window.location.origin + '/share/' + shareModalGen.id)}`)}>
                <span className="conv-share-app-icon" style={{ background: '#111827' }}>X</span>
                X
              </button>
              <button type="button" onClick={() => window.open(`https://api.whatsapp.com/send?text=Check out my AI creation on Athena! ${encodeURIComponent(window.location.origin + '/share/' + shareModalGen.id)}`)}>
                <span className="conv-share-app-icon" style={{ background: '#25d366' }}><MessageCircle size={22} /></span>
                WhatsApp
              </button>
              <button type="button" onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin + '/share/' + shareModalGen.id)}&text=Check out my AI creation!`)}>
                <span className="conv-share-app-icon" style={{ background: '#0088cc' }}><Send size={18} /></span>
                Telegram
              </button>
              <button type="button" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/share/' + shareModalGen.id)}`)}>
                <span className="conv-share-app-icon" style={{ background: '#0a66c2' }}><Linkedin size={22} /></span>
                LinkedIn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {fullscreenUrl && (
        <div className="conv-fullscreen-overlay" onClick={() => setFullscreenUrl(null)} role="dialog" aria-modal="true" aria-label="Image preview">
          <button className="conv-fullscreen-close" onClick={() => setFullscreenUrl(null)} aria-label="Close">
            <X size={20} />
          </button>
          <img
            src={fullscreenUrl}
            alt="Fullscreen preview"
            className="conv-fullscreen-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      </div>

      <ConfirmDialog dialog={confirmDialog} onCancel={() => setConfirmDialog(null)} />
      <ImageGenCreditsGate
        open={Boolean(creditsGate)}
        workspaceId={creditsGate?.workspaceId}
        needed={creditsGate?.needed}
        pool={creditsGate?.pool}
        personal={creditsGate?.personal}
        isTeam={creditsGate?.isTeam}
        onClose={() => setCreditsGate(null)}
        onBuy={onOpenBilling}
        onReady={async () => {
          setCreditsGate(null);
          const retry = creditsRetryRef.current;
          creditsRetryRef.current = null;
          if (typeof retry === 'function') await retry();
        }}
      />
    </div>
  );
}
