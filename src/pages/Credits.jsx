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
  padding: 40px 48px;
  max-width: 1600px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: calc(100vh - 64px);
}

.credits-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #475569;
}

.back-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.credits-title {
  font-size: 28px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.credits-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

@media (max-width: 1024px) {
  .credits-overview {
    grid-template-columns: 1fr;
  }
}

.credit-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px;
  transition: all 0.2s ease;
}

.credit-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.credit-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.credit-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 22px;
  flex-shrink: 0;
}

.credit-card-content {
  flex: 1;
  margin-right: 16px;
}

.credit-card-title {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 12px 0;
}

.credit-card-value {
  font-size: 36px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.credit-card-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.credit-card-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.trend-up {
  color: #059669;
}

.trend-down {
  color: #dc2626;
}

.credits-sections {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 32px;
  margin-bottom: 40px;
}

@media (max-width: 1200px) {
  .credits-sections {
    grid-template-columns: 1fr;
  }
}

.section-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  color: #64748b;
  font-size: 20px;
}

.usage-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.usage-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

@media (max-width: 768px) {
  .credits-container {
    padding: 24px 20px;
  }
  
  .credits-title {
    font-size: 24px;
  }
  
  .credit-card {
    padding: 24px;
  }
  
  .credit-card-value {
    font-size: 28px;
  }
  
  .section-header {
    padding: 20px 24px;
  }
  
  .usage-table th,
  .usage-table td {
    padding: 12px 16px;
  }
  
  .purchase-plans {
    padding: 20px 24px;
  }
  
  .purchase-btn-wrapper {
    padding: 0 24px 24px 24px;
  }
  
  .stats-section {
    padding: 20px 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.usage-table thead {
  background: #f8fafc;
}

.usage-table th {
  padding: 14px 32px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f1f5f9;
}

.usage-table td {
  padding: 18px 32px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #0f172a;
}

.usage-table tbody tr {
  transition: background 0.15s ease;
}

.usage-table tbody tr:hover {
  background: #f8fafc;
}

.usage-table tbody tr:last-child td {
  border-bottom: none;
}

.usage-name-cell {
  font-weight: 500;
  color: #0f172a;
}

.usage-date-cell {
  color: #64748b;
  font-size: 13px;
}

.usage-credits-cell {
  font-weight: 600;
  color: #0f172a;
  text-align: right;
}

.usage-status-cell {
  text-align: center;
}

.usage-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
}

.status-success {
  background: #f0fdf4;
  color: #166534;
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
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
}

.purchase-plans {
  padding: 24px 32px;
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}

.purchase-plan {
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.purchase-plan:hover {
  border-color: #94a3b8;
  background: #f8fafc;
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
  margin-bottom: 8px;
}

.purchase-plan-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.purchase-plan-price {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.purchase-plan-credits {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.purchase-plan-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.purchase-btn-wrapper {
  padding: 0 32px 32px 32px;
}

.purchase-btn {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 10px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
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

.stats-section {
  padding: 24px 32px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  text-align: center;
  padding: 16px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 64px 32px;
  color: #64748b;
}

.empty-state-icon {
  font-size: 48px;
  color: #cbd5e1;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state-text {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: #64748b;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
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

  const formatDate = (dateString) => {
    // Parse format: "2024-01-15 14:30"
    const [datePart, timePart] = dateString.split(' ')
    const [year, month, day] = datePart.split('-')
    const [hour, minute] = timePart.split(':')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ', ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
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
              <div className="credit-card-icon">
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
              <div className="credit-card-icon">
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
              <div className="usage-table-wrapper">
                <table className="usage-table">
                  <thead>
                    <tr>
                      <th>Video Name</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageHistory.map((item) => (
                      <tr key={item.id}>
                        <td className="usage-name-cell">{item.name}</td>
                        <td className="usage-date-cell">{formatDate(item.date)}</td>
                        <td className="usage-status-cell">
                          <span className={`usage-status status-${item.status}`}>
                            {getStatusIcon(item.status)}
                            {item.status === 'success' ? 'Completed' : item.status === 'failed' ? 'Failed' : 'Pending'}
                          </span>
                        </td>
                        <td className="usage-credits-cell">-{item.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

            <div className="purchase-btn-wrapper">
              <button
                className="purchase-btn"
                onClick={handlePurchase}
                disabled={!selectedPlan}
              >
                <MdShoppingCart />
                Purchase Credits
              </button>
            </div>

            <div className="stats-section">
              <div className="stats-grid">
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
      </div>
    </>
  )
}

export default Credits
