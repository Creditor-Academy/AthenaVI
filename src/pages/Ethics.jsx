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

  .ethics-text {
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
}
`

function Ethics({ onLoginClick, onLogoClick, onNavigateToSolution, onNavigateToProduct }) {
  return (
    <>
      <style>{styles}</style>
      <div className="ethics-page">
        <Navbar 
          onLoginClick={onLoginClick} 
          onLogoClick={onLogoClick}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToProduct={onNavigateToProduct}
        />
        
        <div className="ethics-content">
          <div className="ethics-header">
            <h1 className="ethics-title">Pledge for the ethical use of synthetic media</h1>
          </div>

          <div className="ethics-section">
            <p className="ethics-text">
              As privacy experts and leaders in the AI synthetic media space, we are well aware of the vast opportunities this sector presents. Synthetic media leverages creativity through the use of generative AI and can also streamline processes to generate significant time and resource savings.
            </p>
            <p className="ethics-text">
              However, as with many modern technologies, it also brings with it risks such as bias, misuse by malicious actors, and the potential to spread disinformation.
            </p>
          </div>

          <div className="ethics-section">
            <h2 className="ethics-section-title">The use of our technology</h2>
            <p className="ethics-text">
              We strive to use our technology for good, and to see this young and exciting industry evolve in a positive direction. We see it as our responsibility to help ensure that synthetic media is used in an ethical way, and to help lead the industry in achieving this.
            </p>
            <p className="ethics-text">
              As the use of this powerful technology grows exponentially, it creates an urgency to establish clear industry guidelines.
            </p>
            <p className="ethics-text">
              To that end, Athena VI has partnered with leading privacy experts and ethicists to establish ethical guidelines and codes-of-conduct for this technology. This is a pledge we are making to bring transparency and fairness to our product and how we and our partners deploy them.
            </p>
          </div>

          <div className="ethics-section">
            <h2 className="ethics-section-title">Our Pledge</h2>
            <p className="ethics-text">
              We have issued a pledge for how we intend to operate our business in an ethical way, and also intend it as a call for others in the industry to adopt it.
            </p>
            <p className="ethics-text">
              This pledge begins, but does not end, our commitment. It represents the start of an ongoing dialogue with our customers, the wider industry and consumers, as well as regulators and lawmakers. We will continue to work to maintain and build on these commitments.
            </p>
            <p className="ethics-text">
              We hope more partners will join us in making this a reality, to seize this opportunity to earn and grow consumer trust in what we all do.
            </p>
          </div>

          <div className="ethics-signature">
            <p className="ethics-date">January, 2024</p>
            <p className="ethics-name">Paulmichael Rowland</p>
            <p className="ethics-role">Founder</p>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  )
}

export default Ethics

