import {
  MdCenterFocusStrong,
  MdFitScreen,
  MdOpenInFull,
  MdFlip,
  MdPerson,
  MdPhotoSizeSelectActual,
} from 'react-icons/md';
import { buildCssFilterString } from '../../../../utils/cssFilterUtils';
import { formatLayerBorderCss } from '../../../../utils/layerBorderUtils';
import { useComputedEntranceState } from '../../../../hooks/useComputedEntranceState';
import LayerAdjustmentsCompact from './LayerAdjustmentsCompact';
import './LayerFitFlipAdjustments.css';

const FIT_OPTIONS = [
  { val: 'cover', icon: MdCenterFocusStrong, label: 'Cover' },
  { val: 'contain', icon: MdFitScreen, label: 'Contain' },
  { val: 'fill', icon: MdOpenInFull, label: 'Fill' },
];

const LayerMediaPreview = ({
  src,
  isVideo,
  objectFit,
  scaleX,
  scaleY,
  borderRadius,
  borderCss = 'none',
  boxShadow,
  cssFilters,
  opacity,
  variant = 'rect',
  caption,
  animState = null,
}) => {
  const filter = buildCssFilterString(cssFilters);
  const animParts = animState?.visible
    ? [
        `translate(${animState.translateX ?? 0}px, ${animState.translateY ?? 0}px)`,
        animState.rotation ? `rotate(${animState.rotation}deg)` : '',
        animState.scale != null && animState.scale !== 1 ? `scale(${animState.scale})` : '',
      ].filter(Boolean)
    : [];
  const flipParts = [
    scaleX === -1 ? 'scale(-1, 1)' : '',
    scaleY === -1 ? 'scale(1, -1)' : '',
  ].filter(Boolean);
  const transform = [...animParts, ...flipParts].filter(Boolean).join(' ') || undefined;
  const previewOpacity = animState
    ? (animState.visible ? (animState.opacity ?? opacity ?? 1) : 0)
    : (opacity ?? 1);
  const previewBlur =
    animState?.blur && filter
      ? `${filter} blur(${animState.blur}px)`
      : animState?.blur
        ? `blur(${animState.blur}px)`
        : filter;

  const frameClass =
    variant === 'circle' ? 'lm-preview__frame lm-preview__frame--circle' : 'lm-preview__frame';

  return (
    <div className="lm-preview">
      <div
        className={frameClass}
        style={{
          borderRadius: variant === 'circle' ? '50%' : borderRadius || '12px',
          border: borderCss,
          boxShadow: boxShadow && boxShadow !== 'none' ? boxShadow : undefined,
          filter: previewBlur,
          opacity: previewOpacity,
          transform,
          transformOrigin: 'center center',
        }}
      >
        {src ? (
          isVideo ? (
            <video
              src={src}
              className="lm-preview__media"
              style={{ objectFit: objectFit || 'cover' }}
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={src}
              alt=""
              className="lm-preview__media"
              style={{ objectFit: objectFit || 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )
        ) : (
          <div className="lm-preview__placeholder">
            {variant === 'circle' ? (
              <MdPerson size={36} />
            ) : (
              <MdPhotoSizeSelectActual size={36} />
            )}
          </div>
        )}
      </div>
      {caption ? <span className="lm-preview__caption">{caption}</span> : null}
    </div>
  );
};

/**
 * Fit, flip, and adjustments with a shared live preview (image + avatar layers).
 */
const LayerFitFlipAdjustments = ({
  src,
  isVideo = false,
  style = {},
  cssFilters = {},
  opacity = 1,
  variant = 'rect',
  caption,
  clip = null,
  onUpdateStyle,
  onUpdateFilter,
  onOpacityChange,
  extraEffects,
  hideOpacity = false,
}) => {
  const { animState } = useComputedEntranceState(clip);
  const objectFit = style.objectFit || (variant === 'circle' ? 'contain' : 'cover');
  const scaleX = style.scaleX;
  const scaleY = style.scaleY;
  const borderCss = formatLayerBorderCss(style);

  return (
    <div className="lm-fit-adj">
      <LayerMediaPreview
        src={src}
        isVideo={isVideo}
        objectFit={objectFit}
        scaleX={scaleX}
        scaleY={scaleY}
        borderRadius={style.borderRadius}
        borderCss={borderCss}
        boxShadow={style.boxShadow}
        cssFilters={cssFilters}
        opacity={opacity}
        variant={variant}
        caption={caption}
        animState={clip ? animState : null}
      />

      <div className="lm-fit-adj__section">
        <span className="lm-fit-adj__label">Object fit</span>
        <div className="lm-fit-adj__fit-row">
          {FIT_OPTIONS.map(({ val, icon: Icon, label }) => (
            <button
              key={val}
              type="button"
              className={`lm-fit-adj__fit-btn ${objectFit === val ? 'lm-fit-adj__fit-btn--active' : ''}`}
              onClick={() => onUpdateStyle({ objectFit: val })}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="lm-fit-adj__section">
        <span className="lm-fit-adj__label">Flip</span>
        <div className="lm-fit-adj__flip-row">
          <button
            type="button"
            className={`lm-fit-adj__flip-btn ${scaleX === -1 ? 'lm-fit-adj__flip-btn--active' : ''}`}
            onClick={() => onUpdateStyle({ scaleX: scaleX === -1 ? 1 : -1 })}
          >
            <MdFlip size={15} />
            <span>Horizontal</span>
          </button>
          <button
            type="button"
            className={`lm-fit-adj__flip-btn ${scaleY === -1 ? 'lm-fit-adj__flip-btn--active' : ''}`}
            onClick={() => onUpdateStyle({ scaleY: scaleY === -1 ? 1 : -1 })}
          >
            <span className="lm-fit-adj__flip-icon-v" aria-hidden>
              <MdFlip size={15} />
            </span>
            <span>Vertical</span>
          </button>
        </div>
      </div>

      <div className="lm-fit-adj__divider" />

      <LayerAdjustmentsCompact
        opacity={opacity}
        cssFilters={cssFilters}
        onOpacityChange={onOpacityChange}
        onFilterChange={onUpdateFilter}
        showInlinePreview={false}
        previewSrc={src}
        previewObjectFit={objectFit}
        hideOpacity={hideOpacity}
      />

      {extraEffects ? <div className="lm-fit-adj__extras">{extraEffects}</div> : null}
    </div>
  );
};

export default LayerFitFlipAdjustments;
export { LayerMediaPreview };
