const styles = `
.news-section {
  min-height: 100vh;
  padding: 120px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.news-section.light {
  background: #ffffff;
  color: #1e40af;
}

.news-section.dark {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  color: #ffffff;
}

.news-section-content {
  max-width: 1400px;
  width: 100%;
}

.news-section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 64px;
  font-weight: 500;
  text-align: center;
  margin: 0 0 40px;
}

.news-section.light .news-section-title {
  color: #1e40af;
}

.news-section.dark .news-section-title {
  color: #ffffff;
}

.news-section-description {
  font-family: 'Arial', sans-serif;
  font-size: 20px;
  line-height: 1.8;
  text-align: center;
  max-width: 800px;
  margin: 0 auto 60px;
}

.news-section.light .news-section-description {
  color: #1e40af;
}

.news-section.dark .news-section-description {
  color: rgba(255, 255, 255, 0.9);
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
  margin-top: 60px;
}

.news-section.light .news-card {
  background: rgba(30, 64, 175, 0.05);
  border: 1px solid rgba(30, 64, 175, 0.2);
}

.news-section.dark .news-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.news-card {
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.news-section.light .news-card:hover {
  background: rgba(30, 64, 175, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 8px 24px rgba(30, 64, 175, 0.15);
}

.news-section.dark .news-card:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.news-card:hover {
  transform: translateY(-4px);
}

.news-category {
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  color: #ffffff;
  background: #3b82f6;
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.news-section.dark .news-category {
  background: rgba(255, 255, 255, 0.2);
}

.news-date {
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  margin-bottom: 12px;
  font-weight: 500;
}

.news-section.light .news-date {
  color: #3b82f6;
}

.news-section.dark .news-date {
  color: rgba(255, 255, 255, 0.8);
}

.news-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 12px;
}

.news-section.light .news-title {
  color: #1e40af;
}

.news-section.dark .news-title {
  color: #ffffff;
}

.news-excerpt {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 16px;
}

.news-section.light .news-excerpt {
  color: #1e40af;
}

.news-section.dark .news-excerpt {
  color: rgba(255, 255, 255, 0.9);
}

.news-read-more {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.news-section.light .news-read-more {
  color: #3b82f6;
}

.news-section.dark .news-read-more {
  color: rgba(255, 255, 255, 0.9);
}

.news-read-more:hover {
  gap: 12px;
}

@media (max-width: 768px) {
  .news-section {
    padding: 80px 24px;
  }

  .news-section-title {
    font-size: 42px;
  }

  .news-section-description {
    font-size: 18px;
  }

  .news-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
`

function NewsSection({ variant = 'light' }) {
  const newsItems = [
    {
      category: 'Product Launch',
      date: 'March 20, 2024',
      title: 'AthenaVI Announces New AI Avatar Technology',
      excerpt: 'We\'re excited to introduce our latest breakthrough in AI avatar creation, enabling more realistic and expressive digital personas.'
    },
    {
      category: 'Partnership',
      date: 'March 18, 2024',
      title: 'Strategic Partnership with Global Media Company',
      excerpt: 'AthenaVI partners with leading media organizations to bring AI-powered video creation to content creators worldwide.'
    },
    {
      category: 'Award',
      date: 'March 12, 2024',
      title: 'Winner of Best AI Innovation Award 2024',
      excerpt: 'Recognized for excellence in AI technology and innovation in the video creation industry.'
    },
    {
      category: 'Company',
      date: 'March 8, 2024',
      title: 'AthenaVI Reaches 1 Million Users Milestone',
      excerpt: 'Celebrating a major milestone as we continue to democratize professional video creation for users around the globe.'
    }
  ]

  return (
    <>
      <style>{styles}</style>
      <section id="news" className={`news-section ${variant}`}>
        <div className="news-section-content">
          <h1 className="news-section-title">News</h1>
          <p className="news-section-description">
            Stay informed about product updates, company milestones, partnerships, and industry insights.
          </p>
          
          <div className="news-grid">
            {newsItems.map((item, index) => (
              <div key={index} className="news-card">
                <span className="news-category">{item.category}</span>
                <div className="news-date">{item.date}</div>
                <h3 className="news-title">{item.title}</h3>
                <p className="news-excerpt">{item.excerpt}</p>
                <a href="#" className="news-read-more">
                  Read More →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default NewsSection

