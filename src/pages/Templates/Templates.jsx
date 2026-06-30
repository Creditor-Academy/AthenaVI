import { useState, useEffect } from 'react'
import {
  MdSearch,
  MdBookmarkBorder,
  MdBookmark,
  MdMonitor,
  MdPhoneIphone,
  MdLayers,
  MdArrowBack,
  MdPlayCircleOutline,
  MdAccessTime,
} from 'react-icons/md'

import AllTemplateImg from '../../assets/Template Image/AllTemplate.png'
import MarketingImg from '../../assets/Template Image/Marketing.png'
import EducationImg from '../../assets/Template Image/Educational.png'
import BusinessImg from '../../assets/Template Image/Coporate.png'
import TemplateScenePreview from '../../components/features/editor/editor/TemplateScenePreview'
import { fetchTemplateBundles, bundleToDetailsTemplate } from '../../utils/fetchTemplateBundles'
import TemplatesSkeleton from '../page-skeleton/TemplatesSkeleton'
import './Templates.css'

const CATEGORY_ICONS = {
  'All Templates': AllTemplateImg,
  'Company': BusinessImg,
  'Courses': EducationImg,
  'Social Short': MarketingImg,
  'Podcast': MarketingImg,
}

const CATEGORY_FILTERS = ['All Templates', 'Company', 'Courses', 'Social Short', 'Podcast']

const CATEGORY_MAPPING = {
  'All Templates': null,
  'Company': 'Company',
  'Courses': 'Courses',
  'Social Short': 'Social Short',
  'Podcast': 'Podcast',
}

const formatDuration = (totalSeconds) => {
  const sec = Math.max(0, totalSeconds)
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m === 0) return `${s}s`
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

const getBundleStats = (bundle) => {
  const scenes = bundle?.scenes || []
  const sceneCount = scenes.length
  const totalSeconds = scenes.reduce((sum, scene) => sum + (scene.duration || 8), 0)
  const aspectRatio = bundle?.aspectRatio || '16:9'
  const layoutTypes = [...new Set(scenes.map((s) => s.layoutType).filter(Boolean))]
  return { sceneCount, totalSeconds, aspectRatio, layoutTypes }
}

function Templates({ onSelect }) {
  const [activeCategory, setActiveCategory] = useState('All Templates')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarked, setBookmarked] = useState([])
  const [allBundles, setAllBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeBundle, setActiveBundle] = useState(null)

  useEffect(() => {
    fetchTemplateBundles().then((data) => {
      setAllBundles(data)
      setLoading(false)
    })
  }, [])

  const toggleBookmark = (id, e) => {
    e.stopPropagation()
    setBookmarked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const filteredBundles = allBundles.filter((bundle) => {
    const categoryFilter = CATEGORY_MAPPING[activeCategory]
    const matchesCategory = !categoryFilter || bundle.category === categoryFilter
    const matchesSearch =
      (bundle.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bundle.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bundle.scenes || []).some((scene) =>
        (scene.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesCategory && matchesSearch
  })

  const openBundle = (bundle) => {
    setActiveBundle(bundle)
  }

  const handleUseBundle = (bundle) => {
    onSelect?.(bundleToDetailsTemplate(bundle))
  }

  const handleUseScene = (scene, bundle) => {
    onSelect?.({
      ...bundleToDetailsTemplate(bundle),
      selectedScene: scene,
      name: scene.title || bundle.name,
    })
  }

  return (
    <div className="templates-page">
      <div className="templates-layout">
        <aside className="templates-sidebar">
          <div className="sidebar-header">
            <h2>Categories</h2>
            <p>Select a template group</p>
          </div>
          <nav className="category-nav">
            {CATEGORY_FILTERS.map(cat => {
              const imageSrc = CATEGORY_ICONS[cat]
              return (
                <button
                  key={cat}
                  className={`category-item ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat)
                    setActiveBundle(null)
                  }}
                >
                  <img src={imageSrc} alt={`${cat} Icon`} className="category-icon" />
                  <span className="category-label">{cat}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="templates-main">
          {!activeBundle && (
            <header className="templates-header">
              <div className="header-text">
                <h1>Template Library</h1>
                <p>Browse template groups, preview all scenes, and start with one layout or the full bundle.</p>
              </div>
              <div className="search-bar-premium">
                <MdSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search template groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </header>
          )}

          {loading ? (
            <TemplatesSkeleton />
          ) : activeBundle ? (
            <div className="template-bundle-detail-page">
              {(() => {
                const { sceneCount, totalSeconds, aspectRatio, layoutTypes } = getBundleStats(activeBundle)
                const isPortrait = aspectRatio === '9:16'

                return (
                  <>
                    <nav className="template-overview__nav">
                      <button type="button" className="btn-back-overview" onClick={() => setActiveBundle(null)}>
                        <MdArrowBack size={18} />
                        Back to library
                      </button>
                      <div className="template-overview__nav-actions">
                        <button
                          type="button"
                          className={`bookmark-btn overview-bookmark ${bookmarked.includes(activeBundle.id) ? 'active' : ''}`}
                          onClick={(e) => toggleBookmark(activeBundle.id, e)}
                          title={bookmarked.includes(activeBundle.id) ? 'Remove bookmark' : 'Save template'}
                        >
                          {bookmarked.includes(activeBundle.id) ? <MdBookmark /> : <MdBookmarkBorder />}
                        </button>
                        <button type="button" className="btn-use-primary" onClick={() => handleUseBundle(activeBundle)}>
                          <MdPlayCircleOutline size={18} />
                          Use all {sceneCount} scenes
                        </button>
                      </div>
                    </nav>

                    <section className="template-overview__hero">
                      <div className="template-overview__preview">
                        {activeBundle.coverScene ? (
                          <div className="template-overview__preview-canvas">
                            <TemplateScenePreview template={activeBundle.coverScene} compact />
                          </div>
                        ) : (
                          <div className="template-overview__preview-canvas template-overview__preview-canvas--empty" />
                        )}
                      </div>

                      <div className="template-overview__info">
                        <span className="template-overview__category">{activeBundle.category}</span>
                        <h1 className="template-overview__title">{activeBundle.name}</h1>
                        {activeBundle.description ? (
                          <p className="template-overview__description">{activeBundle.description}</p>
                        ) : null}

                        <div className="template-overview__stats">
                          <div className="overview-stat">
                            <span className="overview-stat__label">Scenes</span>
                            <span className="overview-stat__value">
                              <MdLayers size={16} />
                              {sceneCount}
                            </span>
                          </div>
                          <div className="overview-stat">
                            <span className="overview-stat__label">Duration</span>
                            <span className="overview-stat__value">
                              <MdAccessTime size={16} />
                              ~{formatDuration(totalSeconds)}
                            </span>
                          </div>
                          <div className="overview-stat">
                            <span className="overview-stat__label">Format</span>
                            <span className="overview-stat__value">
                              {isPortrait ? <MdPhoneIphone size={16} /> : <MdMonitor size={16} />}
                              {aspectRatio}
                            </span>
                          </div>
                        </div>

                        {layoutTypes.length > 0 ? (
                          <div className="template-overview__layouts">
                            {layoutTypes.map((layout) => (
                              <span key={layout} className="overview-layout-chip">{layout}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </section>

                    <section className="template-overview__scenes">
                      <header className="template-overview__scenes-head">
                        <div>
                          <h2>Scene breakdown</h2>
                          <p>
                            {sceneCount} scene{sceneCount === 1 ? '' : 's'} in this bundle — pick one layout or use the full sequence.
                          </p>
                        </div>
                      </header>

                      <div className="template-overview__scene-grid">
                        {(activeBundle.scenes || []).map((scene, index) => (
                          <article
                            key={scene.id}
                            className="overview-scene-card"
                            onClick={() => handleUseScene(scene, activeBundle)}
                          >
                            <div className="overview-scene-card__thumb">
                              <div className="high-fidelity-preview">
                                <TemplateScenePreview template={scene} compact={true} />
                              </div>
                              <span className="overview-scene-card__index">
                                {String(scene.slideIndex ?? index + 1).padStart(2, '0')}
                              </span>
                              <span className="overview-scene-card__layout">{scene.layoutType}</span>
                              <span className="overview-scene-card__duration">{scene.duration || 8}s</span>
                              <div className="card-overlay-premium">
                                <button type="button" className="btn-preview">Use scene</button>
                              </div>
                            </div>
                            <div className="overview-scene-card__body">
                              <h3>{scene.title}</h3>
                              {scene.description ? (
                                <p className="overview-scene-card__desc">{scene.description}</p>
                              ) : null}
                              {scene.tags?.length > 0 ? (
                                <div className="overview-scene-card__tags">
                                  {scene.tags.slice(0, 3).map((tag) => (
                                    <span key={tag} className="overview-scene-tag">{tag}</span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  </>
                )
              })()}
            </div>
          ) : (
            <div className="template-grid-main">
              {filteredBundles.map(bundle => {
                const sceneCount = bundle.scenes?.length || 0
                const totalDuration = (bundle.scenes || []).reduce((sum, scene) => sum + (scene.duration || 8), 0)
                return (
                  <div
                    key={bundle.id}
                    className="template-card-premium"
                    onClick={() => openBundle(bundle)}
                  >
                    <div className="card-thumb-container">
                      <div className="high-fidelity-preview">
                        {bundle.coverScene ? (
                          <TemplateScenePreview template={bundle.coverScene} compact={true} />
                        ) : null}
                      </div>
                      <div className="card-tag">{bundle.category}</div>
                      <div className="duration-badge">{sceneCount} scenes</div>
                      <div className="card-overlay-premium">
                        <button className="btn-preview">View Scenes</button>
                      </div>
                    </div>
                    <div className="card-info-premium">
                      <div className="card-info-top">
                        <h3>{bundle.name}</h3>
                        <button
                          className={`bookmark-btn ${bookmarked.includes(bundle.id) ? 'active' : ''}`}
                          onClick={(e) => toggleBookmark(bundle.id, e)}
                        >
                          {bookmarked.includes(bundle.id) ? <MdBookmark /> : <MdBookmarkBorder />}
                        </button>
                      </div>
                      <p className="template-bundle-card__description">{bundle.description}</p>
                      <div className="card-meta-details">
                        <span className="meta-item">
                          <MdMonitor size={14} />
                          {bundle.aspectRatio || '16:9'}
                        </span>
                        <span className="meta-item">
                          <MdLayers size={14} />
                          {sceneCount} scenes
                        </span>
                        <span className="meta-item">
                          ~{totalDuration}s
                        </span>
                      </div>
                      <div className="card-actions-row">
                        <button
                          className="btn-use-template"
                          onClick={(e) => { e.stopPropagation(); handleUseBundle(bundle) }}
                        >
                          Use Full Template
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredBundles.length === 0 && (
                <div className="no-results-state">
                  <p>No template groups found for "{searchQuery || activeCategory}"</p>
                  <button className="btn-reset-filters" onClick={() => { setSearchQuery(''); setActiveCategory('All Templates') }}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <footer className="templates-footer">
        <div className="footer-links">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Support</a>
        </div>
        <div className="footer-copy">© 2026 Virtual Studio. All rights reserved.</div>
      </footer>
    </div>
  )
}

export default Templates
