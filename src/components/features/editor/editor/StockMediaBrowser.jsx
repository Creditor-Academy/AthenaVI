import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import stockService from '../../../../services/stockService';
import assetService from '../../../../services/assetService';

const FORMAT_FILTERS = [
  { id: 'all', label: 'All', hint: 'Any ratio' },
  { id: 'landscape', label: 'Wide', hint: '16:9+' },
  { id: 'portrait', label: 'Tall', hint: '9:16' },
  { id: 'square', label: 'Square', hint: '1:1' },
];

const PROVIDER_LABELS = {
  all: 'All sources',
  pexels: 'Pexels',
  unsplash: 'Unsplash',
  pixabay: 'Pixabay',
};

const PROVIDER_INITIALS = {
  pexels: 'Pe',
  unsplash: 'Un',
  pixabay: 'Pi',
};

const PHOTO_PROVIDER_FILTERS = [
  { id: 'all', label: 'All', hint: 'Pexels · Unsplash · Pixabay' },
  { id: 'pexels', label: 'Pexels', hint: 'Pexels photos' },
  { id: 'unsplash', label: 'Unsplash', hint: 'Unsplash photos' },
  { id: 'pixabay', label: 'Pixabay', hint: 'Pixabay photos' },
];

const VIDEO_PROVIDER_FILTERS = [
  { id: 'all', label: 'All', hint: 'Pexels · Pixabay' },
  { id: 'pexels', label: 'Pexels', hint: 'Pexels videos' },
  { id: 'pixabay', label: 'Pixabay', hint: 'Pixabay videos' },
];

const STOCK_CONFIG = {
  photo: {
    stockType: 'photo',
    layerType: 'image',
    defaultQuery: 'business',
    browseTitle: 'Browse photos',
    libraryTitle: 'Stock Photos',
    searchPlaceholder: 'Search photos…',
    emptyTitle: 'No photos match this search.',
    loadMoreLabel: 'Load more photos',
    workspaceNotice: 'Save to a workspace to import photos into your asset library.',
    footerLabel: 'Pexels · Unsplash · Pixabay',
    topics: [
      { id: 'business', label: 'Business', query: 'business professional' },
      { id: 'nature', label: 'Nature', query: 'nature landscape' },
      { id: 'technology', label: 'Technology', query: 'technology digital' },
      { id: 'people', label: 'People', query: 'people portrait' },
      { id: 'office', label: 'Office', query: 'modern office workspace' },
      { id: 'abstract', label: 'Abstract', query: 'abstract background' },
    ],
  },
  video: {
    stockType: 'video',
    layerType: 'video',
    defaultQuery: 'business',
    browseTitle: 'Browse videos',
    libraryTitle: 'Stock Videos',
    searchPlaceholder: 'Search videos…',
    emptyTitle: 'No videos match this search.',
    loadMoreLabel: 'Load more videos',
    workspaceNotice: 'Save to a workspace to import videos into your asset library.',
    footerLabel: 'Pexels · Pixabay',
    topics: [
      { id: 'business', label: 'Business', query: 'business corporate' },
      { id: 'nature', label: 'Nature', query: 'nature landscape' },
      { id: 'technology', label: 'Technology', query: 'technology office' },
      { id: 'people', label: 'People', query: 'people lifestyle' },
      { id: 'city', label: 'City', query: 'city urban' },
      { id: 'abstract', label: 'Abstract', query: 'abstract motion' },
    ],
  },
};

const SKELETON_COUNT = 8;

const SKELETON_RATIOS = [
  [4, 3],
  [3, 4],
  [16, 9],
  [9, 16],
  [1, 1],
  [5, 4],
  [4, 5],
  [3, 2],
];

function stockItemKey(item) {
  return `${item.provider || 'pexels'}:${item.externalId}`;
}

function getItemAspectRatio(item) {
  const width = Number(item.width);
  const height = Number(item.height);
  if (width > 0 && height > 0) return { width, height };
  return { width: 4, height: 3 };
}

function matchesOrientation(item, orientation) {
  if (!orientation || orientation === 'all') return true;
  const width = Number(item.width);
  const height = Number(item.height);
  if (!width || !height) return true;
  const ratio = width / height;
  if (orientation === 'landscape') return ratio > 1.15;
  if (orientation === 'portrait') return ratio < 0.87;
  if (orientation === 'square') return ratio >= 0.87 && ratio <= 1.15;
  return true;
}

function resolveStockVideoPreview(item) {
  const meta = item.stockMetadata || item.metadata || {};
  const candidates = [
    item.previewVideoUrl,
    item.videoPreviewUrl,
    item.previewVideo,
    item.videoUrl,
    meta.previewVideoUrl,
    meta.videoPreviewUrl,
    meta.previewVideo,
    meta.videoUrl,
    item.previewUrl,
  ];

  for (const url of candidates) {
    if (!url || typeof url !== 'string') continue;
    if (/\.(mp4|webm|mov)(\?|$)/i.test(url)
      || url.includes('videos.pexels.com')
      || url.includes('pixabay.com')
      || url.includes('cdn.pixabay.com')) {
      return url;
    }
  }

  return null;
}

function StockMediaCard({
  item,
  isVideo,
  isSelected,
  isImporting,
  disabled,
  showProviderBadge,
  onSelect,
  onImport,
}) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef(null);
  const previewVideoUrl = useMemo(
    () => (isVideo ? resolveStockVideoPreview(item) : null),
    [isVideo, item]
  );
  const canPreviewVideo = Boolean(isVideo && previewVideoUrl);
  const { width: aspectW, height: aspectH } = getItemAspectRatio(item);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !canPreviewVideo) return undefined;

    if (hovered) {
      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }

    return undefined;
  }, [hovered, canPreviewVideo]);

  const handleUseInCanvas = (e) => {
    e.stopPropagation();
    onImport(item);
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={[
        'stock-browser__card',
        isSelected ? 'is-selected' : '',
        isImporting ? 'is-importing' : '',
        hovered && canPreviewVideo ? 'is-previewing' : '',
      ].filter(Boolean).join(' ')}
      onClick={() => !disabled && onSelect(item)}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-pressed={isSelected}
      aria-disabled={disabled}
      title={item.attribution || (item.photographer ? `By ${item.photographer}` : 'Select media')}
    >
      {showProviderBadge && item.provider ? (
        <span
          className={`stock-browser__card-source stock-browser__card-source--${item.provider}`}
          title={PROVIDER_LABELS[item.provider] || item.provider}
        >
          {PROVIDER_INITIALS[item.provider] || item.provider.slice(0, 2)}.
        </span>
      ) : null}
      <span className="stock-browser__card-media">
        {canPreviewVideo ? (
          <>
            <img
              src={item.previewUrl}
              alt=""
              width={aspectW}
              height={aspectH}
              loading="lazy"
              draggable={false}
              className="stock-browser__card-poster"
            />
            <video
              ref={videoRef}
              src={previewVideoUrl}
              className="stock-browser__card-video"
              muted
              loop
              playsInline
              preload="metadata"
              draggable={false}
            />
          </>
        ) : (
          <img
            src={item.previewUrl}
            alt=""
            width={aspectW}
            height={aspectH}
            loading="lazy"
            draggable={false}
          />
        )}
      </span>
      {isSelected ? (
        <span className="stock-browser__card-use">
          <button
            type="button"
            className="stock-browser__card-use-btn"
            onClick={handleUseInCanvas}
            disabled={disabled}
          >
            {isImporting ? 'Adding…' : 'Use in canvas'}
          </button>
        </span>
      ) : null}
    </div>
  );
}

const StockMediaBrowser = ({ variant = 'photo', addLayer, workspaceId, onUploadError, onComplete }) => {
  const config = STOCK_CONFIG[variant] || STOCK_CONFIG.photo;

  const [searchInput, setSearchInput] = useState('');
  const [activeTopic, setActiveTopic] = useState(config.topics[0]?.id || 'business');
  const [orientation, setOrientation] = useState('all');
  const [provider, setProvider] = useState('all');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [importingId, setImportingId] = useState(null);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);
  const requestRef = useRef(0);

  const effectiveQuery = useMemo(() => {
    const trimmed = searchInput.trim();
    if (trimmed) return trimmed;
    const topic = config.topics.find((item) => item.id === activeTopic);
    return topic?.query || config.defaultQuery;
  }, [searchInput, activeTopic, config]);

  const visibleItems = useMemo(
    () => items.filter((item) => matchesOrientation(item, orientation)),
    [items, orientation]
  );

  const hasMore = items.length < totalResults;
  const isVideo = config.stockType === 'video';
  const providerFilters = isVideo ? VIDEO_PROVIDER_FILTERS : PHOTO_PROVIDER_FILTERS;
  const showProviderBadge = provider === 'all';
  const activeProviderLabel = PROVIDER_LABELS[provider] || config.footerLabel;

  const runSearch = useCallback(
    async ({ nextPage = 1, append = false } = {}) => {
      const requestId = ++requestRef.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');

      try {
        const result = await stockService.search({
          q: effectiveQuery,
          type: config.stockType,
          provider,
          page: nextPage,
          perPage: 24,
        });

        if (requestId !== requestRef.current) return;

        const nextItems = result.items || [];
        setItems((prev) => (append ? [...prev, ...nextItems] : nextItems));
        setPage(result.page || nextPage);
        setTotalResults(result.totalResults ?? nextItems.length);
      } catch (err) {
        if (requestId !== requestRef.current) return;
        setError(err?.message || `Failed to load stock ${config.stockType}s`);
        if (!append) {
          setItems([]);
          setTotalResults(0);
        }
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [effectiveQuery, config.stockType, provider]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch({ nextPage: 1, append: false });
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [effectiveQuery, runSearch]);

  useEffect(() => {
    setSelectedId(null);
  }, [effectiveQuery, orientation, provider]);

  const handleTopicSelect = (topicId) => {
    setActiveTopic(topicId);
    setSearchInput('');
  };

  const handleSelect = (item) => {
    const key = stockItemKey(item);
    setSelectedId((prev) => (prev === key ? null : key));
  };

  const handleImport = async (item) => {
    if (!workspaceId) {
      onUploadError?.(config.workspaceNotice);
      return;
    }

    const itemKey = stockItemKey(item);
    setImportingId(itemKey);
    setError('');
    try {
      const asset = await stockService.importStock(workspaceId, {
        provider: item.provider || 'pexels',
        externalId: item.externalId,
        mediaType: item.mediaType || config.stockType,
        name: item.photographer
          ? `${isVideo ? 'Video' : 'Photo'} by ${item.photographer}`
          : undefined,
      });
      const normalized = assetService.normalizeAsset(asset);
      if (!normalized?.url) {
        throw new Error('Imported asset is missing a URL');
      }
      addLayer(config.layerType, {
        url: normalized.url,
        assetId: normalized.id,
      });
      onComplete?.();
    } catch (err) {
      onUploadError?.(err?.message || `Failed to import stock ${config.stockType}`);
    } finally {
      setImportingId(null);
    }
  };

  const searchInputId = `stock-browser-search-${variant}`;

  return (
    <section
      className={`stock-browser stock-browser--split stock-browser--${variant}`}
      aria-label={config.libraryTitle}
    >
      <div className="stock-browser__layout">
        <div className="stock-browser__gallery">
          <div className="stock-browser__gallery-bar">
            <div>
              <h4 className="stock-browser__title">{config.browseTitle}</h4>
              <p className="stock-browser__gallery-sub">
                {loading && items.length === 0
                  ? 'Searching stock libraries…'
                  : `${visibleItems.length} shown${totalResults > 0 ? ` · ${totalResults.toLocaleString()} total` : ''}`}
              </p>
            </div>
          </div>

          <div className="stock-browser__gallery-scroll premium-scrollbar">
            <div className="stock-browser__grid">
              {loading && items.length === 0
                ? Array.from({ length: SKELETON_COUNT }).map((_, index) => {
                    const [w, h] = SKELETON_RATIOS[index % SKELETON_RATIOS.length];
                    return (
                      <div
                        key={`skel-${index}`}
                        className="stock-browser__card stock-browser__card--skeleton"
                        style={{ aspectRatio: `${w} / ${h}` }}
                        aria-hidden
                      />
                    );
                  })
                : null}

              {!loading && visibleItems.length === 0 && !error ? (
                <div className="stock-browser__empty">
                  <p>{config.emptyTitle}</p>
                  <span>Try another category or search term.</span>
                </div>
              ) : null}

              {visibleItems.map((item) => {
                const itemKey = stockItemKey(item);
                return (
                  <StockMediaCard
                    key={itemKey}
                    item={item}
                    isVideo={isVideo}
                    isSelected={selectedId === itemKey}
                    isImporting={importingId === itemKey}
                    disabled={Boolean(importingId)}
                    showProviderBadge={showProviderBadge}
                    onSelect={handleSelect}
                    onImport={handleImport}
                  />
                );
              })}
            </div>

            {hasMore && !loading ? (
              <button
                type="button"
                className="stock-browser__load-more"
                onClick={() => runSearch({ nextPage: page + 1, append: true })}
                disabled={loadingMore || Boolean(importingId)}
              >
                {loadingMore ? 'Loading more…' : config.loadMoreLabel}
              </button>
            ) : null}
          </div>
        </div>

        <aside className="stock-browser__sidebar" aria-label="Stock filters">
          <div className="stock-browser__sidebar-head">
            <h4 className="stock-browser__sidebar-title">{config.libraryTitle}</h4>
            <p className="stock-browser__sidebar-meta">
              {provider === 'all'
                ? config.footerLabel
                : `${isVideo ? 'Videos' : 'Photos'} · ${activeProviderLabel}`}
            </p>
          </div>

          <label className="stock-browser__search" htmlFor={searchInputId}>
            <MdSearch size={17} aria-hidden />
            <input
              id={searchInputId}
              type="search"
              placeholder={config.searchPlaceholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              autoComplete="off"
            />
          </label>

          <div className="stock-browser__sidebar-panel">
            <section className="stock-browser__filter-section">
              <h5 className="stock-browser__section-title">Source</h5>
              <div
                className={`stock-browser__chip-grid${
                  providerFilters.length === 3 ? ' stock-browser__chip-grid--3' : ''
                }`}
                role="tablist"
                aria-label="Stock provider"
              >
                {providerFilters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={provider === item.id}
                    className={`stock-browser__chip stock-browser__chip--provider${
                      provider === item.id ? ' is-active' : ''
                    }`}
                    onClick={() => setProvider(item.id)}
                    title={item.hint}
                  >
                    <span
                      className={`stock-browser__provider-dot stock-browser__provider-dot--${item.id}`}
                      aria-hidden
                    />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="stock-browser__filter-section">
              <h5 className="stock-browser__section-title">Category</h5>
              <div className="stock-browser__chip-grid stock-browser__chip-grid--3" role="tablist" aria-label="Stock categories">
                {config.topics.map((topic) => {
                  const isActive = activeTopic === topic.id && !searchInput.trim();
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`stock-browser__chip${isActive ? ' is-active' : ''}`}
                      onClick={() => handleTopicSelect(topic.id)}
                    >
                      {topic.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="stock-browser__filter-section stock-browser__filter-section--last">
              <h5 className="stock-browser__section-title">Orientation</h5>
              <div className="stock-browser__chip-grid" role="tablist" aria-label="Media format">
                {FORMAT_FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={orientation === item.id}
                    className={`stock-browser__chip stock-browser__chip--format${
                      orientation === item.id ? ' is-active' : ''
                    }`}
                    onClick={() => setOrientation(item.id)}
                    title={item.hint}
                  >
                    <span className={`stock-browser__format-icon stock-browser__format-icon--${item.id}`} aria-hidden />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {!workspaceId ? (
            <p className="stock-browser__notice">{config.workspaceNotice}</p>
          ) : null}

          {error ? <p className="stock-browser__error">{error}</p> : null}
        </aside>
      </div>
    </section>
  );
};

export default StockMediaBrowser;
