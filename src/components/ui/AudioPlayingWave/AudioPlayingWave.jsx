import './AudioPlayingWave.css';

function AudioPlayingWave({ className = '', size = 'sm', barCount = 5 }) {
  return (
    <span
      className={`audio-playing-wave audio-playing-wave--${size} ${className}`.trim()}
      aria-hidden
    >
      {Array.from({ length: barCount }, (_, i) => (
        <span key={i} className="audio-playing-wave__bar" />
      ))}
    </span>
  );
}

export default AudioPlayingWave;
