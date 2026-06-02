import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
    MdVideoLibrary,
    MdCollectionsBookmark,
    MdCheckCircle,
    MdAccessTime,
    MdAdd,
    MdTrendingUp,
    MdExplore,
    MdAutoAwesome,
    MdPlayArrow,
    MdLanguage
} from 'react-icons/md'
import './Home.css'
import workspaceService from '../../services/workspaceService.js'

function Home({ onCreate, onEdit, onShowAIAssistant }) {
    const { user } = useAuth();
    const firstName = user?.name ? user.name.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'User');

    const [activeTab, setActiveTab] = useState('templates');
    const [recentProjects, setRecentProjects] = useState([])
    const [recentLoading, setRecentLoading] = useState(false)
    const [recentLoaded, setRecentLoaded] = useState(false)

    // Fetch real projects only when the Recent tab is first opened
    useEffect(() => {
        if (activeTab !== 'recent' || recentLoaded) return
        setRecentLoading(true)
        workspaceService.listAllVideosAcrossWorkspaces()
            .then(videos => {
                const sorted = [...videos].sort((a, b) => {
                    const da = new Date(a.updatedAt || a.createdAt || 0)
                    const db = new Date(b.updatedAt || b.createdAt || 0)
                    return db - da
                })
                setRecentProjects(sorted.slice(0, 12))
            })
            .catch(err => console.warn('[Home] Failed to fetch recent projects:', err))
            .finally(() => { setRecentLoading(false); setRecentLoaded(true) })
    }, [activeTab, recentLoaded])

    const stats = [
        {
            label: 'Total Videos',
            value: '24',
            trend: '+2 this week',
            icon: <MdVideoLibrary />,
            trendDir: 'up',
            trendIcon: <MdTrendingUp className="stat-trend-icon" />,
            progress: 78
        },
        {
            label: 'Draft Projects',
            value: '12',
            trend: '3 action needed',
            icon: <MdCollectionsBookmark />,
            trendDir: 'neutral',
            trendIcon: <MdAccessTime className="stat-trend-icon" />,
            progress: 54
        },
        {
            label: 'Published',
            value: '12',
            trend: '+12% engagement',
            icon: <MdCheckCircle />,
            trendDir: 'up',
            trendIcon: <MdTrendingUp className="stat-trend-icon" />,
            progress: 86
        }
    ]

    const formatDate = (iso) => {
        if (!iso) return 'Unknown date'
        const diff = Date.now() - new Date(iso).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        if (days === 1) return 'Yesterday'
        if (days < 7) return `${days} days ago`
        return new Date(iso).toLocaleDateString()
    }

    const templates = [
        { title: 'Educational Lecture', meta: 'Academic style', thumb: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400' },
        { title: 'Corporate Onboarding', meta: 'Professional', thumb: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=400' },
        { title: 'Software Tutorial', meta: 'Dynamic', thumb: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400' },
        { title: 'Product Reveal', meta: 'High Energy', thumb: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400' },
        { title: 'Marketing Promo', meta: 'Vibrant', thumb: 'https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&q=80&w=400' },
        { title: 'Weekly Update', meta: 'Clean & Simple', thumb: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400' }
    ]

    const trending = [
        { id: 101, title: 'AI in 2024: A comprehensive guide', views: '2.4k', thumb: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=400' },
        { id: 102, title: 'How to build engaging courses', views: '1.8k', thumb: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400' },
        { id: 103, title: 'Mastering Video Edits', views: '1.2k', thumb: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=400' }
    ]

    return (
        <div className="home-container">
            <div className="welcome-banner hero-redesign">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>Welcome back, {firstName}!</h1>
                        <p>Ready to create your next masterpiece? Jump right in and bring your ideas to life.</p>
                        <div className="hero-chips">
                            <span className="hero-chip">
                                <MdLanguage size={16} /> Multi-language ready
                            </span>
                            <span className="hero-chip">
                                <MdAutoAwesome size={16} /> AI tools available
                            </span>
                        </div>
                    </div>
                    <div className="hero-action">
                        <button className="btn-create-hero" onClick={onCreate}>
                            <MdAdd className="btn-create-hero-icon" /> Create New Video
                        </button>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="hero-decoration hero-circle-1"></div>
                <div className="hero-decoration hero-circle-2"></div>
                <div className="hero-decoration hero-circle-3"></div>
            </div>

            <div className="home-billing-stats">
                {stats.map((stat, i) => (
                    <div key={i} className="home-billing-stat-card">
                        <div className="home-billing-stat-top">
                            <span className="home-billing-stat-label">{stat.label}</span>
                            <span className="home-billing-stat-icon">{stat.icon}</span>
                        </div>
                        <div className="home-billing-stat-value">{stat.value}</div>
                        <div className={`home-billing-stat-trend ${stat.trendDir}`}>
                                {stat.trendIcon} {stat.trend}
                        </div>
                        <div className="home-billing-stat-meter" aria-hidden>
                            <span style={{ width: `${stat.progress}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="home-tabs-wrapper">
                <div className="home-tabs">
                    <button
                        className={`home-tab ${activeTab === 'templates' ? 'active' : ''}`}
                        onClick={() => setActiveTab('templates')}
                    >
                        <MdExplore size={18} /> Explore Templates
                    </button>
                    <button
                        className={`home-tab ${activeTab === 'recent' ? 'active' : ''}`}
                        onClick={() => setActiveTab('recent')}
                    >
                        <MdAccessTime size={18} /> My Recent
                    </button>
                    <button
                        className={`home-tab ${activeTab === 'trending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('trending')}
                    >
                        <MdTrendingUp size={18} /> Trending
                    </button>
                </div>
            </div>

            <div className="tab-content-area">
                {activeTab === 'templates' && (
                    <div className="tab-pane fade-in">
                        <div className="section-header">
                            <h2>Top Templates for You</h2>
                            <div className="view-all">Browse all</div>
                        </div>
                        <div className="projects-grid-override">
                            {templates.map((template, i) => (
                                <div key={i} className="project-card">
                                    <div className="project-thumb-container">
                                        <img src={template.thumb} alt={template.title} className="project-thumb" />
                                        <div className="project-overlay">
                                            <button className="btn-edit-premium" onClick={onCreate}>
                                                <MdAutoAwesome size={18} /> Use Template
                                            </button>
                                        </div>
                                    </div>
                                    <div className="project-content">
                                        <div className="project-info">
                                            <h3>{template.title}</h3>
                                            <div className="project-meta">
                                                {template.meta}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'recent' && (
                    <div className="tab-pane fade-in">
                        <div className="section-header">
                            <h2>Continue Working</h2>
                            <div className="view-all">View all projects</div>
                        </div>

                        {recentLoading && (
                            <div className="projects-grid-override">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="project-card project-card--skeleton">
                                        <div className="project-thumb-container skeleton-thumb" />
                                        <div className="project-content">
                                            <div className="skeleton-line skeleton-title" />
                                            <div className="skeleton-line skeleton-meta" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!recentLoading && recentProjects.length === 0 && (
                            <div className="empty-recent">
                                <MdVideoLibrary size={48} className="empty-recent-icon" />
                                <h3>No projects yet</h3>
                                <p>Create your first video to see it here.</p>
                                <button className="btn-create-hero" style={{ marginTop: '1rem' }} onClick={onCreate}>
                                    <MdAdd size={18} /> Create New Video
                                </button>
                            </div>
                        )}

                        {!recentLoading && recentProjects.length > 0 && (
                            <div className="projects-grid-override">
                                {recentProjects.map(project => (
                                    <div key={project.id || project._id} className="project-card">
                                        <div className="project-thumb-container">
                                            {project.thumbnailUrl ? (
                                                <img src={project.thumbnailUrl} alt={project.title || project.name} className="project-thumb" />
                                            ) : (
                                                <div className="project-thumb-placeholder">
                                                    <MdVideoLibrary size={36} />
                                                </div>
                                            )}
                                            <div className="project-overlay">
                                                <button
                                                    className="btn-edit-premium"
                                                    onClick={() => onEdit && onEdit(project)}
                                                >
                                                    <MdPlayArrow size={18} /> Resume Editor
                                                </button>
                                            </div>
                                        </div>
                                        <div className="project-content">
                                            <div className="project-info">
                                                <h3>{project.title || project.name || 'Untitled Project'}</h3>
                                                <div className="project-meta">
                                                    <MdAccessTime size={13} /> {formatDate(project.updatedAt || project.createdAt)}
                                                    {project.data?.scenes?.length > 0 && ` • ${project.data.scenes.length} scene${project.data.scenes.length !== 1 ? 's' : ''}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'trending' && (
                    <div className="tab-pane fade-in">
                        <div className="section-header">
                            <h2>Trending Top Videos</h2>
                            <div className="view-all">Discover more</div>
                        </div>
                        <div className="projects-grid-override">
                            {trending.map((trend, i) => (
                                <div key={i} className="project-card trend-card">
                                    <div className="project-thumb-container">
                                        <div className="trend-badge">
                                            <MdTrendingUp size={14} /> Trending
                                        </div>
                                        <img src={trend.thumb} alt={trend.title} className="project-thumb" />
                                        <div className="project-overlay">
                                            <button className="btn-edit-premium">
                                                <MdPlayArrow size={18} /> Watch
                                            </button>
                                        </div>
                                    </div>
                                    <div className="project-content">
                                        <div className="project-info">
                                            <h3>{trend.title}</h3>
                                            <div className="project-meta">
                                                <MdVideoLibrary size={13} /> {trend.views} views this week
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>


        </div>
    )
}

export default Home
