import { normalizeVoiceGender } from '../../../utils/voiceGender';
import FemaleIcon from './FemaleIcon';
import MaleIcon from './MaleIcon';
import VoiceNeutralIcon from './VoiceNeutralIcon';

function VoiceGenderIcon({ gender, size = 24, className, title }) {
  const normalized = normalizeVoiceGender(gender);

  if (normalized === 'male') {
    return <MaleIcon size={size} className={className} title={title} />;
  }
  if (normalized === 'female') {
    return <FemaleIcon size={size} className={className} title={title} />;
  }
  return <VoiceNeutralIcon size={size} className={className} title={title} />;
}

export default VoiceGenderIcon;
