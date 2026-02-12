import { useState } from 'react'
import { 
  MdVisibility, 
  MdFavorite, 
  MdComment,
  MdPerson,
  MdArrowForward
} from 'react-icons/md'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const styles = `
.news-page {
  min-height: 100vh;
  background: #f8fafc;
  color: #1e40af;
  font-family: 'Arial', sans-serif;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 75vh;
  display: flex;
  align-items: flex-end;
  padding: 120px 40px 80px;
  background: #000000;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.hero-background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.75;
}

.hero-background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(30, 64, 175, 0.3) 50%, rgba(0, 0, 0, 0.4) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  color: #ffffff;
}

.hero-category {
  display: inline-block;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  color: #ffffff;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.hero-title {
  font-size: 64px;
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 32px;
  max-width: 900px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  letter-spacing: -0.5px;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.hero-date {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
}

.hero-author {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
}

.hero-author-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
}

.hero-stat svg {
  font-size: 20px;
  opacity: 0.9;
}

/* Featured Cards Section */
.featured-cards {
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 40px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  background: #ffffff;
}

.featured-card {
  display: flex;
  gap: 24px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.featured-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(30, 64, 175, 0.15);
  border-color: #3b82f6;
}

.featured-card-image {
  width: 240px;
  height: 180px;
  object-fit: cover;
  flex-shrink: 0;
}

.featured-card-content {
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.featured-card-date {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.featured-card-title {
  font-size: 22px;
  font-weight: 600;
  color: #1e40af;
  margin: 0;
  line-height: 1.4;
  letter-spacing: -0.3px;
}

/* Trending News Section */
.trending-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 40px;
  background: #f8fafc;
}

.trending-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48px;
  flex-wrap: wrap;
  gap: 32px;
}

.trending-title {
  font-size: 42px;
  font-weight: 700;
  color: #1e40af;
  margin: 0;
  letter-spacing: -0.5px;
}

.trending-nav {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.trending-nav-item {
  padding: 10px 24px;
  background: #ffffff;
  color: #64748b;
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;
}

.trending-nav-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #1e40af;
  transform: translateY(-2px);
}

.trending-nav-item.active {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
}

.trending-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 32px;
}

.trending-main-card {
  grid-row: span 3;
}

.trending-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.trending-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(30, 64, 175, 0.15);
  border-color: #3b82f6;
}

.trending-card-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  position: relative;
}

.trending-main-card .trending-card-image {
  height: 420px;
}

.trending-card-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trending-card-category {
  display: inline-block;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  color: #ffffff;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  width: fit-content;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.trending-card-date {
  font-size: 13px;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  font-weight: 500;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 12px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.trending-card-content {
  padding: 28px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.trending-card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e40af;
  margin: 0;
  line-height: 1.5;
  letter-spacing: -0.3px;
}

.trending-main-card .trending-card-title {
  font-size: 26px;
  line-height: 1.4;
}

.trending-card-excerpt {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  margin: 16px 0 0;
}

.trending-card-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 600;
  margin-top: 20px;
  text-decoration: none;
  transition: gap 0.2s ease;
}

.trending-card-link:hover {
  gap: 12px;
  color: #1e40af;
}

/* Categories Sidebar */
.categories-sidebar {
  grid-column: 3;
  grid-row: 1 / span 3;
}

.categories-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e40af;
  margin: 0 0 32px;
  letter-spacing: -0.5px;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.category-item:hover {
  background: #f8fafc;
  transform: translateX(4px);
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.1);
}

.category-image {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
  border: 2px solid #e2e8f0;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 6px;
  letter-spacing: -0.2px;
}

.category-count {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .trending-content {
    grid-template-columns: 1fr 1fr;
  }

  .categories-sidebar {
    grid-column: 1 / span 2;
    grid-row: auto;
  }

  .trending-main-card {
    grid-row: span 1;
  }

  .categories-list {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .category-item {
    flex: 1;
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 65vh;
    padding: 100px 24px 60px;
  }

  .hero-title {
    font-size: 40px;
  }

  .hero-meta {
    gap: 20px;
  }

  .hero-stats {
    gap: 20px;
  }

  .featured-cards {
    grid-template-columns: 1fr;
    padding: 40px 24px;
    gap: 24px;
  }

  .featured-card {
    flex-direction: column;
  }

  .featured-card-image {
    width: 100%;
    height: 220px;
  }

  .trending-section {
    padding: 60px 24px;
  }

  .trending-title {
    font-size: 32px;
  }

  .trending-content {
    grid-template-columns: 1fr;
  }

  .trending-main-card .trending-card-image {
    height: 280px;
  }

  .categories-sidebar {
    grid-column: 1;
  }

  .categories-list {
    flex-direction: column;
  }
}
`

function News({ onLoginClick, onLogoClick, onNavigateToCompany, onNavigateToSolution, onNavigateToEthics, onNavigateToTechnology }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', 'Product Updates', 'Technology', 'Company News', 'Partnerships', 'Industry Insights']

  const featuredArticles = [
    {
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&q=80',
      date: 'March 28, 2024',
      title: 'AthenaVI Launches Next-Generation AI Avatar Technology with Enhanced Realism'
    },
    {
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop&q=80',
      date: 'March 25, 2024',
      title: 'Revolutionary Video Translation Feature Now Supports 120+ Languages'
    }
  ]

  const trendingArticles = [
    {
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&q=80',
      category: 'Technology',
      date: 'April 15, 2024',
      title: 'How AI-Powered Video Creation is Transforming Business Communication',
      excerpt: 'AthenaVI\'s advanced AI technology enables businesses to create professional videos at scale, reducing production costs by up to 80% while maintaining exceptional quality.'
    },
    {
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop&q=80',
      category: 'Product Updates',
      date: 'April 12, 2024',
      title: 'New Personal Avatar Studio: Create Lifelike Digital Presenters in Minutes',
      excerpt: 'Introducing our most advanced avatar creation tool yet, featuring real-time customization and natural voice synthesis.'
    },
    {
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80',
      category: 'Company News',
      date: 'April 10, 2024',
      title: 'AthenaVI Reaches 1 Million Active Users Worldwide',
      excerpt: 'Celebrating a major milestone as we continue to democratize professional video creation for businesses and creators globally.'
    },
    {
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=400&fit=crop&q=80',
      category: 'Partnerships',
      date: 'April 8, 2024',
      title: 'Strategic Partnership with Global Media Companies Announced',
      excerpt: 'AthenaVI partners with leading media organizations to bring AI-powered video solutions to content creators worldwide.'
    }
  ]

  const categoryList = [
    { name: 'Product Updates', count: 12, image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=200&fit=crop&q=80' },
    { name: 'Technology', count: 18, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=200&fit=crop&q=80' },
    { name: 'Company News', count: 15, image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=200&fit=crop&q=80' },
    { name: 'Partnerships', count: 8, image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=200&h=200&fit=crop&q=80' },
    { name: 'Industry Insights', count: 22, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop&q=80' }
  ]

  return (
    <>
      <style>{styles}</style>
      <div className="news-page">
        <Navbar 
          onLoginClick={onLoginClick}
          onLogoClick={onLogoClick}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToTechnology={onNavigateToTechnology}
        />
        
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background">
            <img 
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&h=1080&fit=crop&q=80"
              alt="AthenaVI AI Technology"
              className="hero-background-image"
            />
            <div className="hero-background-overlay"></div>
          </div>

          <div className="hero-content">
            <span className="hero-category">Technology</span>
            <h1 className="hero-title">The Future of AI-Powered Video Creation: AthenaVI's Latest Breakthrough</h1>
            <div className="hero-meta">
              <span className="hero-date">April 15, 2024</span>
              <div className="hero-author">
                <div className="hero-author-icon">
                  <MdPerson />
                </div>
                <span>By AthenaVI Team</span>
              </div>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <MdVisibility />
                <span>12,482</span>
              </div>
              <div className="hero-stat">
                <MdFavorite />
                <span>324</span>
              </div>
              <div className="hero-stat">
                <MdComment />
                <span>89</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Cards */}
        <div className="featured-cards">
          {featuredArticles.map((article, index) => (
            <div key={index} className="featured-card">
              <img 
                src={article.image} 
                alt={article.title}
                className="featured-card-image"
              />
              <div className="featured-card-content">
                <div className="featured-card-date">{article.date}</div>
                <h3 className="featured-card-title">{article.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Trending News Section */}
        <section className="trending-section">
          <div className="trending-header">
            <h2 className="trending-title">Latest News & Updates</h2>
            <div className="trending-nav">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`trending-nav-item ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="trending-content">
            {/* Main Large Card */}
            <div className="trending-card trending-main-card">
              <div style={{ position: 'relative' }}>
                <img 
                  src={trendingArticles[0].image} 
                  alt={trendingArticles[0].title}
                  className="trending-card-image"
                />
                <div className="trending-card-overlay">
                  <span className="trending-card-category">{trendingArticles[0].category}</span>
                  <span className="trending-card-date">{trendingArticles[0].date}</span>
                </div>
              </div>
              <div className="trending-card-content">
                <h3 className="trending-card-title">{trendingArticles[0].title}</h3>
                <p className="trending-card-excerpt">{trendingArticles[0].excerpt}</p>
                <a href="#" className="trending-card-link">
                  Read More <MdArrowForward />
                </a>
              </div>
            </div>

            {/* Smaller Cards */}
            {trendingArticles.slice(1).map((article, index) => (
              <div key={index} className="trending-card">
                <div style={{ position: 'relative' }}>
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="trending-card-image"
                  />
                  <div className="trending-card-overlay">
                    <span className="trending-card-category">{article.category}</span>
                    <span className="trending-card-date">{article.date}</span>
                  </div>
                </div>
                <div className="trending-card-content">
                  <h3 className="trending-card-title">{article.title}</h3>
                  <p className="trending-card-excerpt">{article.excerpt}</p>
                  <a href="#" className="trending-card-link">
                    Read More <MdArrowForward />
                  </a>
                </div>
              </div>
            ))}

            {/* Categories Sidebar */}
            <div className="categories-sidebar">
              <h3 className="categories-title">Categories</h3>
              <div className="categories-list">
                {categoryList.map((category, index) => (
                  <div key={index} className="category-item">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="category-image"
                    />
                    <div className="category-info">
                      <h4 className="category-name">{category.name}</h4>
                      <div className="category-count">{category.count} articles</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        <Footer onNavigateToCompany={onNavigateToCompany} />
      </div>
    </>
  )
}

export default News
