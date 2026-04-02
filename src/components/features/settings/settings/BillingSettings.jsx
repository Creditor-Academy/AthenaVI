import React from 'react'
import { MdCheckCircle, MdOutlineBolt, MdTrendingUp, MdReceiptLong } from 'react-icons/md'

const plans = [
  {
    id: 'pro',
    name: 'Pro Studio',
    price: '$39',
    cycle: '/month',
    description: 'For creators shipping content every week',
    active: true,
    features: ['1,500 credits/month', '4K exports', 'Priority rendering']
  },
  {
    id: 'team',
    name: 'Team Growth',
    price: '$99',
    cycle: '/month',
    description: 'For teams managing multi-workspace production',
    active: false,
    features: ['6,000 credits/month', 'Team permissions', 'Review workflows']
  }
]

const invoices = [
  { id: 'INV-1031', date: 'Apr 01, 2026', amount: '$39.00', status: 'Paid' },
  { id: 'INV-0977', date: 'Mar 01, 2026', amount: '$39.00', status: 'Paid' },
  { id: 'INV-0904', date: 'Feb 01, 2026', amount: '$39.00', status: 'Paid' }
]

const BillingSettings = () => {
  return (
    <div className="settings-section">
      <header className="settings-section-header">
        <h3>Billing</h3>
        <p>Manage your plan, usage, and invoices in one place.</p>
      </header>

      <div className="settings-flow">
        <div className="billing-stats-grid">
          <article className="billing-stat">
            <span className="billing-stat-icon"><MdOutlineBolt /></span>
            <div>
              <h4>1,240</h4>
              <p>Credits available</p>
            </div>
          </article>

          <article className="billing-stat">
            <span className="billing-stat-icon"><MdTrendingUp /></span>
            <div>
              <h4>74%</h4>
              <p>Monthly usage</p>
            </div>
          </article>

          <article className="billing-stat">
            <span className="billing-stat-icon"><MdReceiptLong /></span>
            <div>
              <h4>3</h4>
              <p>Recent invoices</p>
            </div>
          </article>
        </div>

        <div className="billing-plan-grid">
          {plans.map((plan) => (
            <article key={plan.id} className={`billing-plan-card ${plan.active ? 'active' : ''}`}>
              <header>
                <h4>{plan.name}</h4>
                <p>{plan.description}</p>
              </header>

              <div className="billing-plan-price">
                <strong>{plan.price}</strong>
                <span>{plan.cycle}</span>
              </div>

              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <MdCheckCircle size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`btn-premium ${plan.active ? 'btn-premium-ghost' : 'btn-premium-primary'}`}>
                {plan.active ? 'Current Plan' : 'Upgrade'}
              </button>
            </article>
          ))}
        </div>

        <div className="billing-invoices">
          <div className="billing-invoices-header">
            <h4>Recent Invoices</h4>
            <button className="btn-premium btn-premium-ghost">Download All</button>
          </div>

          <div className="billing-invoice-list">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="billing-invoice-row">
                <div>
                  <strong>{invoice.id}</strong>
                  <p>{invoice.date}</p>
                </div>
                <div className="billing-invoice-meta">
                  <span>{invoice.amount}</span>
                  <span className="billing-status-paid">{invoice.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingSettings
