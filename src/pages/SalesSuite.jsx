import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import HeroSection from '../components/solutions/sales-suite/HeroSection.jsx'
import ImpactSection from '../components/solutions/sales-suite/ImpactSection.jsx'
import BenefitsSection from '../components/solutions/sales-suite/BenefitsSection.jsx'
import FeaturesSection from '../components/solutions/sales-suite/FeaturesSection.jsx'
import CTASection from '../components/solutions/sales-suite/CTASection.jsx'

const styles = `
.sales-suite-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
}
`

function SalesSuite({ onLoginClick, onLogoClick, onNavigateToSolution, onNavigateToProduct, onNavigateToEthics }) {
  return (
    <>
      <style>{styles}</style>
      <div className="sales-suite-page">
        <Navbar 
          onLoginClick={onLoginClick} 
          onLogoClick={onLogoClick}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToEthics={onNavigateToEthics}
        />
        
        <HeroSection />
        <ImpactSection />
        <FeaturesSection />
        <BenefitsSection />
        <CTASection />
        
        <Footer />
      </div>
    </>
  )
}

export default SalesSuite

