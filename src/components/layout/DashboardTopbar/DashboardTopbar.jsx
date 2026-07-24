import React, { useRef, useEffect } from 'react'
import { Search, ShoppingBag, Bell, Menu, X, PanelLeft } from 'lucide-react'
import ProfileDropdown from '../../ui/ProfileDropdown/ProfileDropdown.jsx'
import DashboardSearchPanel from '../DashboardSearch/DashboardSearchPanel.jsx'
import '../DashboardSearch/DashboardSearchPanel.css'

function DashboardTopbar({
    sidebarMobileOpen,
    setSidebarMobileOpen,
    topbarMobileOpen,
    setTopbarMobileOpen,
    onCreate,
    notificationCount = 0,
    cartCount = 2,
    goToSection,
    onNotificationClick,
    onCartClick,
    isAdminPortal = false,
    searchQuery = '',
    onSearchQueryChange,
    searchInputRef,
    searchIsOpen = false,
    onSearchFocus,
    onSearchClose,
    onSearchSelect,
    searchIsIndexing = false,
    searchIndexError = null,
    searchResultsByCategory = {},
    searchFlatResults = [],
    searchCategoryLabels = {},
    searchActiveIndex = 0,
    onSearchActiveIndexChange,
    onSearchMoveActive,
    searchPlaceholder = 'Search dashboard...',
    className = '',
}) {
    const wrapRef = useRef(null)

    useEffect(() => {
        if (!searchIsOpen) return undefined
        const handlePointerDown = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                onSearchClose?.()
            }
        }
        document.addEventListener('mousedown', handlePointerDown)
        return () => document.removeEventListener('mousedown', handlePointerDown)
    }, [searchIsOpen, onSearchClose])

    /* ── Ctrl+K / Cmd+K Global Shortcut to Focus Search ────────────────────── */
    useEffect(() => {
        const handleGlobalShortcut = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                if (searchInputRef?.current) {
                    searchInputRef.current.focus()
                    onSearchFocus?.()
                }
            }
        }
        window.addEventListener('keydown', handleGlobalShortcut)
        return () => window.removeEventListener('keydown', handleGlobalShortcut)
    }, [searchInputRef, onSearchFocus])

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            onSearchClose?.()
            return
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            onSearchMoveActive?.(1)
            return
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            onSearchMoveActive?.(-1)
            return
        }
        if (e.key === 'Enter') {
            e.preventDefault()
            const result = searchFlatResults[searchActiveIndex]
            if (result) onSearchSelect?.(result)
        }
    }

    const searchPanelProps = {
        query: searchQuery,
        isOpen: searchIsOpen,
        isIndexing: searchIsIndexing,
        indexError: searchIndexError,
        resultsByCategory: searchResultsByCategory,
        flatResults: searchFlatResults,
        categoryLabels: searchCategoryLabels,
        activeIndex: searchActiveIndex,
        onSelect: onSearchSelect,
        onHover: onSearchActiveIndexChange,
        showSuggestions: !searchQuery.trim(),
    }

    const headerClass = ['topbar', 'topbar--main', className].filter(Boolean).join(' ')

    return (
        <header className={headerClass}>
            <div className="topbar-grid topbar-grid--main">
                <div className="topbar-main-lead">
                    <button
                        type="button"
                        className="topbar-brand-btn"
                        onClick={() => goToSection?.('home')}
                        aria-label={className.includes('slides') ? 'Slides Home' : 'Virtual Studio Home'}
                        title={className.includes('slides') ? 'Slides' : 'Virtual Studio'}
                    >
                        <span className="topbar-brand-logo" aria-hidden>
                            {className.includes('slides') ? 'S' : 'V'}
                        </span>
                        <span className="topbar-brand-name">
                            {className.includes('slides') ? 'Slides' : 'Virtual Studio'}
                        </span>
                    </button>

                    <button
                        type="button"
                        className="topbar-sidebar-toggle"
                        onClick={() => setSidebarMobileOpen((o) => !o)}
                        aria-expanded={sidebarMobileOpen}
                        aria-label="Open navigation menu"
                    >
                        <PanelLeft size={20} strokeWidth={1.75} aria-hidden />
                    </button>
                </div>

                <div className="topbar-search-wrap" ref={wrapRef}>
                    <label className="topbar-search" htmlFor="dashboard-top-search">
                        <span className="visually-hidden">Search</span>
                        <Search className="topbar-search-icon" size={18} strokeWidth={1.75} aria-hidden />
                        <input
                            ref={searchInputRef}
                            id="dashboard-top-search"
                            className="topbar-search-input"
                            type="search"
                            placeholder={searchPlaceholder}
                            autoComplete="off"
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange?.(e.target.value)}
                            onFocus={onSearchFocus}
                            onKeyDown={handleSearchKeyDown}
                            role="combobox"
                            aria-expanded={searchIsOpen}
                            aria-controls="dashboard-search-results"
                            aria-autocomplete="list"
                        />
                        <span className="topbar-search-kbd" aria-hidden>
                            Ctrl K
                        </span>
                    </label>
                    <div id="dashboard-search-results">
                        <DashboardSearchPanel {...searchPanelProps} />
                    </div>
                </div>

                <div className="topbar-right">
                    <ProfileDropdown 
                        onProfileClick={() => goToSection('profile')} 
                        onNotificationClick={onNotificationClick}
                        notificationCount={notificationCount}
                    />

                    <button
                        type="button"
                        className={`topbar-mobile-toggle ${topbarMobileOpen ? 'topbar-mobile-toggle--open' : ''}`}
                        onClick={() => setTopbarMobileOpen((o) => !o)}
                        aria-expanded={topbarMobileOpen}
                        aria-controls="dashboard-topbar-mobile-panel"
                        aria-label={topbarMobileOpen ? 'Close menu' : 'Open menu'}
                    >
                        {topbarMobileOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
                    </button>
                </div>
            </div>

            {topbarMobileOpen && (
                <div id="dashboard-topbar-mobile-panel" className="topbar-mobile-panel">
                    <label className="topbar-search topbar-search--mobile" htmlFor="dashboard-top-search-mobile">
                        <Search className="topbar-search-icon" size={18} strokeWidth={1.75} aria-hidden />
                        <input
                            id="dashboard-top-search-mobile"
                            className="topbar-search-input"
                            type="search"
                            placeholder={searchPlaceholder}
                            autoComplete="off"
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange?.(e.target.value)}
                            onFocus={onSearchFocus}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </label>
                    <div className="dash-search-panel dash-search-panel--mobile">
                        {searchIsOpen && <DashboardSearchPanel {...searchPanelProps} />}
                    </div>
                    <div className="topbar-mobile-icons">
                        <button 
                            type="button" 
                            className="topbar-icon-btn" 
                            aria-label="Notifications"
                            onClick={onNotificationClick}
                        >
                            <span className="topbar-icon-badge-wrap">
                                <Bell size={18} strokeWidth={1.75} aria-hidden />
                                {notificationCount > 0 && (
                                    <span className="topbar-badge">{notificationCount > 9 ? '9+' : notificationCount}</span>
                                )}
                            </span>
                        </button>
                        <button 
                            type="button" 
                            className="topbar-icon-btn" 
                            aria-label={`Cart, ${cartCount} items`}
                            onClick={onCartClick}
                        >
                            <ShoppingBag size={18} strokeWidth={1.75} aria-hidden />
                        </button>
                    </div>
                </div>
            )}
        </header>
    )
}

export default DashboardTopbar
