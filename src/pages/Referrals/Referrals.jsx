import React, { useState } from 'react'
import {
  Bell,
  Sparkles,
  Gift,
  Users,
  Coins,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Trophy,
  Zap,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Toast from '../../components/ui/Toast/Toast'
import referralIllustration from '../../assets/referral_illustration.jpg'
import './Referrals.css'

export default function Referrals() {
  const { user } = useAuth()
  const [notified, setNotified] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState(null)

  const referralCode = (user?.name?.toLowerCase().replace(/\s+/g, '') || user?.email?.split('@')[0] || 'creator') + '77'
  const referralLink = `https://athena.ai/join?ref=${referralCode}`

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setToast({ message: 'Referral link copied to clipboard!', type: 'success' })
      setTimeout(() => setCopied(false), 2400)
    } catch {
      setToast({ message: 'Could not copy automatically', type: 'error' })
    }
  }

  const handleNotify = () => {
    setNotified(true)
    setToast({ message: "You're on the early access referral list! We'll notify you when it launches.", type: 'success' })
  }

  return (
    <div className="referrals-page">
      <div className="referrals-shell">
        {/* Standard Athena Page Header */}
        <header className="referrals-page-header">
          <div className="referrals-header-title-row">
            <h1 className="referrals-page-title">Refer & Earn</h1>
            <span className="referrals-badge">
              <Sparkles size={13} className="referrals-badge-icon" />
              <span>Coming Soon</span>
            </span>
          </div>
          <p className="referrals-page-subtitle">
            Invite friends & teams to earn free generation credits.
          </p>
        </header>

        {/* Main Hero Card */}
        <section className="referrals-hero-card">
          <div className="referrals-hero-left">
            <h2 className="referrals-hero-heading">
              Invite friends & teams.<br />
              <span className="referrals-hero-accent">Earn free generation credits.</span>
            </h2>

            <p className="referrals-description">
              Share Athena AI with colleagues, teammates, and creators. When they join and create their first video or presentation, both of you get bonus platform credits.
            </p>

            {/* Share / Copy bar */}
            <div className="referrals-link-box">
              <div className="referrals-link-label">Your personal invite link (preview)</div>
              <div className="referrals-link-field">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  aria-label="Referral link"
                  className="referrals-link-input"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`referrals-copy-btn ${copied ? 'is-copied' : ''}`}
                  title="Copy link"
                >
                  {copied ? (
                    <>
                      <Check size={15} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons & Guarantee */}
            <div className="referrals-actions">
              <button
                type="button"
                className={`referrals-notify-btn ${notified ? 'is-notified' : ''}`}
                onClick={handleNotify}
                disabled={notified}
              >
                {notified ? (
                  <>
                    <Check size={18} />
                    <span>You're on the list!</span>
                  </>
                ) : (
                  <>
                    <Bell size={18} />
                    <span>Notify me when it's live</span>
                  </>
                )}
              </button>

              <span className="referrals-guarantee">
                <ShieldCheck size={16} className="guarantee-icon" />
                <span>Instant credit delivery upon sign up & verification</span>
              </span>
            </div>
          </div>

          {/* Hero Visual Right */}
          <div className="referrals-hero-right">
            <div className="referrals-visual-card">
              <div className="referrals-img-container">
                <img
                  src={referralIllustration}
                  alt="Referral Program Illustration"
                  className="referrals-illustration-img"
                  loading="lazy"
                />
              </div>

              {/* Floating Stat Widget */}
              <div className="referrals-floating-stat">
                <div className="floating-stat-icon">
                  <Coins size={20} />
                </div>
                <div className="floating-stat-text">
                  <span className="floating-stat-value">100 Credits</span>
                  <span className="floating-stat-sub">Per qualified referral</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reward Tiers / How it works Grid */}
        <section className="referrals-grid-section">
          <div className="referrals-section-header">
            <h3 className="referrals-section-title">How Rewards Work</h3>
            <p className="referrals-section-subtitle">Earn unlimited rewards in 3 simple steps</p>
          </div>

          <div className="referrals-steps-grid">
            <div className="referrals-step-card">
              <div className="referrals-step-num">01</div>
              <div className="referrals-step-icon-wrap">
                <Share2 size={22} />
              </div>
              <h4 className="referrals-step-title">Share Your Invite</h4>
              <p className="referrals-step-desc">
                Send your unique link to team members, friends, or across your social channels.
              </p>
            </div>

            <div className="referrals-step-card">
              <div className="referrals-step-num">02</div>
              <div className="referrals-step-icon-wrap">
                <Users size={22} />
              </div>
              <h4 className="referrals-step-title">They Join Athena</h4>
              <p className="referrals-step-desc">
                When they create an account, they immediately receive 50 complimentary welcome credits.
              </p>
            </div>

            <div className="referrals-step-card">
              <div className="referrals-step-num">03</div>
              <div className="referrals-step-icon-wrap referrals-step-icon-wrap--highlight">
                <Gift size={22} />
              </div>
              <h4 className="referrals-step-title">You Both Get Rewarded</h4>
              <p className="referrals-step-desc">
                You receive 100 credits for every active friend. Plus, unlock a 500 credit milestone bonus every 3 invites!
              </p>
            </div>
          </div>
        </section>

        {/* Milestone Perks Row */}
        <section className="referrals-milestones-card">
          <div className="referrals-milestone-item">
            <div className="milestone-icon-pill">
              <Zap size={20} />
            </div>
            <div className="milestone-text">
              <h4>100 Credits</h4>
              <p>Credited for every single friend who signs up</p>
            </div>
          </div>

          <div className="referrals-milestone-divider" />

          <div className="referrals-milestone-item">
            <div className="milestone-icon-pill milestone-icon-pill--gold">
              <Trophy size={20} />
            </div>
            <div className="milestone-text">
              <h4>500 Credit Bonus</h4>
              <p>Special tier bonus unlocked for every 3 referrals</p>
            </div>
          </div>

          <div className="referrals-milestone-divider" />

          <div className="referrals-milestone-item">
            <div className="milestone-icon-pill milestone-icon-pill--purple">
              <Sparkles size={20} />
            </div>
            <div className="milestone-text">
              <h4>No Earning Limits</h4>
              <p>Stack credits with no monthly or total caps</p>
            </div>
          </div>
        </section>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
