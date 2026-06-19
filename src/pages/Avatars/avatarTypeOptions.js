import digitalTwinImage from '../../assets/avatar/Digital_Twin.png';
import photoAvatarImage from '../../assets/avatar/Photo_Avatar.png';
import promptBasedImage from '../../assets/avatar/Prompt_Based_Avatar.png';

export const AVATAR_TYPE_OPTIONS = [
  {
    id: 'digital_twin',
    title: 'Digital Twin',
    description: 'Clones your real appearance from video',
    badge: 'From Video',
    image: digitalTwinImage,
  },
  {
    id: 'photo',
    title: 'Photo Avatar',
    description: 'Animates a still image into a persona',
    badge: 'From Image',
    image: photoAvatarImage,
  },
  {
    id: 'prompt',
    title: 'Prompt Based',
    description: 'Generate a face entirely from text',
    badge: 'AI Generated',
    image: promptBasedImage,
  },
];

export function getAvatarTypeOption(id) {
  return AVATAR_TYPE_OPTIONS.find((option) => option.id === id) || null;
}
