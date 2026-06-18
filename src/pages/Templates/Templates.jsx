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
  'Pitch': BusinessImg,
  'Product Launch': MarketingImg,
  'Course Module': EducationImg,
  'Course Explanation': EducationImg,
  'Sales Demo': BusinessImg,
  'Social Short': MarketingImg,
  'Podcast': MarketingImg,
}

const CATEGORY_FILTERS = ['All Templates', 'Pitch', 'Product Launch', 'Course Module', 'Course Explanation', 'Sales Demo', 'Social Short', 'Podcast']

const CATEGORY_MAPPING = {
  'All Templates': null,
  'Pitch': 'Pitch',
  'Product Launch': 'Product Launch',
  'Course Module': 'Course Module',
  'Course Explanation': 'Course Explanation',
  'Sales Demo': 'Sales Demo',
  'Social Short': 'Social Short',
  'Podcast': 'Podcast',
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

          {loading ? (
            <TemplatesSkeleton />
          ) : activeBundle ? (
            <div className="template-bundle-detail-page">
              <div className="template-bundle-detail-page__toolbar">
                <button type="button" className="btn-reset-filters" onClick={() => setActiveBundle(null)}>
                  <MdArrowBack size={16} /> Back to groups
                </button>
                <button type="button" className="btn-use-template" onClick={() => handleUseBundle(activeBundle)}>
                  <MdPlayCircleOutline size={16} /> Use all {activeBundle.scenes?.length || 0} scenes
                </button>
              </div>

              <div className="template-bundle-detail-page__head">
                <div>
                  <span className="card-tag">{activeBundle.category}</span>
                  <h2>{activeBundle.name}</h2>
                  <p>{activeBundle.description}</p>
                </div>
              </div>

              <div className="template-grid-main">
                {(activeBundle.scenes || []).map((scene) => (
                  <div
                    key={scene.id}
                    className="template-card-premium"
                    onClick={() => handleUseScene(scene, activeBundle)}
                  >
                    <div className="card-thumb-container">
                      <div className="high-fidelity-preview">
                        <TemplateScenePreview template={scene} compact={true} />
                      </div>
                      <div className="card-tag">{scene.layoutType}</div>
                      <div className="duration-badge">{scene.duration || 8}s</div>
                      <div className="card-overlay-premium">
                        <button className="btn-preview">Use Scene</button>
                      </div>
                    </div>
                    <div className="card-info-premium">
                      <div className="card-info-top">
                        <h3>{scene.title}</h3>
                      </div>
                      <div className="card-meta-details">
                        <span className="meta-item">
                          <MdLayers size={14} />
                          Slide {scene.slideIndex || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
        <div className="footer-copy">© 2026 Virtual Instructor. All rights reserved.</div>
      </footer>
    </div>
  )
}

export default Templates
