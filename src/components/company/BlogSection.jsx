import { useState, useRef, useEffect } from 'react'

const styles = `
.blog-section {
  min-height: 100vh;
  padding: 120px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blog-section.light {
  background: #ffffff;
  color: #1e40af;
}

.blog-section.dark {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  color: #ffffff;
}

.blog-section-content {
  max-width: 1400px;
  width: 100%;
  position: relative;
}

.blog-section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 64px;
  font-weight: 500;
  text-align: center;
  margin: 0 0 40px;
  letter-spacing: -0.5px;
}

.blog-section.light .blog-section-title {
  color: #1e40af;
}

.blog-section.dark .blog-section-title {
  color: #ffffff;
}

.blog-section-description {
  font-family: 'Arial', sans-serif;
  font-size: 20px;
  line-height: 1.8;
  text-align: center;
  max-width: 800px;
  margin: 0 auto 60px;
}

.blog-section.light .blog-section-description {
  color: #1e40af;
}

.blog-section.dark .blog-section-description {
  color: rgba(255, 255, 255, 0.9);
}

.blog-container-wrapper {
  position: relative;
  margin-top: 60px;
}

.blog-grid {
  display: flex;
  gap: 32px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 8px 0;
}

.blog-card {
  flex: 0 0 calc(33.333% - 22px);
  min-width: 0;
}

@media (min-width: 1200px) {
  .blog-card {
    flex: 0 0 calc(33.333% - 22px);
  }
}

.blog-grid::-webkit-scrollbar {
  display: none;
}

.blog-section.light .blog-card {
  background: #ffffff;
  border: 1px solid rgba(30, 64, 175, 0.1);
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.08);
}

.blog-section.dark .blog-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.blog-card {
  border-radius: 20px;
  padding: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.blog-section.light .blog-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(30, 64, 175, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
}

.blog-section.dark .blog-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.12);
}

.blog-card-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.blog-card-content {
  padding: 32px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.blog-date {
  font-family: 'Arial', sans-serif;
  font-size: 13px;
  margin-bottom: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.blog-section.light .blog-date {
  color: #3b82f6;
}

.blog-section.dark .blog-date {
  color: rgba(255, 255, 255, 0.7);
}

.blog-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 26px;
  font-weight: 600;
  margin: 0 0 16px;
  line-height: 1.3;
  letter-spacing: -0.3px;
}

.blog-section.light .blog-title {
  color: #1e40af;
}

.blog-section.dark .blog-title {
  color: #ffffff;
}

.blog-excerpt {
  font-family: 'Arial', sans-serif;
  font-size: 15px;
  line-height: 1.7;
  margin: 0 0 24px;
  flex: 1;
}

.blog-section.light .blog-excerpt {
  color: rgba(30, 64, 175, 0.8);
}

.blog-section.dark .blog-excerpt {
  color: rgba(255, 255, 255, 0.85);
}

.blog-read-more {
  font-family: 'Arial', sans-serif;
  font-size: 15px;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid;
}

.blog-section.light .blog-read-more {
  color: #3b82f6;
  border-color: rgba(30, 64, 175, 0.1);
}

.blog-section.dark .blog-read-more {
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.15);
}

.blog-read-more:hover {
  gap: 12px;
}

.blog-read-more-arrow {
  transition: transform 0.3s ease;
}

.blog-read-more:hover .blog-read-more-arrow {
  transform: translateX(4px);
}

.blog-nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #1e40af;
  transition: all 0.3s ease;
  z-index: 10;
}

.blog-section.light .blog-nav-arrow {
  background: rgba(255, 255, 255, 0.95);
  color: #1e40af;
  box-shadow: 0 4px 16px rgba(30, 64, 175, 0.15);
}

.blog-section.dark .blog-nav-arrow {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.blog-nav-arrow:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.blog-section.light .blog-nav-arrow:hover {
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(30, 64, 175, 0.25);
}

.blog-section.dark .blog-nav-arrow:hover {
  background: rgba(255, 255, 255, 0.25);
}

.blog-nav-arrow:active {
  transform: translateY(-50%) scale(0.95);
}

.blog-nav-arrow-left {
  left: -24px;
}

.blog-nav-arrow-right {
  right: -24px;
}

.blog-nav-arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 1200px) {
  .blog-card {
    flex: 0 0 calc(33.333% - 22px);
  }
}

@media (max-width: 968px) {
  .blog-card {
    flex: 0 0 calc(50% - 16px);
  }
  
  .blog-nav-arrow {
    display: none;
  }
}

@media (max-width: 768px) {
  .blog-section {
    padding: 80px 24px;
  }

  .blog-section-title {
    font-size: 42px;
  }

  .blog-section-description {
    font-size: 18px;
  }

  .blog-card {
    flex: 0 0 100%;
  }

  .blog-card-content {
    padding: 24px;
  }

  .blog-title {
    font-size: 22px;
  }
}
`

function BlogSection({ variant = 'light' }) {
  const blogPosts = [
    {
      date: 'March 15, 2024',
      title: 'The Future of AI-Powered Video Creation',
      excerpt: 'Exploring how artificial intelligence is revolutionizing the way we create and consume video content, making professional-quality videos accessible to everyone.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop'
    },
    {
      date: 'March 10, 2024',
      title: 'Building Trust in AI Technology',
      excerpt: 'Our commitment to ethical AI development and transparent practices that ensure our technology serves humanity responsibly.',
      image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&h=400&fit=crop'
    },
    {
      date: 'March 5, 2024',
      title: 'Personalization at Scale: The New Marketing Paradigm',
      excerpt: 'How AI avatars and personalized video content are transforming marketing strategies and customer engagement across industries.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop'
    },
    {
      date: 'February 28, 2024',
      title: 'Breaking Language Barriers with AI Translation',
      excerpt: 'Discover how our video translation technology is helping businesses reach global audiences with authentic, localized content.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop'
    },
    {
      date: 'February 20, 2024',
      title: 'The Art of Storytelling in Digital Media',
      excerpt: 'Learn how modern video production tools are enabling creators to tell compelling stories that resonate with audiences worldwide.',
      image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=400&fit=crop'
    },
    {
      date: 'February 15, 2024',
      title: 'Innovation in Content Creation Workflows',
      excerpt: 'Streamlining creative processes with intelligent automation and collaborative tools that enhance productivity and creativity.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop'
    }
  ]

  const gridRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollability = () => {
    if (gridRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = gridRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollability()
    const handleResize = () => {
      setTimeout(checkScrollability, 100)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const scrollLeft = () => {
    if (gridRef.current) {
      const containerWidth = gridRef.current.clientWidth
      const scrollAmount = containerWidth / 3 + 32 // Scroll by one card width + gap
      gridRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      setTimeout(checkScrollability, 300)
    }
  }

  const scrollRight = () => {
    if (gridRef.current) {
      const containerWidth = gridRef.current.clientWidth
      const scrollAmount = containerWidth / 3 + 32 // Scroll by one card width + gap
      gridRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      setTimeout(checkScrollability, 300)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <section id="blog" className={`blog-section ${variant}`}>
        <div className="blog-section-content">
          <h1 className="blog-section-title">Blog</h1>
          <p className="blog-section-description">
            Stay informed with insights, updates, and thought leadership from our team.
          </p>
          
          <div className="blog-container-wrapper">
            <button 
              className={`blog-nav-arrow blog-nav-arrow-left ${!canScrollLeft ? 'disabled' : ''}`}
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              ‹
            </button>
            <div 
              className="blog-grid" 
              ref={gridRef}
              onScroll={checkScrollability}
            >
              {blogPosts.map((post, index) => (
                <div key={index} className="blog-card">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="blog-card-image"
                    loading="lazy"
                  />
                  <div className="blog-card-content">
                    <div className="blog-date">{post.date}</div>
                    <h3 className="blog-title">{post.title}</h3>
                    <p className="blog-excerpt">{post.excerpt}</p>
                    <a href="#" className="blog-read-more">
                      Read More
                      <span className="blog-read-more-arrow">→</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className={`blog-nav-arrow blog-nav-arrow-right ${!canScrollRight ? 'disabled' : ''}`}
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              ›
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

export default BlogSection

