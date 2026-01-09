const styles = `
.resources-section {
  min-height: 100vh;
  padding: 120px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resources-section.light {
  background: #ffffff;
  color: #1e40af;
}

.resources-section.dark {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  color: #ffffff;
}

.resources-section-content {
  max-width: 1400px;
  width: 100%;
}

.resources-section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 64px;
  font-weight: 500;
  text-align: center;
  margin: 0 0 40px;
}

.resources-section.light .resources-section-title {
  color: #1e40af;
}

.resources-section.dark .resources-section-title {
  color: #ffffff;
}

.resources-section-description {
  font-family: 'Arial', sans-serif;
  font-size: 20px;
  line-height: 1.8;
  text-align: center;
  max-width: 800px;
  margin: 0 auto 60px;
}

.resources-section.light .resources-section-description {
  color: #1e40af;
}

.resources-section.dark .resources-section-description {
  color: rgba(255, 255, 255, 0.9);
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-top: 60px;
}

.resources-section.light .resource-card {
  background: rgba(30, 64, 175, 0.05);
  border: 1px solid rgba(30, 64, 175, 0.2);
}

.resources-section.dark .resource-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.resource-card {
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.resources-section.light .resource-card:hover {
  background: rgba(30, 64, 175, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 8px 24px rgba(30, 64, 175, 0.15);
}

.resources-section.dark .resource-card:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.resource-card:hover {
  transform: translateY(-4px);
}

.resource-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.resource-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 22px;
  font-weight: 500;
  margin: 0 0 12px;
}

.resources-section.light .resource-title {
  color: #1e40af;
}

.resources-section.dark .resource-title {
  color: #ffffff;
}

.resource-description {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 16px;
}

.resources-section.light .resource-description {
  color: #1e40af;
}

.resources-section.dark .resource-description {
  color: rgba(255, 255, 255, 0.9);
}

.resource-link {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.resources-section.light .resource-link {
  color: #3b82f6;
}

.resources-section.dark .resource-link {
  color: rgba(255, 255, 255, 0.9);
}

.resource-link:hover {
  gap: 12px;
}

@media (max-width: 768px) {
  .resources-section {
    padding: 80px 24px;
  }

  .resources-section-title {
    font-size: 42px;
  }

  .resources-section-description {
    font-size: 18px;
  }

  .resources-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
`

function ResourcesSection({ variant = 'light' }) {
  const resources = [
    {
      icon: '📚',
      title: 'Documentation',
      description: 'Comprehensive guides and API documentation to help you get started with AthenaVI.',
      link: 'View Documentation'
    },
    {
      icon: '🎓',
      title: 'Video Tutorials',
      description: 'Step-by-step video tutorials covering everything from basics to advanced features.',
      link: 'Watch Tutorials'
    },
    {
      icon: '💡',
      title: 'Best Practices',
      description: 'Learn industry best practices and tips for creating compelling video content.',
      link: 'Read Guide'
    },
    {
      icon: '🔧',
      title: 'Developer Tools',
      description: 'SDKs, plugins, and integrations to extend AthenaVI functionality in your projects.',
      link: 'Explore Tools'
    },
    {
      icon: '📊',
      title: 'Case Studies',
      description: 'Real-world examples of how businesses are using AthenaVI to achieve their goals.',
      link: 'View Cases'
    },
    {
      icon: '🤝',
      title: 'Community Forum',
      description: 'Join our community to share ideas, ask questions, and connect with other users.',
      link: 'Join Forum'
    }
  ]

  return (
    <>
      <style>{styles}</style>
      <section id="resources" className={`resources-section ${variant}`}>
        <div className="resources-section-content">
          <h1 className="resources-section-title">Resources</h1>
          <p className="resources-section-description">
            Everything you need to learn, build, and succeed with AthenaVI.
          </p>
          
          <div className="resources-grid">
            {resources.map((resource, index) => (
              <div key={index} className="resource-card">
                <div className="resource-icon">{resource.icon}</div>
                <h3 className="resource-title">{resource.title}</h3>
                <p className="resource-description">{resource.description}</p>
                <a href="#" className="resource-link">
                  {resource.link} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default ResourcesSection

