import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import VideoSection from '../components/VideoSection.jsx'
import ProductsSection from '../components/ProductsSection.jsx'
import ReadySection from '../components/ReadySection.jsx'
import Footer from '../components/Footer.jsx'

const styles = `
.landing-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
  font-family: 'Arial', sans-serif;
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
`

function Landing({ onLoginClick, onNavigateToProduct, onLogoClick, onNavigateToCompany, onNavigateToSolution, onNavigateToEthics }) {
  return (
    <>
      <style>{styles}</style>
      <div className="landing-page">
        <Navbar 
          onLoginClick={onLoginClick} 
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onLogoClick={onLogoClick}
          onNavigateToCompany={onNavigateToCompany}
        />
        <Hero />
        <VideoSection />
        <ProductsSection />
        <ReadySection />
        <Footer onNavigateToCompany={onNavigateToCompany} />
      </div>
    </>
  )
}

export default Landing
