import React, { useState } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import './Referrals.css';
import referralIllustration from '../../assets/referral_illustration.jpg';

export default function Referrals() {
  const [notified, setNotified] = useState(false);

  return (
    <div className="referrals-page referrals-split-view">
      <div className="referrals-split-left">
        <div className="referrals-content-inner">
          <div className="referrals-badge">
            <Sparkles size={14} /> Coming Soon
          </div>
          
          <h1 className="referrals-title">Invite friends, earn credits.</h1>
          <p className="referrals-subtitle">
            We're putting the finishing touches on our new referral program. 
            Soon, you'll be able to invite your team and friends to earn hundreds of free generation credits!
          </p>

          <div className="referrals-perks">
            <div className="referrals-perk">
              <span className="referrals-perk-icon">🎁</span>
              <span><strong>100 Credits</strong> per friend you invite</span>
            </div>
            <div className="referrals-perk">
              <span className="referrals-perk-icon">⭐</span>
              <span><strong>500 Credit Bonus</strong> when you invite 3 friends</span>
            </div>
          </div>

          <button 
            className={`referrals-notify-btn ${notified ? 'notified' : ''}`}
            onClick={() => setNotified(true)}
            disabled={notified}
          >
            {notified ? 'You are on the list! 🎉' : (
              <>
                <Bell size={18} /> Notify me when it's live
              </>
            )}
          </button>
        </div>
      </div>

      <div className="referrals-split-right">
        <div className="referrals-illustration-wrapper">
          <img src={referralIllustration} alt="Referrals Illustration" className="referrals-illustration" />
        </div>
      </div>
    </div>
  );
}
