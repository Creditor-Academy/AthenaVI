import Navbar from '../../components/layout/Navbar/Navbar.jsx'
import Footer from '../../components/layout/Footer/Footer.jsx'
import HeroSection from '../../components/features/solutions/solutions/sales-suite/HeroSection.jsx'
import ImpactSection from '../../components/features/solutions/solutions/sales-suite/ImpactSection.jsx'
import BenefitsSection from '../../components/features/solutions/solutions/sales-suite/BenefitsSection.jsx'
import FeaturesSection from '../../components/features/solutions/solutions/sales-suite/FeaturesSection.jsx'
import CTASection from '../../components/features/solutions/solutions/sales-suite/CTASection.jsx'

const styles = `
.sales-suite-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
}
`

function SalesSuite({ onLoginClick, onLogoClick, onNavigateToSolution, onNavigateToProduct, onNavigateToEthics, onNavigateToCompany, onNavigateToUseCases }) {
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
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToUseCases={onNavigateToUseCases}
        />
        
        <HeroSection />
        <ImpactSection />
        <FeaturesSection />
        <BenefitsSection />
        <CTASection />
        
        <Footer 
          onLogoClick={onLogoClick}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToUseCases={onNavigateToUseCases}
        />
      </div>
    </>
  )
}

export default SalesSuite

