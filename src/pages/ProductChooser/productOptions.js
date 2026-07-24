import studioImage from '../../assets/digitaltwin01.png';
import slidesImage from '../../assets/Template_Image/temp1.png';

/* ── Feature card images ─────────────────────────────────────────────────── */
import videoEditorImg from '../../assets/Video Studio.png';
import photoAvatarImg from '../../assets/AvtarHero.png';
import promptAvatarImg from '../../assets/digitaltwin03.png';
import aiPresentationImg from '../../assets/Template_Image/Coporate.png';
import presentationImg from '../../assets/Template_Image/AllTemplate.png';
import aiImageGenImg from '../../assets/Visual AI Agent.png';
import aiPosterGenImg from '../../assets/Campaign.PNG';
import canvasStudioImg from '../../assets/ProductDemo.png';

/* ── Feature cards shown in the Hub carousel ─────────────────────────────── */

export const HUB_FEATURES = [
  {
    id: 'video-editor',
    title: 'Video Editor Tool',
    description: 'Professional timeline video creation',
    category: 'Video Studio',
    image: videoEditorImg,
    gradient: ['#9333ea', '#7e22ce'], // Canva purple style
    bgColor: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    iconBg: '#9333ea',
    icon: 'video',
    route: '/dashboard',
    section: 'home',
  },
  {
    id: 'photo-avatar',
    title: 'Photo Avatar Generation',
    description: 'Generate lifelike avatars from photos',
    category: 'Video Studio',
    image: photoAvatarImg,
    gradient: ['#059669', '#047857'], // Canva green style
    bgColor: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    iconBg: '#059669',
    icon: 'camera',
    route: '/dashboard/avatars',
    section: 'avatars',
  },
  {
    id: 'prompt-avatar',
    title: 'Prompt Avatar Generation',
    description: 'Create custom presenters with AI text prompts',
    category: 'Video Studio',
    image: promptAvatarImg,
    gradient: ['#0284c7', '#0369a1'], // Canva blue style
    bgColor: 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)',
    iconBg: '#0284c7',
    icon: 'sparkles',
    route: '/dashboard/create-avatar',
    section: 'create-avatar',
  },
  {
    id: 'ai-presentations',
    title: 'AI Presentation Creation',
    description: 'Generate complete decks from prompt',
    category: 'Slides',
    image: aiPresentationImg,
    gradient: ['#ea580c', '#c2410c'], // Canva orange style
    bgColor: 'linear-gradient(135deg, #fb923c 0%, #c2410c 100%)',
    iconBg: '#ea580c',
    icon: 'presentation',
    route: '/slides/ppt-generator',
    section: 'ppt-generator',
  },
  {
    id: 'presentations',
    title: 'Presentation Creation',
    description: 'Build decks with rich templates',
    category: 'Slides',
    image: presentationImg,
    gradient: ['#d97706', '#b45309'], // Canva yellow/amber style
    bgColor: 'linear-gradient(135deg, #facc15 0%, #b45309 100%)',
    iconBg: '#d97706',
    icon: 'slides',
    route: '/slides/home',
    section: 'home',
  },
  {
    id: 'ai-image-gen',
    title: 'AI Image Generation',
    description: 'Turn text into high quality visual graphics',
    category: 'Slides',
    image: aiImageGenImg,
    gradient: ['#ec4899', '#be185d'], // Canva pink/magenta style
    bgColor: 'linear-gradient(135deg, #f472b6 0%, #be185d 100%)',
    iconBg: '#ec4899',
    icon: 'image',
    route: '/slides/image-generator',
    section: 'image-generator',
  },
  {
    id: 'ai-poster-gen',
    title: 'AI Poster Generation',
    description: 'Design instant posters & social ads',
    category: 'Slides',
    image: aiPosterGenImg,
    gradient: ['#0d9488', '#0f766e'], // Canva teal style
    bgColor: 'linear-gradient(135deg, #2dd4bf 0%, #0f766e 100%)',
    iconBg: '#0d9488',
    icon: 'poster',
    route: '/slides/home',
    section: 'home',
  },
  {
    id: 'canvas-studio',
    title: 'Canvas Creator & Editor',
    description: 'Canvas for poster, banner & ad campaigns',
    category: 'Slides',
    image: canvasStudioImg,
    gradient: ['#2563eb', '#1d4ed8'], // Canva indigo style
    bgColor: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)',
    iconBg: '#2563eb',
    icon: 'canvas',
    route: '/slides/home',
    section: 'home',
  },
];

/* ── Workspace quick-switch cards (shown above features) ─────────────────── */

export const PRODUCT_OPTIONS = [
  {
    id: 'studio',
    title: 'Virtual Studio Workspace',
    description: 'AI video, avatars, voices, and full creator video studio suite',
    badge: 'Video & Avatars',
    image: studioImage,
    view: 'dashboard',
    path: '/dashboard',
  },
  {
    id: 'slides',
    title: 'Slides & Design Workspace',
    description: 'Build presentation decks, AI images, posters & marketing banners',
    badge: 'Presentations & Design',
    image: slidesImage,
    view: 'slides',
    path: '/slides',
  },
];

export function getProductOption(id) {
  return PRODUCT_OPTIONS.find((option) => option.id === id) || null;
}
