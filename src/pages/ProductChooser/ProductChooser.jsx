import { PRODUCT_OPTIONS } from './productOptions';
import '../Avatars/Avatars.css';
import '../Videos/Videos.css';
import './ProductChooser.css';

function ProductChooser({ onSelect }) {
  return (
    <div className="product-chooser-page videos-page create-avatar-page">
      <div className="videos-shell product-chooser-shell">
        <header className="videos-page-header create-avatar-page-header product-chooser-header">
          <div className="videos-title-section create-avatar-title-section">
            <div className="create-avatar-title-row">
              <div>
                <p className="product-chooser-eyebrow">Welcome back</p>
                <h1 className="videos-page-title">Choose your workspace</h1>
                <p className="videos-page-subtitle">
                  Pick where you want to create — switch anytime from the sidebar.
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="videos-main create-avatar-main product-chooser-main">
          <div className="type-selector-cards product-chooser-cards">
            {PRODUCT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className="type-card type-card--image"
                onClick={() => onSelect?.(option)}
                aria-label={`Open ${option.title}`}
              >
                <img src={option.image} alt="" className="type-card__bg" loading="lazy" />
                <div className="type-card__scrim" aria-hidden />
                <div className="type-card__content">
                  <strong>{option.title}</strong>
                  <p>{option.description}</p>
                  <span className="type-badge">{option.badge}</span>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProductChooser;
