import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdAdminPanelSettings, MdVideoLibrary, MdAttachMoney,
  MdPersonAdd, MdCheckCircle, MdCancel, MdWarning, MdInfo, MdPayment,
  MdUpgrade, MdStorage, MdCloud, MdFilterList, MdClearAll, MdCircle,
  MdRecordVoiceOver, MdFace,
} from 'react-icons/md';
import '../../../pages/AdminPortal/AdminPortal.css';

/* ── Event type config ────────────────────────────────────────────── */
const EVENT_TYPES = {
  user:    { label: 'User',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: MdPersonAdd },
  avatar:  { label: 'Avatar',  color: '#ec4899', bg: 'rgba(236,72,153,0.12)', icon: MdFace },
  render:  { label: 'Render',  color: '#a855f7', bg: 'rgba(168,85,247,0.12)', icon: MdVideoLibrary },
  voice:   { label: 'Voice',   color: '#14b8a6', bg: 'rgba(20,184,166,0.12)', icon: MdRecordVoiceOver },
  payment: { label: 'Payment', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: MdPayment },
  api:     { label: 'API',     color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: MdCloud },
  system:  { label: 'System',  color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: MdStorage },
  plan:    { label: 'Plan',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: MdUpgrade },
};

const STATUS_META = {
  success: { color: '#10b981', icon: MdCheckCircle },
  error:   { color: '#ef4444', icon: MdCancel },
  warning: { color: '#f59e0b', icon: MdWarning },
  info:    { color: '#3b82f6', icon: MdInfo },
};

/* ── Seed logs ────────────────────────────────────────────────────── */
let _idCounter = 100;
const mkId = () => ++_idCounter;

const SEED_LOGS = [
  { id: mkId(), category: 'avatar',  status: 'success', msg: 'Avatar lip-sync clip completed — Scene 2, 1080p MP4',              time: new Date(Date.now() - 1*60000) },
  { id: mkId(), category: 'render',  status: 'success', msg: 'Presenter video queued — script + voice attached',                 time: new Date(Date.now() - 2*60000) },
  { id: mkId(), category: 'voice',   status: 'success', msg: 'Voice preview generated for onboarding module script',               time: new Date(Date.now() - 4*60000) },
  { id: mkId(), category: 'avatar',  status: 'error',   msg: 'Avatar generation failed — script exceeds scene duration limit',   time: new Date(Date.now() - 7*60000) },
  { id: mkId(), category: 'render',  status: 'success', msg: 'Transparent WebM avatar export finished — alpha channel ready',    time: new Date(Date.now() - 11*60000) },
  { id: mkId(), category: 'user',    status: 'success', msg: 'New presenter avatar look created — Digital Twin',                   time: new Date(Date.now() - 15*60000) },
  { id: mkId(), category: 'avatar',  status: 'info',    msg: 'Scene clip re-render requested after script edit',                   time: new Date(Date.now() - 18*60000) },
  { id: mkId(), category: 'render',  status: 'success', msg: 'Multi-scene project export completed — 6 avatar clips',              time: new Date(Date.now() - 22*60000) },
  { id: mkId(), category: 'voice',   status: 'warning', msg: 'Voice clone still processing — scene generation on hold',            time: new Date(Date.now() - 30*60000) },
  { id: mkId(), category: 'avatar',  status: 'success', msg: 'Studio avatar selected for compliance training video',               time: new Date(Date.now() - 35*60000) },
  { id: mkId(), category: 'api',     status: 'warning', msg: 'Generation queue latency elevated — avg wait 42 s',                  time: new Date(Date.now() - 42*60000) },
  { id: mkId(), category: 'render',  status: 'error',   msg: 'Final MP4 render blocked — avatar clip not ready in Scene 4',        time: new Date(Date.now() - 55*60000) },
  { id: mkId(), category: 'payment', status: 'success', msg: 'Generation credits purchased — workspace Pro Plus',                time: new Date(Date.now() - 60*60000) },
  { id: mkId(), category: 'avatar',  status: 'success', msg: 'Photo avatar look approved — added to workspace library',            time: new Date(Date.now() - 75*60000) },
  { id: mkId(), category: 'voice',   status: 'success', msg: 'Narration voice synced with presenter for Scene 1',                  time: new Date(Date.now() - 90*60000) },
  { id: mkId(), category: 'system',  status: 'info',    msg: 'Avatar video storage footprint recalculated for 12 workspaces',      time: new Date(Date.now() - 100*60000) },
];

/* ── New-event payloads for the live simulator ─────────────────────── */
const LIVE_POOL = [
  { category: 'avatar',  status: 'success', msg: () => `Avatar clip ready — Scene ${1 + Math.floor(Math.random() * 8)}, ${['720p', '1080p'][Math.round(Math.random())]}` },
  { category: 'render',  status: 'success', msg: () => `Presenter video generated in ${(12 + Math.random() * 48).toFixed(0)} s` },
  { category: 'render',  status: 'error',   msg: () => 'Avatar generation failed — presenter voice unavailable' },
  { category: 'voice',   status: 'success', msg: () => 'Speech preview created for updated scene script' },
  { category: 'voice',   status: 'warning', msg: () => 'Voice clone pending — avatar render deferred' },
  { category: 'avatar',  status: 'info',    msg: () => 'Transparent WebM export requested for overlay scene' },
  { category: 'user',    status: 'success', msg: () => 'New avatar look added to workspace library' },
  { category: 'payment', status: 'success', msg: () => `Generation credits applied — ${[50, 100, 250][Math.floor(Math.random() * 3)]} units` },
  { category: 'api',     status: 'warning', msg: () => `Avatar API latency spike — ${(1 + Math.random() * 3).toFixed(1)} s avg` },
  { category: 'render',  status: 'success', msg: () => 'Lip-sync export started — waiting for scene clips' },
];

/* ── Relative time helper ─────────────────────────────────────────── */
const relTime = (date) => {
  const s = Math.round((Date.now() - date) / 1000);
  if (s < 60)  return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60)  return `${m} min${m > 1 ? 's' : ''} ago`;
  const h = Math.round(m / 60);
  if (h < 24)  return `${h} hr${h > 1 ? 's' : ''} ago`;
  return `${Math.round(h/24)} day${Math.round(h/24) > 1 ? 's' : ''} ago`;
};

/* ================================================================== */
const DashboardOverview = () => {
  const stats = [
    { label: 'Avatar Videos Generated', value: '18.4K', trend: '+22.4%', icon: <MdVideoLibrary />, colorClass: 'purple-bg' },
    { label: 'Active Presenters',       value: '1,842', trend: '+9.1%',  icon: <MdFace />,         colorClass: 'orange-bg' },
    { label: 'Scene Clips Rendered',    value: '64.2K', trend: '+18.6%', icon: <MdRecordVoiceOver />, colorClass: 'blue-bg' },
    { label: 'Generation Credits Used', value: '412K',  trend: '+14.2%', icon: <MdAttachMoney />,  colorClass: 'green-bg' },
  ];

  const [logs, setLogs]           = useState(SEED_LOGS);
  const [filter, setFilter]       = useState('all');   // 'all' | category key
  const [statusFilter, setStatus] = useState('all');   // 'all' | status key
  const [live, setLive]           = useState(true);
  const [, tick]                  = useState(0);       // forces re-render for relTime
  const timerRef                  = useRef(null);

  /* Tick every 30 s to refresh relative timestamps */
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  /* Live feed — push a random event every ~8 s when enabled */
  useEffect(() => {
    if (!live) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      const tpl = LIVE_POOL[Math.floor(Math.random() * LIVE_POOL.length)];
      const newLog = { id: mkId(), category: tpl.category, status: tpl.status, msg: tpl.msg(), time: new Date() };
      setLogs(prev => [newLog, ...prev].slice(0, 60));
    }, 8000);
    return () => clearInterval(timerRef.current);
  }, [live]);

  const filtered = logs.filter(l => {
    const catOk    = filter === 'all'       || l.category === filter;
    const statusOk = statusFilter === 'all' || l.status   === statusFilter;
    return catOk && statusOk;
  });



  return (
    <div className="sa-panel sa-scroll" style={{ overflowY: 'auto' }}>
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">Platform dashboard</h2>
          <p className="sa-panel-desc">
            Overview of avatar video creation activity — presenters, scene clips, voice sync, and exports across the platform.
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="admin-stats-grid">
        {stats.map((stat, i) => (
          <motion.div key={i} whileHover={{ y: -4 }} className="admin-stat-card">
            <div className="admin-stat-top">
              <div className={`admin-stat-icon ${stat.colorClass}`}>{stat.icon}</div>
              <span className="admin-stat-trend trend-pos">{stat.trend}</span>
            </div>
            <div className="admin-stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── System Logs ── */}
      <div style={{ marginTop: '24px' }}>
        <section className="admin-card-section">

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MdAdminPanelSettings size={20} />
              <h2 style={{ margin: 0 }}>Avatar video activity</h2>
              {live && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
                  <MdCircle size={8} style={{ animation: 'pulse 1.5s infinite' }} /> LIVE
                </span>
              )}
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '3px 10px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                {filtered.length} events
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setLive(l => !l)}
                style={{ padding: '5px 13px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${live ? '#10b981' : 'var(--border-color)'}`, background: live ? 'rgba(16,185,129,0.1)' : 'transparent', color: live ? '#10b981' : 'var(--text-muted)', transition: 'all 0.18s' }}>
                {live ? '⏸ Pause' : '▶ Resume'}
              </button>
              <button onClick={() => { setFilter('all'); setStatus('all'); }}
                style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '0.78rem', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MdClearAll size={15} /> Clear filters
              </button>
            </div>
          </div>

          {/* Category filter chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '2px' }}>
              <MdFilterList size={14} /> Category
            </span>
            <button
              className={`log-filter-chip ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {Object.entries(EVENT_TYPES).map(([key, t]) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  className={`log-filter-chip ${active ? 'active' : ''}`}
                  style={active ? { '--active-color': t.color, '--active-bg': `${t.color}20` } : {}}
                  onClick={() => setFilter(active ? 'all' : key)}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Status filter chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '2px' }}>
              <MdFilterList size={14} /> Status
            </span>
            {['all', 'success', 'error', 'warning', 'info'].map(s => {
              const active = statusFilter === s;
              const color = STATUS_META[s]?.color;
              return (
                <button
                  key={s}
                  className={`log-filter-chip ${active ? 'active' : ''}`}
                  style={active && color ? { '--active-color': color, '--active-bg': `${color}20` } : {}}
                  onClick={() => setStatus(active ? 'all' : s)}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Log feed */}
          <div className="logs-feed" style={{ maxHeight: '380px', overflowY: 'auto', display: 'grid', gap: '4px' }}>
            <AnimatePresence initial={false}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No events match the selected filters.
                </div>
              ) : filtered.map(log => {
                const cat    = EVENT_TYPES[log.category] || EVENT_TYPES.system;
                const status = STATUS_META[log.status]   || STATUS_META.info;
                const CatIcon    = cat.icon;
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="log-item"
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  >
                    {/* Status bar */}
                    <div style={{ width: '3px', borderRadius: '4px', alignSelf: 'stretch', background: status.color, flexShrink: 0, minHeight: '36px' }} />

                    {/* Category badge */}
                    <div style={{ padding: '6px', borderRadius: '8px', background: cat.bg, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      <CatIcon size={16} style={{ color: cat.color }} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, background: cat.bg, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                          {cat.label}
                        </span>
                        <StatusIcon size={13} style={{ color: status.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: status.color, textTransform: 'uppercase', flexShrink: 0 }}>
                          {log.status}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.4, wordBreak: 'break-word' }}>
                        {log.msg}
                      </p>
                    </div>

                    {/* Time */}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0, paddingTop: '2px', fontFamily: 'monospace' }}>
                      {relTime(log.time)}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Pulse animation keyframe injected inline */}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
};

export default DashboardOverview;
