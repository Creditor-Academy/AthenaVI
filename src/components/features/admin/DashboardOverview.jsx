import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdPeople, MdAdminPanelSettings, MdVideoLibrary, MdAttachMoney, MdVpnKey,
  MdPersonAdd, MdCheckCircle, MdCancel, MdWarning, MdInfo, MdPayment,
  MdUpgrade, MdStorage, MdCloud, MdFilterList, MdClearAll, MdCircle
} from 'react-icons/md';

/* ── Event type config ────────────────────────────────────────────── */
const EVENT_TYPES = {
  user:    { label: 'User',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: MdPersonAdd },
  render:  { label: 'Render',  color: '#a855f7', bg: 'rgba(168,85,247,0.12)', icon: MdVideoLibrary },
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
  { id: mkId(), category: 'user',    status: 'success', msg: 'New user registered — alex@example.com',              time: new Date(Date.now() - 1*60000) },
  { id: mkId(), category: 'render',  status: 'success', msg: 'Render job #R-8821 completed in 4.3 s',               time: new Date(Date.now() - 2*60000) },
  { id: mkId(), category: 'payment', status: 'success', msg: 'Payment of $99.00 received from Harvey Specter',      time: new Date(Date.now() - 4*60000) },
  { id: mkId(), category: 'render',  status: 'error',   msg: 'Render job #R-8820 failed — GPU OOM on node-03',      time: new Date(Date.now() - 7*60000) },
  { id: mkId(), category: 'api',     status: 'error',   msg: 'API timeout in US-EAST-1 — TTS endpoint unreachable', time: new Date(Date.now() - 15*60000) },
  { id: mkId(), category: 'plan',    status: 'info',    msg: 'User sarah@tech.com upgraded: Plus → Pro Plus',       time: new Date(Date.now() - 18*60000) },
  { id: mkId(), category: 'system',  status: 'success', msg: 'System backup completed successfully',                time: new Date(Date.now() - 22*60000) },
  { id: mkId(), category: 'user',    status: 'warning', msg: 'Login rate-limit triggered for IP 192.168.1.4',       time: new Date(Date.now() - 30*60000) },
  { id: mkId(), category: 'render',  status: 'success', msg: 'Render job #R-8817 completed in 6.1 s',               time: new Date(Date.now() - 35*60000) },
  { id: mkId(), category: 'payment', status: 'error',   msg: 'Payment failed for mike@gmail.com — card declined',   time: new Date(Date.now() - 42*60000) },
  { id: mkId(), category: 'system',  status: 'info',    msg: 'Beta rendering engine updated to v2.4.1',             time: new Date(Date.now() - 60*60000) },
  { id: mkId(), category: 'api',     status: 'warning', msg: 'STT endpoint latency spike — 1.8 s avg response',     time: new Date(Date.now() - 75*60000) },
  { id: mkId(), category: 'user',    status: 'success', msg: 'New user registered — nina@studio.io',                time: new Date(Date.now() - 90*60000) },
  { id: mkId(), category: 'plan',    status: 'info',    msg: 'User mike@gmail.com downgraded: Plus → Free',         time: new Date(Date.now() - 100*60000) },
  { id: mkId(), category: 'render',  status: 'error',   msg: 'Render job #R-8810 failed — invalid source format',   time: new Date(Date.now() - 110*60000) },
];

/* ── New-event payloads for the live simulator ─────────────────────── */
const LIVE_POOL = [
  { category: 'user',    status: 'success', msg: () => `New user registered — user${Math.floor(Math.random()*9999)}@mail.com` },
  { category: 'render',  status: 'success', msg: () => `Render job #R-${8900 + Math.floor(Math.random()*100)} completed in ${(2 + Math.random()*8).toFixed(1)} s` },
  { category: 'render',  status: 'error',   msg: () => `Render job #R-${8900 + Math.floor(Math.random()*100)} failed — queue timeout` },
  { category: 'payment', status: 'success', msg: () => `Payment of $${[29,99][Math.round(Math.random())].toFixed(2)} received` },
  { category: 'payment', status: 'error',   msg: () => 'Payment declined — insufficient funds' },
  { category: 'api',     status: 'error',   msg: () => 'API timeout — LLM endpoint US-WEST-2' },
  { category: 'api',     status: 'warning', msg: () => `High latency detected — ${(1+Math.random()*2).toFixed(1)} s` },
  { category: 'system',  status: 'success', msg: () => 'Auto-scaling triggered — +2 GPU nodes added' },
  { category: 'plan',    status: 'info',    msg: () => 'User upgraded: Free → Plus' },
  { category: 'user',    status: 'warning', msg: () => 'Suspicious login attempt blocked' },
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
    { label: 'Total Users',     value: '124,592', trend: '+12.5%', icon: <MdPeople />,       colorClass: 'blue-bg' },
    { label: 'Active Subs',     value: '42,105',  trend: '+8.2%',  icon: <MdVpnKey />,        colorClass: 'purple-bg' },
    { label: 'Videos Rendered', value: '1.2M',    trend: '+24.1%', icon: <MdVideoLibrary />,  colorClass: 'orange-bg' },
    { label: 'Total Revenue',   value: '$2.4M',   trend: '+32.4%', icon: <MdAttachMoney />,   colorClass: 'green-bg' },
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
    <>
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
              <h2 style={{ margin: 0 }}>System Logs</h2>
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
    </>
  );
};

export default DashboardOverview;
