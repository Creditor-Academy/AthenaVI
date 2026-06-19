import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
    MdVideoLibrary,
    MdCollectionsBookmark,
    MdAccessTime,
    MdAdd,
    MdExplore,
    MdAutoAwesome,
    MdPlayArrow,
    MdLanguage,
    MdLayers,
    MdAccountBalanceWallet,
} from 'react-icons/md'
import './Home.css'
import workspaceService from '../../services/workspaceService.js'
import videoLibraryService from '../../services/videoLibraryService.js'
import creditsService from '../../services/creditsService.js'
import { fetchTemplateBundles } from '../../utils/fetchTemplateBundles.js'
import TemplateScenePreview from '../../components/features/editor/editor/TemplateScenePreview'
import ProjectSceneThumbnail from '../../components/features/workspace/workspace/ProjectSceneThumbnail.jsx'
import LoadingDots from '../../components/ui/LoadingDots/LoadingDots.jsx'

function Home({ onCreate, onEdit, onShowAIAssistant, onBrowseTemplates, onSelectTemplate }) {
    const { user } = useAuth();
    const firstName = user?.name ? user.name.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'User');

    const [activeTab, setActiveTab] = useState('templates');
    const [recentProjects, setRecentProjects] = useState([])
    const [recentLoading, setRecentLoading] = useState(false)
    const [recentLoaded, setRecentLoaded] = useState(false)
    const [templateBundles, setTemplateBundles] = useState([])
    const [templatesLoading, setTemplatesLoading] = useState(true)
    const [summaryLoading, setSummaryLoading] = useState(true)
    const [summary, setSummary] = useState({
        projectCount: 0,
        exportCount: 0,
        workspaceCount: 0,
        credits: null,
    })

    useEffect(() => {
        fetchTemplateBundles()
            .then((data) => setTemplateBundles(data))
            .catch((err) => console.warn('[Home] Failed to fetch templates:', err))
            .finally(() => setTemplatesLoading(false))
    }, [])

    useEffect(() => {
        let cancelled = false
        setSummaryLoading(true)

        async function loadSummary() {
            try {
                const workspaces = await workspaceService.listWorkspaces()
                const workspaceIds = workspaces.map((ws) => ws.id || ws._id).filter(Boolean)

                const [projectLists, videosResult, creditsResult] = await Promise.all([
                    Promise.all(
                        workspaceIds.map((id) =>
                            workspaceService.listProjects(id).catch(() => [])
                        )
                    ),
                    videoLibraryService.listUserVideos({ take: 1, skip: 0, status: 'completed' }).catch(() => ({
                        videos: [],
                        pagination: { total: 0 },
                    })),
                    creditsService.getPersonalBalance().catch(() => null),
                ])

                if (cancelled) return

                const projectCount = projectLists.reduce((sum, list) => sum + list.length, 0)
                const exportCount = videosResult.pagination?.total ?? videosResult.videos?.length ?? 0

                setSummary({
                    projectCount,
                    exportCount,
                    workspaceCount: workspaces.length,
                    credits: creditsResult?.personalCredits ?? null,
                })
            } catch (err) {
                console.warn('[Home] Failed to load dashboard summary:', err)
            } finally {
                if (!cancelled) setSummaryLoading(false)
            }
        }

        loadSummary()
        return () => { cancelled = true }
    }, [])

    useEffect(() => {
        if (activeTab !== 'recent' || recentLoaded) return
        let cancelled = false
        setRecentLoading(true)

        async function loadRecentProjects() {
            try {
                const workspaces = await workspaceService.listWorkspaces()
                const projectLists = await Promise.all(
                    workspaces.map(async (ws) => {
                        const workspaceId = ws.id || ws._id
                        const projects = await workspaceService.listProjects(workspaceId).catch(() => [])
                        return (projects || []).map((p) => ({
                            ...p,
                            id: p.id || p._id,
                            workspaceId,
                            workspaceName: ws.name,
                            folderId: p.folderId || p.folder?.id || p.folder?._id || null,
                            title: p.name || p.title,
                            name: p.name || p.title,
                            updatedAt: p.updatedAt || p.lastModifiedAt || p.modifiedAt || p.createdAt,
                        }))
                    })
                )

                if (cancelled) return

                const sorted = projectLists.flat().sort((a, b) => {
                    const da = new Date(a.updatedAt || a.createdAt || 0)
                    const db = new Date(b.updatedAt || b.createdAt || 0)
                    return db - da
                })
                setRecentProjects(sorted.slice(0, 12))
            } catch (err) {
                console.warn('[Home] Failed to fetch recent projects:', err)
            } finally {
                if (!cancelled) {
                    setRecentLoading(false)
                    setRecentLoaded(true)
                }
            }
        }

        loadRecentProjects()
        return () => { cancelled = true }
    }, [activeTab, recentLoaded])

    const stats = useMemo(() => {
        const workspaceLabel = summary.workspaceCount === 1 ? '1 workspace' : `${summary.workspaceCount} workspaces`
        return [
            {
                label: 'Video Projects',
                value: String(summary.projectCount),
                isLoading: summaryLoading,
                subtitle: summaryLoading ? 'Loading…' : `Across ${workspaceLabel}`,
                icon: <MdCollectionsBookmark />,
            },
            {
                label: 'Completed Exports',
                value: String(summary.exportCount),
                isLoading: summaryLoading,
                subtitle: summaryLoading ? 'Loading…' : 'Final MP4 renders',
                icon: <MdVideoLibrary />,
            },
            {
                label: 'Credits Available',
                value: Number(summary.credits).toLocaleString(),
                isLoading: summaryLoading || summary.credits == null,
                subtitle: summaryLoading ? 'Loading…' : 'For exports & AI generation',
                icon: <MdAccountBalanceWallet />,
            },
        ]
    }, [summary, summaryLoading])

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

    const featuredTemplates = templateBundles.slice(0, 6)

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
                <div className="hero-decoration hero-circle-1"></div>
                <div className="hero-decoration hero-circle-2"></div>
                <div className="hero-decoration hero-circle-3"></div>
            </div>

            <div className="home-billing-stats">
                {stats.map((stat) => (
                    <div key={stat.label} className="home-billing-stat-card">
                        <div className="home-billing-stat-top">
                            <span className="home-billing-stat-label">{stat.label}</span>
                            <span className="home-billing-stat-icon">{stat.icon}</span>
                        </div>
                        <div className="home-billing-stat-value" aria-busy={stat.isLoading}>
                            {stat.isLoading ? <LoadingDots size="lg" /> : stat.value}
                        </div>
                        <div className="home-billing-stat-subtitle">{stat.subtitle}</div>
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
                </div>
            </div>

            <div className="tab-content-area">
                {activeTab === 'templates' && (
                    <div className="tab-pane fade-in">
                        <div className="section-header">
                            <h2>Top Templates for You</h2>
                            {onBrowseTemplates && (
                                <button type="button" className="view-all view-all--btn" onClick={onBrowseTemplates}>
                                    Browse all
                                </button>
                            )}
                        </div>

                        {templatesLoading && (
                            <div className="projects-grid-override">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
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

                        {!templatesLoading && featuredTemplates.length === 0 && (
                            <div className="empty-recent">
                                <MdExplore size={48} className="empty-recent-icon" />
                                <h3>No templates available</h3>
                                <p>Check back soon or start from a blank project.</p>
                                <button className="btn-create-hero" style={{ marginTop: '1rem' }} onClick={onCreate}>
                                    <MdAdd size={18} /> Create New Video
                                </button>
                            </div>
                        )}

                        {!templatesLoading && featuredTemplates.length > 0 && (
                            <div className="projects-grid-override">
                                {featuredTemplates.map((bundle) => {
                                    const sceneCount = bundle.scenes?.length || 0
                                    return (
                                        <div
                                            key={bundle.id}
                                            className="project-card home-template-card"
                                            onClick={() => onSelectTemplate?.(bundle)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    onSelectTemplate?.(bundle)
                                                }
                                            }}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="project-thumb-container home-template-thumb">
                                                {bundle.coverScene ? (
                                                    <div className="home-template-preview">
                                                        <TemplateScenePreview template={bundle.coverScene} compact={true} />
                                                    </div>
                                                ) : (
                                                    <div className="project-thumb-placeholder">
                                                        <MdLayers size={36} />
                                                    </div>
                                                )}
                                                <span className="home-template-badge">{bundle.category}</span>
                                                <div className="project-overlay">
                                                    <button
                                                        type="button"
                                                        className="btn-edit-premium"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onSelectTemplate?.(bundle)
                                                        }}
                                                    >
                                                        <MdAutoAwesome size={18} /> Use Template
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="project-content">
                                                <div className="project-info">
                                                    <h3>{bundle.name}</h3>
                                                    <div className="project-meta">
                                                        {sceneCount} scene{sceneCount !== 1 ? 's' : ''} · {bundle.aspectRatio || '16:9'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
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
                                    <div key={`${project.workspaceId}-${project.id}`} className="project-card">
                                        <div className="project-thumb-container home-recent-thumb">
                                            <ProjectSceneThumbnail video={project} />
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
            </div>
        </div>
    )
}

export default Home
