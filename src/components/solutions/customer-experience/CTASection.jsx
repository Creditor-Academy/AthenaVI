import { MdArrowOutward } from 'react-icons/md'

const styles = `
.cx-cta {
  padding: 100px 40px;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  text-align: center;
}

.cx-cta-container {
  max-width: 800px;
  margin: 0 auto;
}

.cx-cta-title {
  font-family: 'Georgia', serif;
  font-size: 48px;
  margin-bottom: 24px;
}

.cx-cta-desc {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  line-height: 1.6;
}

.cx-cta-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-primary-white {
  background: white;
  color: #1e3a8a;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-primary-white:hover {
  transform: translateY(-2px);
  background: #f8fafc;
}

.btn-outline-white {
  border: 1px solid white;
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-outline-white:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .cx-cta-title {
    font-size: 36px;
  }
  .cx-cta-actions {
    flex-direction: column;
  }
}
`

function CTASection() {
  return (
    <section className="cx-cta">
      <style>{styles}</style>
      <div className="cx-cta-container">
        <h2 className="cx-cta-title">Ready to transform your CX?</h2>
        <p className="cx-cta-desc">
          Join hundreds of innovative companies using AthenaVI to create world-class customer experiences.
        </p>
        <div className="cx-cta-actions">
          <a href="#" className="btn-primary-white">
            Get Started Now
            <MdArrowOutward />
          </a>
          <a href="#" className="btn-outline-white">
            Speak to Sales
          </a>
        </div>
      </div>
    </section>
  )
}

export default CTASection
