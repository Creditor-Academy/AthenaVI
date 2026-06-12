import { useState, useEffect } from 'react'
import { 
  MdSearch, 
  MdBookmarkBorder, 
  MdBookmark,
  MdMonitor,
  MdPhoneIphone,
  MdLayers
} from 'react-icons/md'

import AllTemplateImg from '../../assets/Template Image/AllTemplate.png'
import MarketingImg from '../../assets/Template Image/Marketing.png'
import EducationImg from '../../assets/Template Image/Educational.png'
import BusinessImg from '../../assets/Template Image/Coporate.png'

const CATEGORY_ICONS = {
  'All Templates': AllTemplateImg,
  'Pitch': BusinessImg,
  'Product Launch': MarketingImg,
  'Course Module': EducationImg,
  'Sales Demo': BusinessImg,
  'Social Short': MarketingImg,
}
import TemplatePreview from '../../components/TemplatePreview.jsx'
import TemplatesSkeleton from '../page-skeleton/TemplatesSkeleton'
import './Templates.css'

const CATEGORY_FILTERS = ['All Templates', 'Pitch', 'Product Launch', 'Course Module', 'Sales Demo', 'Social Short']

const CATEGORY_MAPPING = {
  'All Templates': null,
  'Pitch': 'Pitch',
  'Product Launch': 'Product Launch',
  'Course Module': 'Course Module',
  'Sales Demo': 'Sales Demo',
  'Social Short': 'Social Short',
}

const fetchAllTemplates = async () => {
  const files = ['pitch_template', 'product_launch_template', 'course_module_template', 'sales_demo_template', 'social_short_template']
  const results = []
  for (const file of files) {
    try {
      const res = await fetch(`/templates/${file}.json`)
      const data = await res.json()
      if (data?.scenes) {
        const rawCategory = data.category || data.template?.category || ''
        const category = file === 'pitch_template'
          ? 'Pitch'
          : file === 'product_launch_template'
            ? 'Product Launch'
            : file === 'course_module_template'
              ? 'Course Module'
              : file === 'sales_demo_template'
                ? 'Sales Demo'
                : file === 'social_short_template'
                  ? 'Social Short'
                  : rawCategory
        const bundleMeta = data.template || {}
        const bundlePortrait = bundleMeta.aspectRatio === '9:16'
          || (bundleMeta.canvasSize?.height > bundleMeta.canvasSize?.width)
        data.scenes.forEach(scene => {
          const scenePortrait = scene.canvasSize?.height > scene.canvasSize?.width
          results.push({
            ...scene,
            name: scene.title || scene.id,
            category,
            tag: (category || '').toUpperCase(),
            thumb: scene.thumbnail || '',
            ratio: (bundlePortrait || scenePortrait) ? '9:16' : '16:9',
            duration: `${scene.duration || 8}s`,
          })
        })
      }
    } catch (e) {
      console.warn(`Failed to load ${file}.json`, e)
    }
  }
  return results
}

function Templates({ onSelect }) {
  const [activeCategory, setActiveCategory] = useState('All Templates')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarked, setBookmarked] = useState([])
  const [allTemplates, setAllTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllTemplates().then(data => {
      setAllTemplates(data)
      setLoading(false)
    })
  }, [])

  const toggleBookmark = (id, e) => {
    e.stopPropagation()
    setBookmarked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const filteredTemplates = allTemplates.filter(template => {
    const categoryFilter = CATEGORY_MAPPING[activeCategory]
    const matchesCategory = !categoryFilter || template.category === categoryFilter
    const matchesSearch = (template.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="templates-page">
      <div className="templates-layout">
        {/* SIDEBAR: Category Filters */}
        <aside className="templates-sidebar">
          <div className="sidebar-header">
            <h2>Categories</h2>
            <p>Select a style to start</p>
          </div>
          <nav className="category-nav">
            {CATEGORY_FILTERS.map(cat => {
              const imageSrc = CATEGORY_ICONS[cat]
              return (
                <button 
                  key={cat} 
                  className={`category-item ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <img src={imageSrc} alt={`${cat} Icon`} className="category-icon" />
                  <span className="category-label">{cat}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT: Gallery & Search */}
        <main className="templates-main">
          <header className="templates-header">
            <div className="header-text">
              <h1>Template Library</h1>
              <p>Choose from our professionally designed AI layouts to kickstart your next video.</p>
            </div>
            <div className="search-bar-premium">
              <MdSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search templates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </header>

          {loading ? (
            <TemplatesSkeleton />
          ) : (
            <div className="template-grid-main">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="template-card-premium"
                  onClick={() => onSelect && onSelect(template)}
                >
                  <div className="card-thumb-container">
                    <div className="high-fidelity-preview">
                      <TemplatePreview template={template} compact={true} />
                    </div>
                    <div className="card-tag">{template.tag}</div>
                    <div className="duration-badge">{template.duration}</div>
                    <div className="card-overlay-premium">
                      <button className="btn-preview">Use Template</button>
                    </div>
                  </div>
                  <div className="card-info-premium">
                    <div className="card-info-top">
                      <h3>{template.name}</h3>
                      <button 
                        className={`bookmark-btn ${bookmarked.includes(template.id) ? 'active' : ''}`}
                        onClick={(e) => toggleBookmark(template.id, e)}
                      >
                        {bookmarked.includes(template.id) ? <MdBookmark /> : <MdBookmarkBorder />}
                      </button>
                    </div>
                    <div className="card-meta-details">
                      <span className="meta-item">
                        <MdMonitor size={14} />
                        {template.ratio}
                      </span>
                      <span className="meta-item">
                        <MdLayers size={14} />
                        {(template.clips || []).length} Clips
                      </span>
                    </div>
                    <div className="card-actions-row">
                      <button
                        className="btn-use-template"
                        onClick={(e) => { e.stopPropagation(); onSelect && onSelect(template) }}
                      >
                        Select Layout
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="no-results-state">
                  <p>No templates found for "{searchQuery || activeCategory}"</p>
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
