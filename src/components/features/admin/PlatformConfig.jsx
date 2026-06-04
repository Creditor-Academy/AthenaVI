import React, { useState } from 'react';
import {
  MdTune, MdEdit, MdCheck, MdClose, MdArrowUpward, MdArrowDownward,
  MdCreditCard, MdCheckCircle, MdCancel, MdHourglassTop, MdWarning,
  MdRefresh, MdAdd, MdRemove, MdStar, MdBolt
} from 'react-icons/md';

const PLAN_COLORS = {
  Free:       { accent: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)' },
  Plus:       { accent: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.22)' },
  'Pro Plus': { accent: '#a855f7', bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.22)' },
};

const PAYMENT_STATUSES = [
  { id: 'success',    label: 'Payment Successful',  color: '#10b981', bg: 'rgba(16,185,129,0.1)',   icon: MdCheckCircle,   desc: 'Charge processed and confirmed by Stripe gateway.' },
  { id: 'pending',    label: 'Payment Pending',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   icon: MdHourglassTop,  desc: 'Awaiting confirmation from payment provider.' },
  { id: 'failed',     label: 'Payment Failed',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    icon: MdCancel,        desc: 'Card declined or insufficient funds detected.' },
  { id: 'refunded',   label: 'Refund Issued',       color: '#6366f1', bg: 'rgba(99,102,241,0.1)',   icon: MdRefresh,       desc: 'Charge reversed and refund dispatched to customer.' },
  { id: 'disputed',   label: 'Dispute / Chargeback',color: '#f97316', bg: 'rgba(249,115,22,0.1)',   icon: MdWarning,       desc: 'Customer has raised a dispute with their bank.' },
];

const DEFAULT_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingCycle: 'month',
    credits: 1000,
    renderPriority: 'Low',
    maxWorkspaces: 1,
    maxMembers: 1,
    features: ['1 workspace', '1,000 credits/mo', 'Standard renders', 'Community support'],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 29,
    billingCycle: 'month',
    credits: 5000,
    renderPriority: 'Standard',
    maxWorkspaces: 3,
    maxMembers: 5,
    features: ['3 workspaces', '5,000 credits/mo', 'Priority renders', 'Email support', 'Advanced analytics'],
  },
  {
    id: 'pro_plus',
    name: 'Pro Plus',
    price: 99,
    billingCycle: 'month',
    credits: 20000,
    renderPriority: 'High',
    maxWorkspaces: 10,
    maxMembers: 25,
    features: ['10 workspaces', '20,000 credits/mo', 'Dedicated GPU queue', 'SLA support', 'Custom integrations', 'Audit logs'],
  },
];

const MOCK_SUBSCRIBERS = [
  { id: 'USR-001', name: 'Alex Johnson',  email: 'alex@example.com',  currentPlan: 'Plus',     status: 'Active',    nextBilling: '2026-06-01', amount: '$29.00' },
  { id: 'USR-002', name: 'Sarah Chen',    email: 'sarah@tech.com',    currentPlan: 'Pro Plus',  status: 'Active',    nextBilling: '2026-06-05', amount: '$99.00' },
  { id: 'USR-003', name: 'Michael Smith', email: 'mike@gmail.com',    currentPlan: 'Free',      status: 'Active',    nextBilling: '—',          amount: '$0.00' },
  { id: 'USR-004', name: 'Elena Gilbert', email: 'elena@mystic.com',  currentPlan: 'Plus',      status: 'Cancelled', nextBilling: '2026-06-10', amount: '$29.00' },
  { id: 'USR-005', name: 'Harvey Specter',email: 'harvey@pearson.com',currentPlan: 'Pro Plus',  status: 'Active',    nextBilling: '2026-06-12', amount: '$99.00' },
];

/* ------------------------------------------------------------------ */
/* Editable Plan Card                                                   */
/* ------------------------------------------------------------------ */
const PlanCard = ({ plan, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({ ...plan });
  const [saved, setSaved]     = useState(false);
  const colors = PLAN_COLORS[plan.name] || PLAN_COLORS['Free'];

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDiscard = () => {
    setDraft({ ...plan });
    setEditing(false);
  };

  const field = (label, key, type = 'text') => (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
        {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={draft[key]}
          onChange={e => setDraft(d => ({ ...d, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          style={{
            width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '0.9rem',
            border: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box',
          }}
        />
      ) : (
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
          {key === 'price' ? `$${draft[key]}/mo` : draft[key].toLocaleString?.() ?? draft[key]}
        </span>
      )}
    </div>
  );

  return (
    <div style={{
      border: `2px solid ${editing ? colors.accent : colors.border}`,
      borderRadius: '20px', padding: '24px', background: colors.bg,
      transition: 'all 0.2s ease', position: 'relative',
      boxShadow: editing ? `0 0 0 3px ${colors.accent}22` : 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            {plan.name === 'Pro Plus' && <MdStar style={{ color: colors.accent }} />}
            {plan.name === 'Plus' && <MdBolt style={{ color: colors.accent }} />}
            <span style={{ fontWeight: 800, fontSize: '1rem', color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{plan.name}</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            ${editing ? draft.price : plan.price}<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {editing ? (
            <>
              <button onClick={handleSave} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: colors.accent, color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MdCheck size={16} /> Save
              </button>
              <button onClick={handleDiscard} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MdClose size={16} />
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.05)', color: colors.accent, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}>
              <MdEdit size={15} /> Edit
            </button>
          )}
        </div>
      </div>

      {saved && (
        <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
          ✓ Saved
        </div>
      )}

      <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
        {field('Monthly Price ($)', 'price', 'number')}
        {field('Credits / Month', 'credits', 'number')}
        {field('Render Priority', 'renderPriority')}
        {field('Max Workspaces', 'maxWorkspaces', 'number')}
        {field('Max Members', 'maxMembers', 'number')}
      </div>

      <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '14px', marginTop: '4px' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Features</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '6px' }}>
          {draft.features.map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <MdCheckCircle size={14} style={{ color: colors.accent, flexShrink: 0 }} />
              {editing ? (
                <input
                  value={f}
                  onChange={e => {
                    const features = [...draft.features];
                    features[i] = e.target.value;
                    setDraft(d => ({ ...d, features }));
                  }}
                  style={{ flex: 1, border: 'none', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '3px 8px', color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none' }}
                />
              ) : f}
              {editing && (
                <button onClick={() => setDraft(d => ({ ...d, features: d.features.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, display: 'flex' }}>
                  <MdRemove size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
        {editing && (
          <button onClick={() => setDraft(d => ({ ...d, features: [...d.features, 'New feature'] }))}
            style={{ marginTop: '10px', padding: '5px 12px', borderRadius: '8px', border: `1px dashed ${colors.border}`, background: 'transparent', color: colors.accent, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MdAdd size={14} /> Add feature
          </button>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Component                                                       */
/* ------------------------------------------------------------------ */
const PlatformConfig = () => {
  const [plans, setPlans]               = useState(DEFAULT_PLANS);
  const [subscribers, setSubscribers]   = useState(MOCK_SUBSCRIBERS);
  const [activePayStatus, setActivePayStatus] = useState('success');
  const [upgradeModal, setUpgradeModal] = useState(null); // { user, direction }
  const [targetPlan, setTargetPlan]     = useState('');
  const [payTestUser, setPayTestUser]   = useState(MOCK_SUBSCRIBERS[0].id);
  const [payTestAmount, setPayTestAmount] = useState('29.00');
  const [payTestResult, setPayTestResult] = useState(null);

  const handleSavePlan = (updated) => {
    setPlans(ps => ps.map(p => p.id === updated.id ? updated : p));
  };

  const handlePlanChange = (userId, newPlan) => {
    setSubscribers(ss => ss.map(s => s.id === userId ? { ...s, currentPlan: newPlan } : s));
    setUpgradeModal(null);
  };

  const runPaymentTest = () => {
    const user = subscribers.find(s => s.id === payTestUser);
    setPayTestResult({ status: activePayStatus, user: user?.name, amount: `$${payTestAmount}`, ts: new Date().toLocaleTimeString() });
  };

  const planNames = plans.map(p => p.name);
  const activeStatus = PAYMENT_STATUSES.find(s => s.id === activePayStatus);

  return (
    <section className="admin-card-section" style={{ marginTop: '24px' }}>

      {/* ── Section 1: Plan Editor ─────────────────────────────── */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px' }}>Subscription Plans</h2>
            <p className="admin-placeholder-text">Edit pricing, credit allocations, features, and limits for each plan tier.</p>
          </div>
          <span style={{ fontSize: '0.82rem', padding: '5px 12px', borderRadius: '20px', background: 'rgba(16,185,129,0.12)', color: '#10b981', fontWeight: 600 }}>
            ✓ Changes save per-card
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} onSave={handleSavePlan} />
          ))}
        </div>
      </div>

      {/* ── Section 2: Upgrade / Downgrade Controls ─────────────── */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '32px', marginBottom: '40px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 4px' }}>Subscription Management</h2>
          <p className="admin-placeholder-text">View active subscribers and manually upgrade or downgrade their plan tier.</p>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subscriber</th>
                <th>Current Plan</th>
                <th>Next Billing</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(user => {
                const planIdx = planNames.indexOf(user.currentPlan);
                const canUpgrade   = planIdx < planNames.length - 1;
                const canDowngrade = planIdx > 0;
                const planColor = PLAN_COLORS[user.currentPlan] || PLAN_COLORS['Free'];
                return (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </td>
                    <td>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, background: planColor.bg, color: planColor.accent, border: `1px solid ${planColor.border}` }}>
                        {user.currentPlan}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{user.nextBilling}</td>
                    <td style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user.amount}</td>
                    <td>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                        background: user.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: user.status === 'Active' ? '#10b981' : '#ef4444' }}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          disabled={!canUpgrade}
                          onClick={() => { setUpgradeModal({ user, direction: 'upgrade' }); setTargetPlan(planNames[planIdx + 1]); }}
                          title="Upgrade plan"
                          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)', background: canUpgrade ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)', color: canUpgrade ? '#10b981' : 'var(--text-muted)', cursor: canUpgrade ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 600 }}>
                          <MdArrowUpward size={14} /> Upgrade
                        </button>
                        <button
                          disabled={!canDowngrade}
                          onClick={() => { setUpgradeModal({ user, direction: 'downgrade' }); setTargetPlan(planNames[planIdx - 1]); }}
                          title="Downgrade plan"
                          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: canDowngrade ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)', color: canDowngrade ? '#ef4444' : 'var(--text-muted)', cursor: canDowngrade ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 600 }}>
                          <MdArrowDownward size={14} /> Downgrade
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Upgrade/Downgrade Modal ─────────────────────────────── */}
      {upgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setUpgradeModal(null)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '32px', width: '420px', border: '1px solid var(--border-color)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 6px', textTransform: 'capitalize' }}>{upgradeModal.direction} Plan</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 24px' }}>
              Changing <strong style={{ color: 'var(--text-main)' }}>{upgradeModal.user.name}</strong> from{' '}
              <strong style={{ color: 'var(--text-main)' }}>{upgradeModal.user.currentPlan}</strong> to:
            </p>
            <select
              value={targetPlan}
              onChange={e => setTargetPlan(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '24px', outline: 'none' }}>
              {planNames.filter(p => p !== upgradeModal.user.currentPlan).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setUpgradeModal(null)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={() => handlePlanChange(upgradeModal.user.id, targetPlan)}
                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: upgradeModal.direction === 'upgrade' ? '#10b981' : '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                Confirm {upgradeModal.direction}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PlatformConfig;
