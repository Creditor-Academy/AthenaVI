import React, { useState } from 'react'
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
    MdClose,
    MdRocketLaunch,
    MdLanguage
} from 'react-icons/md'
import './Home.css'

function Home({ onCreate, onShowAIAssistant }) {
    const { user } = useAuth();
    const firstName = user?.name ? user.name.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'User');

    const [activeTab, setActiveTab] = useState('templates');
    const [showCreateInfoModal, setShowCreateInfoModal] = useState(false);
    const [videoInfo, setVideoInfo] = useState({
        title: '',
        objective: 'Educational',
        language: 'English'
    });

    const handleCreateClick = (e) => {
        if (e) e.stopPropagation();
        setShowCreateInfoModal(true);
    };

    const handleModalSubmit = (e) => {
        e.preventDefault();
        setShowCreateInfoModal(false);
        // In a real app, we'd pass videoInfo to onCreate or store it in context
        // For now, we'll just trigger the transition to Create page
        onCreate();
    };

    const stats = [
        { label: 'Total Videos', value: '24', trend: '+2 this week', icon: <MdVideoLibrary />, trendDir: 'up', trendIcon: <MdTrendingUp className="stat-trend-icon" /> },
        { label: 'Draft Projects', value: '12', trend: '3 action needed', icon: <MdCollectionsBookmark />, trendDir: 'neutral', trendIcon: <MdAccessTime className="stat-trend-icon" /> },
        { label: 'Published', value: '12', trend: '+12% engagement', icon: <MdCheckCircle />, trendDir: 'up', trendIcon: <MdTrendingUp className="stat-trend-icon" /> }
    ]

    const recentProjects = [
        { id: 1, title: 'Introduction to Digital Marketing', scenes: 8, updated: '2 hours ago', thumb: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400' },
        { id: 2, title: 'UI/UX Design Fundamentals', scenes: 5, updated: 'Yesterday', thumb: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=400' },
        { id: 3, title: 'Leadership & Management', scenes: 12, updated: '3 days ago', thumb: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400' }
    ]

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
            <div className="welcome-banner">
                <div className="welcome-banner-content">
                    <div className="welcome-text">
                        <h1>Welcome back, {firstName}!</h1>
                        <p>Ready to create your next masterpiece?</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-secondary" onClick={onShowAIAssistant}>
                            <MdAutoAwesome /> AI Assistant
                        </button>
                        <button className="btn-primary" onClick={handleCreateClick}>
                            <MdAdd /> Create New Video
                        </button>
                    </div>
                </div>
            </div>

            <div className="stats-container-sleek">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card-sleek">
                        <div className="stat-card-sleek-header">
                            <span className="stat-sleek-label">{stat.label}</span>
                            <span className="stat-sleek-icon">{stat.icon}</span>
                        </div>
                        <div className="stat-sleek-body">
                            <span className="stat-sleek-value">{stat.value}</span>
                        </div>
                        <div className="stat-sleek-footer">
                            <span className={`stat-sleek-trend ${stat.trendDir}`}>
                                {stat.trendIcon} {stat.trend}
                            </span>
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
                                            <button className="btn-edit-premium" onClick={handleCreateClick}>
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
                        <div className="projects-grid-override">
                            {recentProjects.map(project => (
                                <div key={project.id} className="project-card">
                                    <div className="project-thumb-container">
                                        <img src={project.thumb} alt={project.title} className="project-thumb" />
                                        <div className="project-overlay">
                                            <button className="btn-edit-premium" onClick={handleCreateClick}>
                                                <MdPlayArrow size={18} /> Resume Editor
                                            </button>
                                        </div>
                                    </div>
                                    <div className="project-content">
                                        <div className="project-info">
                                            <h3>{project.title}</h3>
                                            <div className="project-meta">
                                                <MdAccessTime size={13} /> {project.updated} • {project.scenes} scenes
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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

            {showCreateInfoModal && (
                <div className="create-modal-overlay">
                    <div className="create-modal-content">
                        <div className="create-modal-header">
                            <h2>Project Initialization</h2>
                            <button className="btn-close-modal" onClick={() => setShowCreateInfoModal(false)}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleModalSubmit}>
                            <div className="create-modal-body">
                                <div className="create-form-group">
                                    <label>Video Title</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter a name for your video..." 
                                        value={videoInfo.title}
                                        onChange={(e) => setVideoInfo({...videoInfo, title: e.target.value})}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="create-form-group">
                                    <label>What's your creative objective?</label>
                                    <select 
                                        value={videoInfo.objective}
                                        onChange={(e) => setVideoInfo({...videoInfo, objective: e.target.value})}
                                    >
                                        <option value="Educational">Educational Presentation</option>
                                        <option value="Marketing">Marketing & Promo</option>
                                        <option value="Corporate">Corporate Training</option>
                                        <option value="Entertainment">Creative Storytelling</option>
                                        <option value="Personal">Personal Message</option>
                                    </select>
                                </div>
                                <div className="create-form-group">
                                    <label>Primary Language</label>
                                    <select 
                                        value={videoInfo.language}
                                        onChange={(e) => setVideoInfo({...videoInfo, language: e.target.value})}
                                    >
                                        <option value="English">English (US/UK)</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="French">French</option>
                                        <option value="German">German</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Mandarin">Mandarin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="create-modal-footer">
                                <button type="submit" className="btn-start-create">
                                    <MdRocketLaunch size={18} /> Start Creating
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home
