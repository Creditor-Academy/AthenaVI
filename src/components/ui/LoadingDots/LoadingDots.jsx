import './LoadingDots.css';

function LoadingDots({ size = 'md', variant = 'default', className = '' }) {
  const classes = [
    'loading-dots',
    `loading-dots--${size}`,
    variant === 'onPrimary' ? 'loading-dots--on-primary' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} role="status" aria-label="Loading">
      <span className="loading-dots__dot" aria-hidden>
        .
      </span>
      <span className="loading-dots__dot" aria-hidden>
        .
      </span>
      <span className="loading-dots__dot" aria-hidden>
        .
      </span>
    </span>
  );
}

export default LoadingDots;
