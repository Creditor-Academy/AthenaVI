import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Image as ImageIcon,
  ChevronDown, Mic, Sparkles, X, Lightbulb,
  ListOrdered, Clock, Columns2, BarChart3, Network, List, RefreshCw, Hexagon
} from 'lucide-react';
import imageGenService from '../../../services/imageGenService.js';
import creditsService from '../../../services/creditsService.js';
import LogoImg from '../../../assets/herologo.png';
import geminiLogo from '../../../assets/google_gemini_logo.svg';
import chatgptLogo from '../../../assets/chatgpt_logo.svg';

import OriginalAIImageStudio from './AIImageStudio.jsx';
import AIConversationalStudio from './AIConversationalStudio.jsx';

import style3dImg from '../../../assets/slides_icons/style_3d.jpg';
import styleBauhausImg from '../../../assets/slides_icons/style_bauhaus.jpg';
import styleBoldPosterImg from '../../../assets/slides_icons/style_bold_poster.jpg';
import styleCinematicImg from '../../../assets/slides_icons/style_cinematic.jpg';
import styleFlatLineImg from '../../../assets/slides_icons/style_flat_line.jpg';
import styleGouacheImg from '../../../assets/slides_icons/style_gouache.jpg';
import styleIllustrationImg from '../../../assets/slides_icons/style_illustration.jpg';
import styleIsometricImg from '../../../assets/slides_icons/style_isometric.jpg';
import styleMeshImg from '../../../assets/slides_icons/style_mesh.jpg';
import styleModernArtImg from '../../../assets/slides_icons/style_modern_art.jpg';
import styleNeonGlowImg from '../../../assets/slides_icons/style_neon_glow.jpg';
import stylePhotoImg from '../../../assets/slides_icons/style_photo.jpg';
import styleSceneImg from '../../../assets/slides_icons/style_scene.jpg';
import styleSpotColorImg from '../../../assets/slides_icons/style_spot_color.jpg';
import styleStillLifeImg from '../../../assets/slides_icons/style_still_life.jpg';
import styleWatercolorImg from '../../../assets/slides_icons/style_watercolor.jpg';

import layoutProcess from '../../../assets/layouts/layout_process_v2.jpg';
import layoutTimeline from '../../../assets/layouts/layout_timeline_v2.jpg';
import layoutComparison from '../../../assets/layouts/layout_comparison_v2.jpg';
import layoutStats from '../../../assets/layouts/layout_stats_v2.jpg';
import layoutHierarchy from '../../../assets/layouts/layout_hierarchy_v2.jpg';
import layoutList from '../../../assets/layouts/layout_list_v2.jpg';
import layoutCycle from '../../../assets/layouts/layout_cycle_v2.jpg';

const layoutImages = {
  process: layoutProcess,
  timeline: layoutTimeline,
  comparison: layoutComparison,
  stats: layoutStats,
  hierarchy: layoutHierarchy,
  list: layoutList,
  cycle: layoutCycle
};

import './AIImageGenerationUpdate.css';
import InfographicAnimatedBackground from './InfographicAnimatedBackground.jsx';

const RANDOM_PROMPTS = [
  "Create a minimalist and elegant brand poster for my artisanal coffee shop, featuring a warm beige and mocha color palette, a single latte cup with perfect latte art, and clean sans-serif typography.",
  "A highly detailed, cinematic photograph of a futuristic cyberpunk cafe at night, illuminated by soft neon pink and cyan lights, with steam rising from a cup of coffee on a metallic table.",
  "An expansive, surreal landscape showing floating islands connected by glowing vines, with waterfalls cascading into the starry night sky, rendered in a 3D fantasy style with vivid purples and blues.",
  "A striking, geometric pop-art illustration of a vintage sports car driving down a coastal highway at sunset, using bold contrasting colors like bright yellow, deep teal, and crimson.",
  "Design a modern corporate infographic layout explaining artificial intelligence, using a clean isometric aesthetic, translucent glassmorphism elements, and a professional blue and silver color scheme.",
  "A macro photography shot of a solitary dewdrop on a vibrant green fern leaf in a dense, misty forest, capturing the intricate reflection of the surrounding ancient trees inside the drop.",
  "An isometric 3D cozy study room belonging to a lo-fi producer, filled with analog synthesizers, vinyl records, scattered sheet music, and a purring cat sleeping on a vintage rug."
];

const RANDOM_INFOGRAPHIC_PROMPTS = [
  "A high-level business workflow infographic comparing Q3 revenue vs Q4 projections, using a clean corporate blue color palette.",
  "A modern technology stack timeline showing the evolution from Web 1.0 to Web 3.0, with isometric icons and a dark mode aesthetic.",
  "An educational hierarchy chart breaking down the layers of a neural network model, styled in a sleek, scientific medical visualization style.",
  "A playful, colorful step-by-step process guide for planting an indoor garden, with soft pastel backgrounds and organic shapes.",
  "A professional statistical breakdown of global renewable energy usage, featuring bold typography, large numbers, and minimalist graphs.",
  "A side-by-side product comparison chart showing the features of a smart home ecosystem, using translucent glassmorphism containers and neon accents."
];

const TOPICS = [
  'Modern Product Launch',
  'Futuristic Cyberpunk City',
  'Minimalist Bauhaus Poster',
  'Isometric 3D Workspace',
  'Surreal Nature Landscape',
  'Vibrant Pop Art Portrait',
  'Cinematic Sci-Fi Concept'
];

const INFOGRAPHIC_TOPICS = ['Presentations', 'Reports', 'Dashboards', 'Timelines', 'Workflows', 'Mind Maps'];
export default function AIImageGenerationUpdate({ onBack, onOpenBilling, createContext }) {
  const [catalogs, setCatalogs] = useState({ models: [], formats: [], styles: [], archetypes: [] });
  const [activeMode, setActiveMode] = useState('image'); // 'image' or 'infographic'
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [credits, setCredits] = useState(0);
  const [recentChats, setRecentChats] = useState([]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const chatboxRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setPrompt((prev) => prev ? prev + ' ' + transcript : transcript);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) return alert('Speech recognition not supported in this browser.');
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatboxRef.current && !chatboxRef.current.contains(event.target)) {
        setIsComposerExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [launchStudio, setLaunchStudio] = useState(false);
  const [backgroundTheme, setBackgroundTheme] = useState('blue');
  const [backgroundMode, setBackgroundMode] = useState('dark');

  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const [topicIndex, setTopicIndex] = useState(0);
  const [fadeTopic, setFadeTopic] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeTopic(false);
      setTimeout(() => {
        setTopicIndex(prev => (prev + 1) % TOPICS.length);
        setFadeTopic(true);
      }, 500); // 500ms fade duration
    }, 4000); // Change every 4s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadCatalogs() {
      try {
        const cats = await imageGenService.getCatalogs();
        setCatalogs(cats);
        // Default model and format
        if (cats.models.length > 0) setSelectedModel(cats.models[0].id);
        if (cats.formats.length > 0) setSelectedFormat(cats.formats[0].id);
      } catch(e) {
        console.error("Failed to load catalogs", e);
      }
    }
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 150) + 'px';
    }
  }, [prompt]);

  const handleInspire = async () => {
    if (isTyping) return;
    const promptsPool = activeMode === 'infographic' ? RANDOM_INFOGRAPHIC_PROMPTS : RANDOM_PROMPTS;
    const random = promptsPool[Math.floor(Math.random() * promptsPool.length)];
    setIsTyping(true);
    setPrompt('');
    let currentText = '';
    
    for (let i = 0; i < random.length; i++) {
      currentText += random[i];
      setPrompt(currentText);
      await new Promise(r => setTimeout(r, 20));
    }
    setIsTyping(false);
  };

  useEffect(() => {
    async function loadUserSession() {
      try {
        const balance = await creditsService.getPersonalBalance();
        setCredits(balance.personalCredits || 0);

        const workspaceId = createContext?.workspaceId || null;
        const history = await imageGenService.listThreads(workspaceId, { take: 10 });
        setRecentChats(history || []);
      } catch(e) {
        console.error("Failed to load user session", e);
      }
    }
    loadUserSession();
  }, [createContext]);

  const getStyleImage = (styleId) => {
    switch(styleId) {
      case '3d': 
      case '3d_render': return style3dImg;
      case 'bauhaus': return styleBauhausImg;
      case 'bold-poster': 
      case 'bold_poster': return styleBoldPosterImg;
      case 'cinematic': return styleCinematicImg;
      case 'flat-line': 
      case 'flat_line': return styleFlatLineImg;
      case 'gouache': return styleGouacheImg;
      case 'illustration': 
      case 'flat_illustration': return styleIllustrationImg;
      case 'isometric': return styleIsometricImg;
      case 'mesh': return styleMeshImg;
      case 'modern-art': 
      case 'modern_art': return styleModernArtImg;
      case 'neon-glow': 
      case 'neon_glow':
      case 'neon': return styleNeonGlowImg;
      case 'photo': 
      case 'photoreal': return stylePhotoImg;
      case 'scene': return styleSceneImg;
      case 'spot-color': 
      case 'spot_color': return styleSpotColorImg;
      case 'still-life': 
      case 'still_life': return styleStillLifeImg;
      case 'watercolor': return styleWatercolorImg;
      default: return `https://picsum.photos/seed/${styleId}/400/300`;
    }
  };

  const getArchetypeIcon = (archId) => {
    switch (archId) {
      case 'process': return <ListOrdered size={24} className="arch-icon" />;
      case 'timeline': return <Clock size={24} className="arch-icon" />;
      case 'comparison': return <Columns2 size={24} className="arch-icon" />;
      case 'stats': return <BarChart3 size={24} className="arch-icon" />;
      case 'hierarchy': return <Network size={24} className="arch-icon" />;
      case 'list': return <List size={24} className="arch-icon" />;
      case 'cycle': return <RefreshCw size={24} className="arch-icon" />;
      default: return <Hexagon size={24} className="arch-icon" />;
    }
  };

  const getModelIcon = (modelId) => {
    const model = catalogs.models?.find(m => m.id === modelId) || {};
    const modelName = model.name || '';
    const isNano = String(modelName).toLowerCase().includes('nano') || String(modelId).toLowerCase().includes('nano');
    const isGemini = String(modelId).includes('google') || String(modelId).includes('gemini');
    const isDalle = String(modelId).includes('dall-e') || String(modelId).includes('openai') || String(modelId).includes('gpt');
    
    // Nano Banana gets the original Gemini wordmark (with text)
    if (isNano) {
      return <img src={geminiLogo} alt="Nano Banana" style={{ width: 48, height: 16, objectFit: 'contain' }} />;
    }
    // Standard Gemini gets the icon (without text)
    if (isGemini) {
      // We don't have the icon version locally, so crop the wordmark SVG using object-position
      return <div style={{ width: 14, height: 14, overflow: 'hidden', display: 'inline-block' }}><img src={geminiLogo} alt="Gemini" style={{ height: 14, objectFit: 'cover', objectPosition: 'left' }} /></div>;
    }
    if (isDalle) {
      return <img src={chatgptLogo} alt="OpenAI" style={{ width: 14, height: 14, objectFit: 'contain' }} />;
    }
    return <Sparkles size={14} color="var(--text-secondary, #a0a0a0)"/>;
  };

  const renderFormatIcon = (formatObj) => {
    if (!formatObj) return null;
    const w = formatObj.width || 1024;
    const h = formatObj.height || 1024;
    const maxDim = 14;
    const isWider = w > h;
    const rw = isWider ? maxDim : (w/h) * maxDim;
    const rh = isWider ? (h/w) * maxDim : maxDim;
    return (
      <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ width: rw, height: rh, border: '2px solid currentColor', borderRadius: 2, opacity: 0.7 }} />
      </div>
    );
  };

  const selectedModelObj = catalogs.models.find(m => m.id === selectedModel);

  const currentStyles = activeMode === 'infographic' ? catalogs.archetypes : catalogs.styles;

  if (launchStudio || activeThreadId) {
    return (
      <AIConversationalStudio 
        onBack={() => {
          setLaunchStudio(false);
          setActiveThreadId(null);
        }}
        onOpenBilling={onOpenBilling}
        createContext={{
          ...createContext,
          threadId: activeThreadId
        }}
        initialPrompt={prompt}
        activeMode={activeMode}
        selectedModel={selectedModel}
        selectedFormat={selectedFormat}
        selectedStyle={selectedStyle}
        activeThreadId={activeThreadId}
      />
    );
  }

  return (
    <div className="ai-gen-container">
      {/* Sidebar */}
      <aside className="ai-gen-sidebar">
        
        <div className="mode-toggle">
          <span className={activeMode === 'image' ? 'active' : ''} onClick={() => setActiveMode('image')}>Images</span>
          <span className={activeMode === 'infographic' ? 'active' : ''} onClick={() => setActiveMode('infographic')}>Infographics</span>
        </div>

        <div className="sidebar-actions">
           <button className="new-chat-btn"><Plus size={16}/> New chat</button>
           <div className="search-bar">
             <Search size={16}/> 
             <input type="text" placeholder="Search chats" />
           </div>
        </div>

        <nav className="sidebar-nav">
           <a href="#" className="active"><ImageIcon size={18}/> Images</a>
        </nav>

        <div className="sidebar-recent">
           <h3>Recent</h3>
           <ul>
             {recentChats.map((chat, idx) => (
               <li key={chat.id || idx} onClick={() => setActiveThreadId(chat.id)} style={{ cursor: 'pointer' }}>
                 {chat.title || chat.prompt || chat.name || "Untitled chat"}
               </li>
             ))}
             {recentChats.length === 0 && <li style={{color: 'var(--text-secondary, #6b7280)', cursor: 'default'}}>No recent chats</li>}
           </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ai-gen-main" style={{ position: 'relative' }}>
        {activeMode === 'infographic' && (
          <div className="infographic-bg-wrapper">
            <InfographicAnimatedBackground theme="blue" mode="light" />
          </div>
        )}

        <header 
          className="main-header" 
          style={{ 
            position: 'relative', 
            zIndex: 1, 
            ...(activeMode === 'infographic' && {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flex: 1,
              width: '100%',
              paddingBottom: '40px'
            })
          }}
        >
          {activeMode === 'image' ? (
            <>
              <h1>
                Create visuals for{' '}
                <span className={`topic-dynamic ${fadeTopic ? 'fade-in' : 'fade-out'}`}>{TOPICS[topicIndex % TOPICS.length]}</span>
              </h1>
              <p>Try a template or describe a visual in chat. Create with Athena AI.</p>
            </>
          ) : (
            <>
              <h1>
                Create infographic for{' '}
                <span className={`topic-dynamic ${fadeTopic ? 'fade-in' : 'fade-out'}`}>{INFOGRAPHIC_TOPICS[topicIndex % INFOGRAPHIC_TOPICS.length]}</span>
              </h1>
              <p>Describe your data and let Athena structure the perfect visual layout.</p>
            </>
          )}
        </header>

        {activeMode === 'image' && (
          <section className="styles-grid-container" style={{ position: 'relative', zIndex: 1 }}>
            <div className="styles-grid-title">Choose a style</div>
            <div className="styles-grid">
              {catalogs.styles.map(style => (
                <div 
                  className={`style-card ${selectedStyle === style.id ? 'selected' : ''}`} 
                  key={style.id} 
                  onClick={() => setSelectedStyle(style.id)}
                  style={{ backgroundImage: `url(${getStyleImage(style.id)})` }}
                >
                  <div className="style-card-overlay">
                    <span>{style.label || style.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="chatbox-section" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '24px' }}>
          <div className="bg-wave-graphic full-screen-wave">
            <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,213.3C672,203,768,149,864,138.7C960,128,1056,160,1152,181.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          <div className={`chatbox-container ${isComposerExpanded ? 'expanded' : ''}`} ref={chatboxRef}>
            
            {activeMode === 'infographic' && isComposerExpanded && (
              <div className="composer-expanded-area">
                <div className="composer-expanded-title">Choose an infographic layout</div>
                <div className="archetype-grid-expanded">
                  {catalogs.archetypes.map(arch => (
                    <div 
                      className={`archetype-expanded-card ${selectedStyle === arch.id ? 'active' : ''}`} 
                      key={arch.id}
                      onClick={() => {
                        setSelectedStyle(arch.id);
                        // Do not auto-collapse to allow user to type prompt immediately
                        if(textareaRef.current) textareaRef.current.focus();
                      }}
                    >
                      <div className="arch-card-image">
                        <img src={layoutImages[arch.id]} alt={arch.label} />
                      </div>
                      <div className="arch-card-info">
                        <div className="arch-card-title">{arch.label || arch.id}</div>
                      </div>
                      {selectedStyle === arch.id && <div className="arch-card-check">✓</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeMode === 'infographic' && selectedStyle && (
              <div className="selected-layout-chip-container">
                <div className="selected-layout-chip">
                  <span>Layout: <strong>{catalogs.archetypes.find(a => a.id === selectedStyle)?.label}</strong></span>
                  <button className="clear-chip-btn" onClick={() => setSelectedStyle('')}>
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

             {uploadedImage && (
               <div className="uploaded-image-preview" style={{ padding: '0 24px', marginTop: '16px' }}>
                 <div style={{ position: 'relative', display: 'inline-block' }}>
                   <img src={uploadedImage} alt="Uploaded" style={{ height: '60px', borderRadius: '8px', border: '1px solid #e5e7eb', objectFit: 'cover' }} />
                   <button onClick={() => setUploadedImage(null)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', borderRadius: '50%', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <X size={12}/>
                   </button>
                 </div>
               </div>
             )}
             <div className="chatbox-input">
                <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
                <button className="attach-btn" onClick={() => fileInputRef.current?.click()}><Plus size={20}/></button>
                <textarea 
                  ref={textareaRef}
                  placeholder={activeMode === 'image' ? "Describe your visual..." : "Describe your infographic..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={() => {
                    if (activeMode === 'infographic') setIsComposerExpanded(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
                      e.preventDefault();
                      setLaunchStudio(true);
                    }
                  }}
                  rows={1}
                />
                <button className="mic-btn" onClick={toggleMic} style={{ color: isListening ? '#ef4444' : '' }}><Mic size={20}/></button>
                <button className="inspire-btn" title="Inspire Me" onClick={handleInspire} disabled={isTyping} style={{ opacity: isTyping ? 0.5 : 1 }}>
                  <Lightbulb size={20}/>
                </button>
             </div>
             
             <div className="chatbox-footer">
                <div className="chatbox-selectors" style={{ overflow: 'visible', flexWrap: 'wrap' }}>
                  
                  <div className="custom-dropdown">
                    <button className="dropdown-trigger" onClick={() => setShowModelDropdown(!showModelDropdown)}>
                      {getModelIcon(selectedModel)}
                      <span>{selectedModelObj?.name || selectedModel || "GPT Image"}</span>
                      <ChevronDown size={14}/>
                    </button>
                    {showModelDropdown && (
                      <div className="model-modal">
                        <div className="model-modal-content">
                        {(() => {
                          const buckets = new Map();
                          catalogs.models.forEach((m) => {
                            const key = m.provider || (String(m.id).includes('gemini') ? 'gemini' : 'openai');
                            if (!buckets.has(key)) buckets.set(key, []);
                            buckets.get(key).push(m);
                          });
                          const groups = [];
                          ['openai', 'gemini'].forEach((key) => {
                            if (buckets.has(key)) groups.push({ id: key, label: key === 'openai' ? 'OpenAI' : 'Google', models: buckets.get(key) });
                          });
                          return groups.map(g => (
                            <div key={g.id} className="model-group">
                              <div className="model-group-title">{g.label}</div>
                              {g.models.map(m => (
                                <div 
                                  key={m.id} 
                                  className={`model-card ${selectedModel === m.id ? 'active' : ''}`}
                                  onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); }}
                                >
                                  <div className="model-card-top">
                                    <div className="model-name">
                                      {getModelIcon(m.id)} {m.name || m.id}
                                    </div>
                                    {m.recommended && <span className="recommended-badge">Recommended</span>}
                                  </div>
                                  <div className="model-desc">{m.description || "High performance AI image generation model."}</div>
                                  <div className="model-meta">
                                    {m.maxImageSize && <span>{m.maxImageSize} • </span>}
                                    <span>{m.quality === 'high' ? 'High quality' : 'Medium quality'}</span>
                                    {selectedModel === m.id && <span className="selected-text">✓ Selected</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ));
                        })()}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="custom-dropdown">
                    <button className="dropdown-trigger" onClick={() => setShowFormatDropdown(!showFormatDropdown)}>
                      {(() => {
                        const selFormat = catalogs.formats.find(f => f.id === selectedFormat);
                        if (!selFormat) return <span>Size</span>;
                        return (
                          <>
                            {renderFormatIcon(selFormat)}
                            <span>{selFormat.name || selFormat.id}</span>
                            <ChevronDown size={14}/>
                          </>
                        );
                      })()}
                    </button>
                    {showFormatDropdown && (
                      <div className="model-modal" style={{ right: 0, left: 'auto', minWidth: '180px' }}>
                        <div className="model-modal-content">
                          <div className="model-group-title">Aspect Ratio</div>
                          {catalogs.formats.map(f => (
                            <div 
                              key={f.id} 
                              className={`model-card ${selectedFormat === f.id ? 'active' : ''}`}
                              onClick={() => { setSelectedFormat(f.id); setShowFormatDropdown(false); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                              {renderFormatIcon(f)}
                              <span>{f.name || f.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  className="generate-btn" 
                  onClick={() => setLaunchStudio(true)}
                  style={{ background: 'var(--primary, #2563eb)', color: '#ffffff' }}
                >
                  <Sparkles size={16}/> Generate
                </button>
             </div>
          </div>
        </section>
      </main>
    </div>
  )
}
