import React from 'react'
import { Search, ShoppingBag, Bell, Menu, X, PanelLeft } from 'lucide-react'
import ProfileDropdown from '../../ui/ProfileDropdown/ProfileDropdown.jsx'

function DashboardTopbar({
    sidebarMobileOpen,
    setSidebarMobileOpen,
    topbarMobileOpen,
    setTopbarMobileOpen,
    onCreate,
    notificationCount = 9,
    cartCount = 2,
    goToSection,
    onNotificationClick,
    onCartClick
}) {
    return (
        <header className="topbar topbar--main">
            <div className="topbar-grid topbar-grid--main">
                <div className="topbar-main-lead">
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

                <div className="topbar-search-wrap">
                    <label className="topbar-search" htmlFor="dashboard-top-search">
                        <span className="visually-hidden">Search</span>
                        <Search className="topbar-search-icon" size={18} strokeWidth={1.75} aria-hidden />
                        <input
                            id="dashboard-top-search"
                            className="topbar-search-input"
                            type="search"
                            placeholder="Search..."
                            autoComplete="off"
                        />
                    </label>
                </div>

                <div className="topbar-right">
                    <button
                        type="button"
                        className="topbar-create-btn"
                        onClick={() => onCreate && onCreate()}
                    >
                        Create
                    </button>

                    <div className="topbar-icon-group topbar-icon-group--desktop">
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
                    <ProfileDropdown compact onProfileClick={() => goToSection('profile')} />

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
                            placeholder="Search..."
                            autoComplete="off"
                        />
                    </label>
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
