import { useState } from 'react'
import { 
  MdSearch, 
  MdFilterList, 
  MdPlayCircleFilled, 
  MdBookmarkBorder, 
  MdBookmark,
  MdClose,
  MdArrowBack,
  MdMonitor,
  MdPhoneIphone,
  MdLayers,
  MdAccessTime
} from 'react-icons/md'
import './Templates.css'

const categories = ['All Templates', 'Education', 'Business', 'Marketing', 'Social Media', 'Tutorial']

const templatesData = [
  { 
    id: 1, 
    name: 'Corporate Onboarding', 
    category: 'Business', 
    ratio: '16:9', 
    scenes: 8, 
    duration: '2:15', 
    thumb: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=600',
    tag: 'BUSINESS',
    description: 'A professional template designed for welcoming new employees. Features clean layouts, corporate color schemes, and structured information flow.'
  },
  { 
    id: 2, 
    name: 'Educational Lecture', 
    category: 'Education', 
    ratio: '16:9', 
    scenes: 12, 
    duration: '5:00', 
    thumb: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600',
    tag: 'EDUCATION',
    description: 'Perfect for academic content. Includes title slides, content slides with space for avatars, and summary layouts.'
  },
  { 
    id: 3, 
    name: 'Product Reveal', 
    category: 'Marketing', 
    ratio: '16:9', 
    scenes: 6, 
    duration: '1:00', 
    thumb: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
    tag: 'MARKETING',
    description: 'High-energy template for product announcements. Focuses on visual impact and clear value propositions.'
  },
  { 
    id: 4, 
    name: 'Social Story Ads', 
    category: 'Social Media', 
    ratio: '9:16', 
    scenes: 4, 
    duration: '0:15', 
    thumb: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=600',
    tag: 'SOCIAL',
    description: 'Vertical layout optimized for Instagram and TikTok stories. Fast-paced and engaging.'
  },
  { 
    id: 5, 
    name: 'Software Walkthrough', 
    category: 'Tutorial', 
    ratio: '16:9', 
    scenes: 10, 
    duration: '3:45', 
    thumb: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
    tag: 'TUTORIAL',
    description: 'Ideal for technical demos. Features screen recording placeholders and clear step-by-step pointers.'
  },
  { 
    id: 6, 
    name: 'Real Estate Pitch', 
    category: 'Business', 
    ratio: '16:9', 
    scenes: 7, 
    duration: '2:30', 
    thumb: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600',
    tag: 'BUSINESS',
    description: 'Showcase properties with elegance. Large image areas and professional text overlays.'
  }
]

function Templates({ onSelect }) {
  const [activeCategory, setActiveCategory] = useState('All Templates')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarked, setBookmarked] = useState([])

  const toggleBookmark = (id, e) => {
    e.stopPropagation()
    if (bookmarked.includes(id)) {
      setBookmarked(bookmarked.filter(item => item !== id))
    } else {
      setBookmarked([...bookmarked, id])
    }
  }

  const filteredTemplates = templatesData.filter(template => {
    const matchesCategory = activeCategory === 'All Templates' || template.category === activeCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="templates-page">
      <header className="templates-header">
        <div className="header-content">
          <h1>Template Library</h1>
          <p>Kickstart your next educational video in minutes with our professionally designed layouts.</p>
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

      <div className="category-filters">
        <div className="filters-scroll">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="template-grid-main">
        {filteredTemplates.map(template => (
          <div key={template.id} className="template-card-premium" onClick={() => onSelect && onSelect(template)}>
            <div className="card-thumb-container">
              <img src={template.thumb} alt={template.name} className="template-img" />
              <div className="card-tag">{template.tag}</div>
              <div className="duration-badge">{template.duration}</div>
              <div className="card-overlay-premium">
                <button className="btn-preview">Preview Template</button>
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
                  {template.ratio === '16:9' ? <MdMonitor size={14} /> : <MdPhoneIphone size={14} />}
                  {template.ratio}
                </span>
                <span className="meta-item">
                  <MdLayers size={14} />
                  {template.scenes} Scenes
                </span>
              </div>
              <button className="btn-use-template">Use Template</button>
            </div>
          </div>
        ))}
      </div>

      <div className="load-more-container">
        <button className="btn-load-more">Load More Templates</button>
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
