import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const styles = `
.ethics-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
  font-family: 'Arial', sans-serif;
}

.ethics-content {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 100px 40px;
}

.ethics-header {
  margin-bottom: 60px;
}

.ethics-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 48px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 24px 0;
  color: #1e40af;
  letter-spacing: -0.5px;
}

.ethics-section {
  margin-bottom: 48px;
}

.ethics-section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 28px;
  font-weight: 500;
  margin: 0 0 20px 0;
  color: #1e293b;
  line-height: 1.3;
}

.ethics-text {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.8;
  margin: 0 0 20px 0;
  color: #64748b;
  font-weight: 400;
}

.ethics-list {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.8;
  margin: 0 0 20px 0;
  color: #64748b;
  font-weight: 400;
  padding-left: 24px;
}

.ethics-list-item {
  margin-bottom: 12px;
  position: relative;
}

.ethics-list-item::marker {
  color: #1e40af;
}

.ethics-signature {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #e2e8f0;
}

.ethics-date {
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px 0;
}

.ethics-name {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 500;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.ethics-role {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

@media (max-width: 768px) {
  .ethics-content {
    padding: 60px 24px;
  }

  .ethics-title {
    font-size: 36px;
  }

  .ethics-section-title {
    font-size: 24px;
  }

  .ethics-text,
  .ethics-list {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .ethics-content {
    padding: 60px 20px;
  }

  .ethics-title {
    font-size: 32px;
  }

  .ethics-section-title {
    font-size: 22px;
  }

  .ethics-list {
    padding-left: 20px;
  }
}
`

function Ethics({ onLoginClick, onLogoClick, onNavigateToSolution, onNavigateToProduct, onNavigateToEthics }) {
  return (
    <>
      <style>{styles}</style>
      <div className="ethics-page">
        <Navbar 
          onLoginClick={onLoginClick} 
          onLogoClick={onLogoClick}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToEthics={onNavigateToEthics}
        />
        
        <div className="ethics-content">
          <div className="ethics-header">
            <h1 className="ethics-title">Athena VI Ethical Pledge for the Use of Synthetic Media</h1>
          </div>

          <div className="ethics-section">
            <p className="ethics-text">
              At Athena Virtual Instructor, we believe synthetic media represents one of the most powerful technological advancements of our generation. Through generative AI, we can unlock creativity, increase access to knowledge, and dramatically improve how people learn, communicate, and build businesses.
            </p>
            <p className="ethics-text">
              However, we also recognize that with this power comes responsibility. Synthetic media must be developed and deployed with care. Without ethical guardrails, these technologies can introduce risks — including bias, privacy violations, misinformation, and misuse by bad actors.
            </p>
            <p className="ethics-text">
              This pledge defines how Athena VI commits to leading this industry with integrity, accountability, and transparency.
            </p>
          </div>

          <div className="ethics-section">
            <h2 className="ethics-section-title">Our Responsibility</h2>
            <p className="ethics-text">
              We believe synthetic media should empower people — not deceive, exploit, or manipulate them.
            </p>
            <p className="ethics-text">
              As a company operating at the frontier of AI-powered communication and education, Athena VI accepts its responsibility to protect individuals, safeguard data, and ensure our technology is used to create real value for society.
            </p>
            <p className="ethics-text">
              We are committed not only to what we build, but to how it is used.
            </p>
          </div>

          <div className="ethics-section">
            <h2 className="ethics-section-title">Our Commitment</h2>
            <p className="ethics-text">
              Athena VI has partnered with privacy experts, AI ethicists, and industry advisors to establish clear ethical guidelines governing the creation, distribution, and use of synthetic media on our platform.
            </p>
            <p className="ethics-text">
              These standards guide every product we release, every partnership we form, and every deployment of our technology.
            </p>
            <p className="ethics-text">
              We pledge to operate with:
            </p>
            <ul className="ethics-list">
              <li className="ethics-list-item">
                <strong>Transparency</strong> — Users will always know when content is AI-generated.
              </li>
              <li className="ethics-list-item">
                <strong>Consent</strong> — No voice, likeness, or identity will be used without explicit permission.
              </li>
              <li className="ethics-list-item">
                <strong>Privacy</strong> — Personal data will be protected and never exploited.
              </li>
              <li className="ethics-list-item">
                <strong>Fairness</strong> — We actively work to minimize bias and harmful outputs.
              </li>
              <li className="ethics-list-item">
                <strong>Accountability</strong> — We take responsibility for how our tools are used.
              </li>
            </ul>
          </div>

          <div className="ethics-section">
            <h2 className="ethics-section-title">How We Will Lead</h2>
            <p className="ethics-text">
              Athena VI commits to:
            </p>
            <ul className="ethics-list">
              <li className="ethics-list-item">
                Preventing the use of our technology for impersonation, fraud, deception, or harm.
              </li>
              <li className="ethics-list-item">
                Requiring proper authorization for the use of any real person's image, voice, or identity.
              </li>
              <li className="ethics-list-item">
                Maintaining strong safeguards to prevent abuse, deepfake misuse, and disinformation.
              </li>
              <li className="ethics-list-item">
                Providing clear labeling and disclosure when content is AI-generated.
              </li>
              <li className="ethics-list-item">
                Continuously auditing and improving our systems for safety, fairness, and compliance.
              </li>
              <li className="ethics-list-item">
                Cooperating with regulators, researchers, and industry partners to uphold public trust.
              </li>
            </ul>
          </div>

          <div className="ethics-section">
            <h2 className="ethics-section-title">An Ongoing Promise</h2>
            <p className="ethics-text">
              This pledge is not a one-time statement — it is a living commitment.
            </p>
            <p className="ethics-text">
              We will continue to engage with our customers, industry leaders, policymakers, and the public to ensure our technology evolves responsibly as the world changes.
            </p>
            <p className="ethics-text">
              We invite our partners and the broader AI community to join us in building a future where synthetic media is trusted, ethical, and beneficial for everyone.
            </p>
          </div>

          <div className="ethics-signature">
            <p className="ethics-date">January 2024</p>
            <p className="ethics-name">Paulmichael Rowland</p>
            <p className="ethics-role">Founder, Athena Virtual Instructor</p>
          </div>
        </div>
        
        <Footer 
          onLogoClick={onLogoClick}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
        />
      </div>
    </>
  )
}

export default Ethics
