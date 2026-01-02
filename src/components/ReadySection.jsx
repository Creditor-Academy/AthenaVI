import { MdArrowOutward } from 'react-icons/md'

const styles = `
.ready-section {
  padding: 100px 40px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  color: #ffffff;
  text-align: center;
}

.ready-section-content {
  max-width: 1400px;
  margin: 0 auto;
}

.ready-section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 56px;
  font-weight: 500;
  line-height: 1.1;
  margin: 0 0 24px;
  color: #ffffff;
}

.ready-section-subtitle {
  font-family: 'Arial', sans-serif;
  font-size: 20px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 48px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.ready-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.ready-cta .btn-primary {
  padding: 16px 32px;
  font-size: 16px;
}

.ready-cta .btn-outline {
  padding: 16px 32px;
  font-size: 16px;
}

.btn-outline {
  font-family: 'Arial', sans-serif;
  background: transparent;
  border: 1px solid #fff;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-primary {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  color: #000;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

@media (max-width: 768px) {
  .ready-section {
    padding: 60px 24px;
  }

  .ready-section-title {
    font-size: 40px;
  }

  .ready-section-subtitle {
    font-size: 18px;
  }

  .ready-cta {
    flex-direction: column;
  }

  .ready-cta .btn-primary,
  .ready-cta .btn-outline {
    width: 100%;
    max-width: 300px;
  }
}
`

function ReadySection() {
  return (
    <>
      <style>{styles}</style>
      <section className="ready-section">
        <div className="ready-section-content">
          <h2 className="ready-section-title">
            Ready to Get Started?
          </h2>
          <p className="ready-section-subtitle">
            Join thousands of creators who are already using our platform to create amazing videos
          </p>
          <div className="ready-cta">
            <button className="btn-primary">
              START FREE TRIAL
              <MdArrowOutward />
            </button>
            <button className="btn-outline">
              CONTACT SALES
              <MdArrowOutward />
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

export default ReadySection

