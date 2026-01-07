const styles = `
.cta-section {
  padding: 120px 40px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  color: #ffffff;
}

.cta-content {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
}

.cta-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 48px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 24px 0;
  color: #ffffff;
}

.cta-description {
  font-family: 'Arial', sans-serif;
  font-size: 20px;
  line-height: 1.7;
  margin: 0 0 48px 0;
  color: rgba(255, 255, 255, 0.9);
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-cta {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  color: #000;
  padding: 18px 40px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
  text-decoration: none;
}

.primary-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

.secondary-cta {
  font-family: 'Arial', sans-serif;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 16px 38px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  text-decoration: none;
}

.secondary-cta:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.trust-badges {
  margin-top: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
  opacity: 0.8;
}

.trust-badge {
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 8px;
}

.trust-badge::before {
  content: '✓';
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .cta-section {
    padding: 80px 24px;
  }

  .cta-title {
    font-size: 36px;
  }

  .cta-description {
    font-size: 18px;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .primary-cta,
  .secondary-cta {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }

  .trust-badges {
    flex-direction: column;
    gap: 20px;
  }
}
`

function CTASection() {
  return (
    <>
      <style>{styles}</style>
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Marketing?</h2>
          <p className="cta-description">
            Join thousands of marketers who are already using our AI-powered Marketing Suite 
            to create better campaigns, engage their audience, and drive real results.
          </p>
          <div className="cta-buttons">
            <a href="#" className="primary-cta">
              Start Free Trial
            </a>
            <a href="#" className="secondary-cta">
              Schedule Demo
            </a>
          </div>
          <div className="trust-badges">
            <div className="trust-badge">No credit card required</div>
            <div className="trust-badge">14-day free trial</div>
            <div className="trust-badge">Cancel anytime</div>
          </div>
        </div>
      </section>
    </>
  )
}

export default CTASection

