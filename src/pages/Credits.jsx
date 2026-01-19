import { useState } from 'react'
import {
  MdAccountBalanceWallet,
  MdHistory,
  MdTrendingUp,
  MdShoppingCart,
  MdCheckCircle,
  MdCancel,
  MdDownload,
  MdRefresh,
  MdArrowBack,
} from 'react-icons/md'

const styles = `
.credits-container {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
  background: #ffffff;
  min-height: calc(100vh - 64px);
}

.credits-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #475569;
}

.back-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateX(-2px);
}

.credits-title {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.credits-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.credit-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  position: relative;
}

.credit-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.credit-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.credit-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 20px;
}

.credit-card-content {
  flex: 1;
}

.credit-card-title {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 12px 0;
}

.credit-card-value {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
  letter-spacing: -0.02em;
}

.credit-card-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.credit-card-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

.trend-up {
  color: #059669;
}

.trend-down {
  color: #dc2626;
}

.credits-sections {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
  margin-bottom: 40px;
}

@media (max-width: 1024px) {
  .credits-sections {
    grid-template-columns: 1fr;
  }
}

.section-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  color: #6b7280;
  font-size: 20px;
}

.usage-list {
  display: grid;
  gap: 16px;
}

.usage-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
  transition: all 0.15s ease;
}

.usage-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.usage-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 18px;
}

.usage-info {
  display: grid;
  gap: 4px;
}

.usage-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.usage-meta {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.usage-credits {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.usage-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
  margin-top: 4px;
}

.status-success {
  background: #ecfdf5;
  color: #047857;
}

.status-failed {
  background: #fef2f2;
  color: #991b1b;
}

.status-pending {
  background: #fffbeb;
  color: #92400e;
}

.purchase-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

.purchase-plans {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.purchase-plan {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.purchase-plan:hover {
  border-color: #3b82f6;
  background: #f9fafb;
}

.purchase-plan.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  border-width: 2px;
}

.purchase-plan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.purchase-plan-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.purchase-plan-price {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.purchase-plan-credits {
  font-size: 13px;
  color: #6b7280;
  margin: 8px 0 0 0;
}

.purchase-plan-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.purchase-btn {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.purchase-btn:hover {
  background: #2563eb;
}

.purchase-btn:active {
  background: #1d4ed8;
}

.purchase-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.stat-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 4px 0;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: #6b7280;
}

.empty-state-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state-text {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: #6b7280;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.refresh-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #111827;
}
`

function Credits({ onBack }) {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [credits, setCredits] = useState(1250)
  const [usageHistory] = useState([
    {
      id: 1,
      name: 'Marketing Campaign Video',
      date: '2024-01-15 14:30',
      credits: 50,
      status: 'success',
    },
    {
      id: 2,
      name: 'Product Demo Video',
      date: '2024-01-14 10:15',
      credits: 75,
      status: 'success',
    },
    {
      id: 3,
      name: 'Training Video Series',
      date: '2024-01-13 16:45',
      credits: 100,
      status: 'success',
    },
    {
      id: 4,
      name: 'Social Media Ad',
      date: '2024-01-12 09:20',
      credits: 25,
      status: 'success',
    },
    {
      id: 5,
      name: 'Corporate Presentation',
      date: '2024-01-11 13:00',
      credits: 150,
      status: 'failed',
    },
    {
      id: 6,
      name: 'Tutorial Video',
      date: '2024-01-10 11:30',
      credits: 60,
      status: 'success',
    },
  ])

  const purchasePlans = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 500,
      price: '$29',
      popular: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      credits: 2000,
      price: '$99',
      popular: true,
    },
    {
      id: 'business',
      name: 'Business',
      credits: 5000,
      price: '$199',
      popular: false,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      credits: 10000,
      price: '$349',
      popular: false,
    },
  ]

  const totalUsed = usageHistory
    .filter((item) => item.status === 'success')
    .reduce((sum, item) => sum + item.credits, 0)

  const totalFailed = usageHistory.filter((item) => item.status === 'failed').length

  const handlePurchase = () => {
    if (!selectedPlan) return
    const plan = purchasePlans.find((p) => p.id === selectedPlan)
    if (plan) {
      setCredits((prev) => prev + plan.credits)
      setSelectedPlan(null)
      alert(`Successfully purchased ${plan.credits} credits!`)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <MdCheckCircle />
      case 'failed':
        return <MdCancel />
      default:
        return <MdRefresh />
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="credits-container">
        <div className="credits-header">
          <button className="back-btn" onClick={onBack}>
            <MdArrowBack size={20} />
          </button>
          <h1 className="credits-title">Credits & Billing</h1>
        </div>

        <div className="credits-overview">
          <div className="credit-card">
            <div className="credit-card-header">
              <div className="credit-card-content">
                <h3 className="credit-card-title">Available Credits</h3>
                <div className="credit-card-value">{credits.toLocaleString()}</div>
                <p className="credit-card-subtitle">Ready to use</p>
              </div>
              <div className="credit-card-icon">
                <MdAccountBalanceWallet />
              </div>
            </div>
            <div className="credit-card-trend trend-up">
              <MdTrendingUp size={14} />
              <span>Active subscription</span>
            </div>
          </div>

          <div className="credit-card">
            <div className="credit-card-header">
              <div className="credit-card-content">
                <h3 className="credit-card-title">Total Used</h3>
                <div className="credit-card-value">{totalUsed.toLocaleString()}</div>
                <p className="credit-card-subtitle">All time</p>
              </div>
              <div className="credit-card-icon" style={{ color: '#059669' }}>
                <MdHistory />
              </div>
            </div>
            <div className="credit-card-trend trend-up">
              <MdTrendingUp size={14} />
              <span>This month: {usageHistory.filter((u) => u.status === 'success').length} videos</span>
            </div>
          </div>

          <div className="credit-card">
            <div className="credit-card-header">
              <div className="credit-card-content">
                <h3 className="credit-card-title">Average Cost</h3>
                <div className="credit-card-value">
                  {usageHistory.filter((u) => u.status === 'success').length > 0
                    ? Math.round(
                        totalUsed / usageHistory.filter((u) => u.status === 'success').length
                      )
                    : 0}
                </div>
                <p className="credit-card-subtitle">Credits per video</p>
              </div>
              <div className="credit-card-icon" style={{ color: '#d97706' }}>
                <MdShoppingCart />
              </div>
            </div>
          </div>
        </div>

        <div className="credits-sections">
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">
                <MdHistory className="section-icon" />
                Usage History
              </h2>
              <button className="refresh-btn">
                <MdRefresh size={16} />
                Refresh
              </button>
            </div>

            {usageHistory.length > 0 ? (
              <div className="usage-list">
                {usageHistory.map((item) => (
                  <div key={item.id} className="usage-item">
                    <div className="usage-icon">
                      <MdDownload />
                    </div>
                    <div className="usage-info">
                      <h4 className="usage-name">{item.name}</h4>
                      <p className="usage-meta">{item.date}</p>
                      <span className={`usage-status status-${item.status}`}>
                        {getStatusIcon(item.status)}
                        {item.status === 'success' ? 'Completed' : item.status === 'failed' ? 'Failed' : 'Pending'}
                      </span>
                    </div>
                    <div className="usage-credits">-{item.credits}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <MdHistory size={48} />
                </div>
                <p className="empty-state-text">No usage history yet</p>
              </div>
            )}
          </div>

          <div className="purchase-section">
            <div className="section-header">
              <h2 className="section-title">
                <MdShoppingCart className="section-icon" />
                Purchase Credits
              </h2>
            </div>

            <div className="purchase-plans">
              {purchasePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`purchase-plan ${selectedPlan === plan.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && <span className="purchase-plan-badge">Popular</span>}
                  <div className="purchase-plan-header">
                    <h3 className="purchase-plan-name">{plan.name}</h3>
                    <div className="purchase-plan-price">{plan.price}</div>
                  </div>
                  <p className="purchase-plan-credits">{plan.credits.toLocaleString()} credits</p>
                </div>
              ))}
            </div>

            <button
              className="purchase-btn"
              onClick={handlePurchase}
              disabled={!selectedPlan}
            >
              <MdShoppingCart />
              Purchase Credits
            </button>

            <div className="stats-grid" style={{ marginTop: '24px' }}>
              <div className="stat-card">
                <div className="stat-value">{usageHistory.length}</div>
                <div className="stat-label">Total Videos</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{totalFailed}</div>
                <div className="stat-label">Failed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {usageHistory.filter((u) => u.status === 'success').length}
                </div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Credits
