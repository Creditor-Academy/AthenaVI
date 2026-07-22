import studioImage from '../../assets/digitaltwin01.png';
import slidesImage from '../../assets/Template Image/temp1.png';

export const PRODUCT_OPTIONS = [
  {
    id: 'studio',
    title: 'Virtual Studio',
    description: 'AI video, avatars, voices, and the full creator toolkit',
    badge: 'Video & Avatars',
    image: studioImage,
    view: 'dashboard',
    path: '/dashboard',
  },
  {
    id: 'slides',
    title: 'Slides',
    description: 'Build decks with PPT Generator and Image Generator',
    badge: 'Presentations',
    image: slidesImage,
    view: 'slides',
    path: '/slides',
  },
];

export function getProductOption(id) {
  return PRODUCT_OPTIONS.find((option) => option.id === id) || null;
}
