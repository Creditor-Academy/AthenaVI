/**
 * Native audio controls with immediate duration when a local preview blob is available.
 * Uses previewSrc (blob URL from the uploaded file) until remote metadata would load.
 */
function AudioPreviewPlayer({ src, previewSrc, className, onClick, controlsList }) {
  const playbackSrc = previewSrc || src;
  if (!playbackSrc) return null;

  return (
    <audio
      src={playbackSrc}
      controls
      controlsList={controlsList}
      preload="metadata"
      className={className}
      onClick={onClick}
    />
  );
}

export default AudioPreviewPlayer;
