import React from 'react'
import '../../../../../pages/page-skeleton/skeleton.css'

/** Shimmer block helper */
export function SaSkeletonBlock({ width = '100%', height = 16, borderRadius = 8, style = {}, className = '' }) {
  return (
    <div
      className={`ps-block ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
    />
  )
}

/** Flat KPI stat-strip skeleton (Usage Reports style) — shared by Usage Reports, Platform Actions, HeyGen Account */
export function AdminStatStripSkeleton({ count = 4 }) {
  return (
    <div className="sa-kpi-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ borderRadius: 16, padding: 18, background: 'color-mix(in srgb, var(--border-color) 50%, var(--bg-card))', minHeight: 108, pointerEvents: 'none' }}>
          <SaSkeletonBlock width="55%" height={12} borderRadius={4} style={{ marginBottom: 14 }} />
          <SaSkeletonBlock width="70%" height={28} borderRadius={6} />
        </div>
      ))}
    </div>
  )
}

/** 4-Column KPI Stats Grid Skeleton (AstryAi style) */
export function AdminKpiGridSkeleton({ count = 4 }) {
  const themeClasses = ['sa-kpi-card--blue', 'sa-kpi-card--amber', 'sa-kpi-card--emerald', 'sa-kpi-card--purple']

  return (
    <div className="sa-kpi-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`sa-kpi-card ${themeClasses[i % themeClasses.length]}`} style={{ pointerEvents: 'none' }}>
          <div className="sa-kpi-header">
            <SaSkeletonBlock width="45%" height={12} borderRadius={4} />
            <SaSkeletonBlock width={34} height={34} borderRadius={10} />
          </div>
          <div className="sa-kpi-body" style={{ marginTop: 8 }}>
            <SaSkeletonBlock width="65%" height={26} borderRadius={6} />
            <SaSkeletonBlock width="38%" height={11} borderRadius={999} style={{ marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Modern Table Rows Skeleton (with avatar, text lines, badges, and action buttons) */
export function AdminTableRowsSkeleton({ rows = 6, variant = 'users' }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} style={{ pointerEvents: 'none' }} aria-hidden="true">
          {/* Col 1: Avatar + Name / ID */}
          <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SaSkeletonBlock width={36} height={36} borderRadius={variant === 'workspaces' ? 10 : '50%'} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
                <SaSkeletonBlock width={`${55 + (i % 3) * 15}%`} height={13} borderRadius={4} />
                <SaSkeletonBlock width={`${35 + (i % 2) * 20}%`} height={10} borderRadius={3} />
              </div>
            </div>
          </td>

          {/* Col 2: Email or Details */}
          <td>
            <SaSkeletonBlock width={`${60 + (i % 4) * 10}%`} height={12} borderRadius={4} />
          </td>

          {/* Col 3: Role / Status Badge */}
          <td>
            <SaSkeletonBlock width={64} height={20} borderRadius={999} />
          </td>

          {/* Col 4: Metric / Balance / Storage */}
          <td style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <SaSkeletonBlock width={52} height={14} borderRadius={4} />
            </div>
          </td>

          {/* Col 5: Action Button */}
          <td style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <SaSkeletonBlock width={58} height={28} borderRadius={8} />
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}

/** Complete Management Page Skeleton (Header + 4 KPIs + Table Card with Toolbar & Pagination) */
export function AdminManagementPageSkeleton({ title = 'Management', kpis = 4, rows = 6, variant = 'users' }) {
  return (
    <div className="sa-panel" style={{ pointerEvents: 'none' }} aria-hidden="true">
      {/* Header */}
      <div className="sa-panel-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SaSkeletonBlock width={180} height={20} borderRadius={5} />
          <SaSkeletonBlock width={320} height={12} borderRadius={4} />
        </div>
      </div>

      {/* KPI Grid */}
      <AdminKpiGridSkeleton count={kpis} />

      {/* Table Card */}
      <div className="sa-table-card">
        {/* Toolbar */}
        <div className="sa-table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SaSkeletonBlock width={90} height={30} borderRadius={7} />
            <SaSkeletonBlock width={80} height={30} borderRadius={7} />
            <SaSkeletonBlock width={95} height={30} borderRadius={7} />
          </div>
          <SaSkeletonBlock width={240} height={36} borderRadius={10} />
        </div>

        {/* Table Viewport */}
        <div className="sa-table-scroll sa-scroll">
          <table className="sa-table-modern">
            <thead>
              <tr>
                <th style={{ width: '35%' }}><SaSkeletonBlock width={50} height={11} borderRadius={3} /></th>
                <th style={{ width: '30%' }}><SaSkeletonBlock width={45} height={11} borderRadius={3} /></th>
                <th style={{ width: '15%' }}><SaSkeletonBlock width={40} height={11} borderRadius={3} /></th>
                <th style={{ width: '12%', textAlign: 'right' }}><div style={{ display: 'flex', justifyContent: 'flex-end' }}><SaSkeletonBlock width={45} height={11} borderRadius={3} /></div></th>
                <th style={{ width: '8%', textAlign: 'right' }}><div style={{ display: 'flex', justifyContent: 'flex-end' }}><SaSkeletonBlock width={35} height={11} borderRadius={3} /></div></th>
              </tr>
            </thead>
            <tbody>
              <AdminTableRowsSkeleton rows={rows} variant={variant} />
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="sa-pagination">
          <SaSkeletonBlock width={140} height={12} borderRadius={4} />
          <div style={{ display: 'flex', gap: 8 }}>
            <SaSkeletonBlock width={70} height={28} borderRadius={8} />
            <SaSkeletonBlock width={70} height={28} borderRadius={8} />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Platform Dashboard Overview Skeleton */
export function AdminOverviewSkeleton() {
  return (
    <div className="sa-panel sa-panel--flow" style={{ pointerEvents: 'none' }} aria-hidden="true">
      {/* Welcome Hero Banner Skeleton */}
      <div className="admin-welcome-banner hero-redesign" style={{ opacity: 0.9 }}>
        <div className="hero-content">
          <div className="hero-text" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SaSkeletonBlock width={240} height={32} borderRadius={8} style={{ background: 'rgba(255, 255, 255, 0.25)' }} />
            <SaSkeletonBlock width="80%" height={16} borderRadius={5} style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
            <div className="hero-chips" style={{ marginTop: 8 }}>
              <SaSkeletonBlock width={130} height={28} borderRadius={999} style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
              <SaSkeletonBlock width={150} height={28} borderRadius={999} style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
            </div>
          </div>

          <div className="admin-hero-cards">
            <div className="admin-hero-glass-card" style={{ minWidth: 240, height: 64 }}>
              <SaSkeletonBlock width={36} height={36} borderRadius={10} style={{ background: 'rgba(255, 255, 255, 0.25)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                <SaSkeletonBlock width="40%" height={10} borderRadius={3} style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
                <SaSkeletonBlock width="70%" height={14} borderRadius={4} style={{ background: 'rgba(255, 255, 255, 0.3)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-container">
        {/* 4 Stats Cards */}
        <div className="admin-stats-grid dash-stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-stat-card dash-stat-card">
              <div className="admin-stat-top">
                <SaSkeletonBlock width={44} height={44} borderRadius={12} />
                <SaSkeletonBlock width={45} height={18} borderRadius={999} />
              </div>
              <div className="admin-stat-info" style={{ marginTop: 12 }}>
                <SaSkeletonBlock width="55%" height={26} borderRadius={6} />
                <SaSkeletonBlock width="70%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="dash-charts-row">
          <section className="admin-card-section dash-chart-card" style={{ minHeight: 300, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <SaSkeletonBlock width={140} height={16} borderRadius={4} />
              <SaSkeletonBlock width={80} height={16} borderRadius={999} />
            </div>
            <SaSkeletonBlock width="100%" height={200} borderRadius={12} />
          </section>

          <section className="admin-card-section dash-gauge-card" style={{ minHeight: 300, padding: 24 }}>
            <SaSkeletonBlock width={120} height={16} borderRadius={4} style={{ marginBottom: 20 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 0' }}>
              <SaSkeletonBlock width={140} height={140} borderRadius="50%" />
              <SaSkeletonBlock width={100} height={14} borderRadius={4} />
            </div>
          </section>
        </div>

        {/* 2-Column Grid: Ranked Features & Actions Feed */}
        <div className="admin-dashboard-grid">
          <section className="admin-card-section" style={{ padding: 20, minHeight: 260 }}>
            <SaSkeletonBlock width={160} height={16} borderRadius={4} style={{ marginBottom: 18 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <SaSkeletonBlock width={90} height={12} borderRadius={3} />
                  <SaSkeletonBlock width="100%" height={16} borderRadius={6} />
                  <SaSkeletonBlock width={60} height={12} borderRadius={3} />
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card-section" style={{ padding: 20, minHeight: 260 }}>
            <SaSkeletonBlock width={140} height={16} borderRadius={4} style={{ marginBottom: 18 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                  <SaSkeletonBlock width={32} height={32} borderRadius={8} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <SaSkeletonBlock width="60%" height={12} borderRadius={3} />
                    <SaSkeletonBlock width="35%" height={10} borderRadius={3} />
                  </div>
                  <SaSkeletonBlock width={45} height={14} borderRadius={4} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

/** Usage Reports Page Skeleton */
export function AdminReportsSkeleton() {
  return (
    <div className="sa-panel" style={{ pointerEvents: 'none' }} aria-hidden="true">
      <div className="sa-panel-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SaSkeletonBlock width={160} height={20} borderRadius={5} />
          <SaSkeletonBlock width={300} height={12} borderRadius={4} />
        </div>
      </div>

      {/* Date filter card */}
      <div className="sa-card">
        <div className="sa-card-body" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <SaSkeletonBlock width={140} height={38} borderRadius={10} />
          <SaSkeletonBlock width={140} height={38} borderRadius={10} />
          <SaSkeletonBlock width={100} height={38} borderRadius={10} />
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="sa-metric-card" style={{ padding: 18 }}>
            <SaSkeletonBlock width="50%" height={12} borderRadius={4} style={{ marginBottom: 10 }} />
            <SaSkeletonBlock width="70%" height={22} borderRadius={6} />
          </div>
        ))}
      </div>

      {/* Feature & User ranking blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, flex: 1 }}>
        <div className="sa-card" style={{ padding: 18 }}>
          <SaSkeletonBlock width={140} height={16} borderRadius={4} style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <SaSkeletonBlock key={i} width="100%" height={26} borderRadius={6} />
            ))}
          </div>
        </div>
        <div className="sa-card" style={{ padding: 18 }}>
          <SaSkeletonBlock width={140} height={16} borderRadius={4} style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <SaSkeletonBlock key={i} width="100%" height={26} borderRadius={6} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Platform Actions Audit Log Skeleton */
export function AdminPlatformActionsSkeleton() {
  return (
    <div className="sa-panel" style={{ pointerEvents: 'none' }} aria-hidden="true">
      <div className="sa-panel-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SaSkeletonBlock width={180} height={20} borderRadius={5} />
          <SaSkeletonBlock width={320} height={12} borderRadius={4} />
        </div>
      </div>

      {/* Filter Form Card */}
      <div className="sa-card">
        <div className="sa-card-body" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <SaSkeletonBlock width={140} height={38} borderRadius={10} />
          <SaSkeletonBlock width={140} height={38} borderRadius={10} />
          <SaSkeletonBlock width={110} height={38} borderRadius={10} />
          <SaSkeletonBlock width={100} height={38} borderRadius={10} />
        </div>
      </div>

      {/* Audit Log Results Table */}
      <div className="sa-card" style={{ flex: 1, overflow: 'hidden' }}>
        <div className="sa-card-header">
          <SaSkeletonBlock width={160} height={16} borderRadius={4} />
        </div>
        <div style={{ padding: '0 16px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 0', borderBottom: '1px solid var(--border-color)' }}>
              <SaSkeletonBlock width={64} height={22} borderRadius={6} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <SaSkeletonBlock width={30} height={30} borderRadius={8} />
                <SaSkeletonBlock width="40%" height={13} borderRadius={4} />
              </div>
              <SaSkeletonBlock width={80} height={14} borderRadius={4} />
              <SaSkeletonBlock width={90} height={12} borderRadius={4} />
              <SaSkeletonBlock width={70} height={12} borderRadius={4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** HeyGen Account Skeleton — mirrors the live page: header → KPI strip → Account details card → Billing & quota card */
export function AdminHeygenSkeleton() {
  return (
    <div className="sa-panel" style={{ pointerEvents: 'none' }} aria-hidden="true">
      <div className="sa-panel-header">
        <div className="sa-panel-header-title-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SaSkeletonBlock width={180} height={20} borderRadius={5} />
          <SaSkeletonBlock width={300} height={12} borderRadius={4} />
        </div>
        <SaSkeletonBlock width={90} height={34} borderRadius={8} />
      </div>

      {/* KPI strip */}
      <AdminStatStripSkeleton count={3} />

      {/* Account details card */}
      <div className="sa-card">
        <div className="sa-card-header">
          <SaSkeletonBlock width={140} height={14} borderRadius={4} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SaSkeletonBlock width={110} height={22} borderRadius={999} />
            <SaSkeletonBlock width={90} height={12} borderRadius={4} />
          </div>
        </div>

        <div className="sa-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Identity row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 18, borderBottom: '1px solid var(--border-color)' }}>
            <SaSkeletonBlock width={52} height={52} borderRadius={14} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SaSkeletonBlock width={160} height={16} borderRadius={4} />
              <SaSkeletonBlock width={200} height={12} borderRadius={3} />
            </div>
          </div>
          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'color-mix(in srgb, var(--text-muted) 4%, var(--bg-card))', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <SaSkeletonBlock width="45%" height={9} borderRadius={3} />
                <SaSkeletonBlock width="70%" height={13} borderRadius={4} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing & quota card */}
      <div className="sa-card">
        <div className="sa-card-header">
          <SaSkeletonBlock width={130} height={14} borderRadius={4} />
        </div>
        <div className="sa-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SaSkeletonBlock width="100%" height={78} borderRadius={14} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <SaSkeletonBlock width="100%" height={72} borderRadius={12} />
            <SaSkeletonBlock width="100%" height={72} borderRadius={12} />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Graphics Library Gallery Skeleton */
export function AdminGraphicsSkeleton() {
  return (
    <div className="sg-portal" style={{ pointerEvents: 'none', padding: 24 }} aria-hidden="true">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SaSkeletonBlock width={180} height={22} borderRadius={5} />
          <SaSkeletonBlock width={300} height={12} borderRadius={4} />
        </div>
        <SaSkeletonBlock width={130} height={38} borderRadius={10} />
      </div>

      {/* Controls toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <SaSkeletonBlock width={260} height={38} borderRadius={10} />
        <SaSkeletonBlock width={180} height={38} borderRadius={10} />
        <SaSkeletonBlock width={140} height={38} borderRadius={10} />
        <SaSkeletonBlock width={140} height={38} borderRadius={10} />
      </div>

      {/* Grid of graphic cards */}
      <div className="sg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="sg-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
            <SaSkeletonBlock width="100%" height={140} borderRadius="14px 14px 0 0" />
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SaSkeletonBlock width="70%" height={14} borderRadius={4} />
              <SaSkeletonBlock width="45%" height={10} borderRadius={3} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
