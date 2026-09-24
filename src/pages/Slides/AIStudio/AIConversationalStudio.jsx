import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, RotateCcw, Sparkles, Edit3, Wand2, Download, Maximize2, 
  X, Send, AlertCircle, CheckCircle2, ChevronRight, Copy, ChevronDown, Share2, User, ThumbsUp, ThumbsDown,
  Link2, Facebook, Twitter, MessageCircle, Linkedin
} from 'lucide-react';
import imageGenService from '../../../services/imageGenService.js';
import creditsService from '../../../services/creditsService.js';
import { resolvePresentationWorkspaceContext } from '../../../utils/presentationContext.js';
import LogoImg from '../../../assets/herologo.png';
import InfographicAnimatedBackground from './InfographicAnimatedBackground.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import './AIConversationalStudio.css';

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

export default function AIConversationalStudio({
  onBack,
  onOpenBilling,
  createContext = null,
  initialPrompt = '',
  activeMode = 'image',
  selectedModel = 'gpt-image-1',
  selectedFormat = 'square',
  selectedStyle = null,
  activeThreadId: propThreadId = null
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
  const [userFeedback, setUserFeedback] = useState({});
  
  const [chatInput, setChatInput] = useState('');

  // UI Modals
  const [fullscreenUrl, setFullscreenUrl] = useState(null);
  const [pendingPrompt, setPendingPrompt] = useState('');

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

    parts.push(mode === 'infographic' ? 'Infographic' : 'Image');
    if (styleId) {
      parts.push(typeof styleId === 'string' ? styleId.charAt(0).toUpperCase() + styleId.slice(1) : 'Custom');
    }
    return parts;
  }, [modelId, formatId, mode, styleId]);

  const isInitializedRef = useRef(false);

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

  // Scroll to bottom when new messages/generations are added or generation starts
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generations, isGenerating]);

  // Trigger feedback modal after first generation
  useEffect(() => {
    if (generations.length === 1 && !isGenerating && !feedbackSubmitted) {
      const timer = setTimeout(() => setShowFeedbackModal(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [generations.length, isGenerating, feedbackSubmitted]);
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
              threadId: tId
            });
          }
          if (m.content && i > 1) {
            chatItems.push({ role: 'assistant', content: m.content });
          }
        }
      }

      setGenerations(loadedGens);
      setActiveGenIndex(loadedGens.length - 1);
      setConversation(chatItems);
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
    
    setIsGenerating(true);
    setPendingPrompt(promptText);
    setErrorMsg('');

    try {
      const payload = {
        mode: mode || 'image',
        folderId: activeFld,
        modelId: modelId || 'gpt-image-1',
        formatId: formatId || (mode === 'infographic' ? 'landscape' : 'square'),
        prompt: mode === 'infographic' ? `${promptText.trim()}, clean minimalist layout, no text, no words, empty placeholders` : promptText.trim()
      };
      if (styleId) {
        if (VALID_STYLES.includes(styleId)) {
          payload.style = styleId;
          payload.styleId = styleId;
        } else if (mode === 'infographic' && VALID_ARCHETYPES.includes(styleId)) {
          payload.archetypeHint = styleId;
        }
      }

      const res = await imageGenService.generate(activeWs, payload);
      const gen = res?.generation;
      const newThreadId = res?.thread?.id || gen?.threadId || threadId;
      if (newThreadId) setThreadId(newThreadId);

      const imgUrl = gen?.url || gen?.asset?.url || null;
      if (!imgUrl) {
        throw new Error("No image returned from generation service.");
      }

      const newGenItem = {
        id: gen.id,
        url: imgUrl,
        prompt: promptText,
        version: `v${generations.length + 1}`,
        threadId: newThreadId,
        raw: gen
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
      const msg = err?.data?.message || err.message || "Image generation failed. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Conversational Re-Prompt / Tweak
  const handleSendPrompt = async () => {
    const text = chatInput.trim();
    if (!text || isGenerating || !workspaceId) return;

    setChatInput('');
    setIsGenerating(true);
    setPendingPrompt(text);
    setErrorMsg('');

    try {
      let res;
      const parentGen = activeGeneration || generations[generations.length - 1];

      const tweakText = mode === 'infographic' ? `${text}, maintain clean minimalist layout, no text, no words` : text;

      if (threadId) {
        res = await imageGenService.sendThreadMessage(workspaceId, threadId, tweakText, {
          fromGenerationId: parentGen?.id,
          mode,
          modelId
        });
      } else if (parentGen?.id) {
        res = await imageGenService.tweak(workspaceId, parentGen.id, tweakText, {
          mode,
          modelId
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
        res = await imageGenService.generate(workspaceId, fallbackBody);
      }

      const gen = res?.generation;
      const nextThreadId = res?.thread?.id || gen?.threadId || threadId;
      if (nextThreadId) setThreadId(nextThreadId);

      const imgUrl = gen?.url || gen?.asset?.url || null;
      if (!imgUrl) throw new Error("No image was returned from refinement.");

      const newGenItem = {
        id: gen.id,
        url: imgUrl,
        prompt: text,
        version: `v${generations.length + 1}`,
        threadId: nextThreadId,
        raw: gen
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
      const msg = err?.data?.message || err.message || "Failed to refine image. Please try again.";
      setErrorMsg(msg);
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
    setErrorMsg('');

    try {
      const regenBody = {
        mode,
        modelId,
        formatId,
        prompt: mode === 'infographic' ? `${basePrompt}, clean minimalist layout, no text, no words, empty placeholders` : basePrompt
      };
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
        raw: gen
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
      setErrorMsg(err.message || "Regeneration failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download action
  const handleDownload = async (targetGen) => {
    const gen = targetGen || activeGeneration;
    if (!gen?.id || !workspaceId) return;
    try {
      await imageGenService.downloadAndSave(workspaceId, gen.id, 'png');
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback direct link download
      if (gen.url) {
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

  // Share action
  const handleShare = async (gen) => {
    if (gen?.id) {
      setShareModalGen(gen);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareModalGen?.id) return;
    const link = `${window.location.origin}/share/${shareModalGen.id}`;
    try {
      await navigator.clipboard.writeText(link);
      alert('Public share link copied to clipboard!');
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

  const getAspectDims = (fId) => {
    switch (fId) {
      case 'landscape': return { aspectRatio: '16/9', maxWidth: '720px' };
      case 'portrait': return { aspectRatio: '9/16', maxWidth: '360px' };
      case 'landscape-3-2': return { aspectRatio: '3/2', maxWidth: '640px' };
      case 'portrait-2-3': return { aspectRatio: '2/3', maxWidth: '400px' };
      case 'square': default: return { aspectRatio: '1/1', maxWidth: '480px' };
    }
  };
  const aspectStyle = getAspectDims(formatId);

  return (
    <div className="conv-studio-root">
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

      {/* Top Header */}
      <header className="conv-studio-header">
        <div className="conv-studio-header-left">
          <button className="conv-back-btn" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="conv-brand-badge">
            <img src={LogoImg} alt="Athena" className="conv-brand-logo" />
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

      {/* Main Generation & Showcase Body */}
      <main className="conv-studio-body">
        
        {/* Dynamic Chat Feed */}
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
                    <span className="conv-user-bubble-text">{gen.prompt}</span>
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
                  <div className="conv-unified-frame slide-in-left">
                    <img src={gen.url} alt={gen.prompt || "Generated output"} className="conv-hero-img-front" />
                  </div>
                  
                  {/* Actions & Credits */}
                  <div className="conv-actions-bar-icons slide-in-bottom" style={{ width: '100%', display: 'flex', gap: '8px' }}>
                     <button className={`conv-action-icon-btn ${userFeedback[gen.id] === 'like' ? 'active' : ''}`} title="Like" onClick={() => setUserFeedback(prev => ({...prev, [gen.id]: 'like'}))}><ThumbsUp size={16}/></button>
                     <button className={`conv-action-icon-btn ${userFeedback[gen.id] === 'dislike' ? 'active' : ''}`} title="Dislike" onClick={() => setUserFeedback(prev => ({...prev, [gen.id]: 'dislike'}))}><ThumbsDown size={16}/></button>
                     <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' }}></div>
                     <button className="conv-action-icon-btn" title="Share" onClick={() => handleShare(gen)}><Share2 size={16}/></button>
                     <button className="conv-action-icon-btn" title="Regenerate" onClick={() => handleRegenerate(gen)}><RotateCcw size={16}/></button>
                     <button className="conv-action-icon-btn" title="Download" onClick={() => handleDownload(gen)}><Download size={16}/></button>
                     <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '8px' }}>
                       <Sparkles size={12} /> -1 credit
                     </span>
                  </div>
                  
                  {/* Conversational Follow-up (only for latest generation) */}
                  {idx === generations.length - 1 && !isGenerating && (
                    <div className="conv-followup-text slide-in-bottom">
                      Would you like to adjust this image by <strong>adding more specific Indonesian ingredients</strong> like tempeh or soft-boiled eggs, or would you prefer to <strong>change the lighting style</strong>?
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
                    <span className="conv-user-bubble-text">{pendingPrompt}</span>
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

          {/* Share Modal */}
          {shareModalGen && (
            <div className="conv-fullscreen-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
              <div className="slide-in-bottom" style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '380px', position: 'relative', padding: '40px 24px 32px 24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <button 
                  onClick={() => setShareModalGen(null)}
                  style={{ position: 'absolute', top: '16px', right: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={16} />
                </button>

                <div style={{ position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)', background: '#f8fafc', padding: '12px', borderRadius: '50%', border: '4px solid #fff' }}>
                   <Link2 size={24} color="#334155" />
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#0f172a', fontWeight: '700' }}>Share with Friends</h3>
                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>Trading is more effective when<br/>you connect with friends!</p>
                
                <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Share your link</div>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', padding: '12px 16px', border: '1px solid #f1f5f9' }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/share/${shareModalGen.id}`}
                      style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '13px', color: '#334155', outline: 'none' }}
                    />
                    <button onClick={handleCopyShareLink} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: 0 }}>
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Share to</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/share/' + shareModalGen.id)}`)}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Facebook size={24} /></div>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Facebook</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out my AI creation on Athena!&url=${encodeURIComponent(window.location.origin + '/share/' + shareModalGen.id)}`)}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: '600' }}>X</div>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>X</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.open(`https://api.whatsapp.com/send?text=Check out my AI creation on Athena! ${encodeURIComponent(window.location.origin + '/share/' + shareModalGen.id)}`)}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><MessageCircle size={24} /></div>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Whatsapp</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin + '/share/' + shareModalGen.id)}&text=Check out my AI creation!`)}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0088cc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Send size={20} style={{ transform: 'translateX(-2px)' }} /></div>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Telegram</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/share/' + shareModalGen.id)}`)}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Linkedin size={24} /></div>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>LinkedIn</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      </main>

      {/* Conversational Re-Prompt Composer Dock */}
      <footer className="conv-composer-dock">
        <div className="conv-composer-box">
          <div className="conv-composer-header">You</div>
          <div className="conv-composer-input-row">
            <textarea
              ref={composerInputRef}
              className="conv-composer-textarea"
              placeholder={
                mode === 'infographic'
                  ? "Make the infographic more minimal and use larger typography..."
                  : "Make the colors softer and add warmer lighting..."
              }
              value={chatInput}
              rows={1}
              onChange={(e) => {
                setChatInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
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
      </footer>

      {/* Fullscreen Preview Modal */}
      {fullscreenUrl && (
        <div className="conv-fullscreen-overlay" onClick={() => setFullscreenUrl(null)}>
          <button className="conv-fullscreen-close" onClick={() => setFullscreenUrl(null)}>
            <X size={20} />
          </button>
          <img src={fullscreenUrl} alt="Fullscreen preview" className="conv-fullscreen-img" />
        </div>
      )}
    </div>
  );
}
