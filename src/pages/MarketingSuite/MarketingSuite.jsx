import Navbar from '../../components/layout/Navbar/Navbar.jsx'
import Footer from '../../components/layout/Footer/Footer.jsx'
import HeroSection from '../../components/features/solutions/solutions/marketing-suite/HeroSection.jsx'
import Heaturemarketing from '../../components/features/solutions/solutions/marketing-suite/Heaturemarketing.jsx'
import CTASection from '../../components/features/solutions/solutions/marketing-suite/CTASection.jsx'
import EngagementSection from '../../components/features/solutions/solutions/marketing-suite/EngagementSection.jsx'

const styles = `
.marketing-suite-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
}
`

function MarketingSuite({ onLoginClick, onNavigateToEthics, onLogoClick, onNavigateToProduct, onNavigateToSolution, onNavigateToCompany, onNavigateToUseCases }) {
  return (
    <>
      <style>{styles}</style>
      <div className="marketing-suite-page">
        <Navbar 
          onLoginClick={onLoginClick} 
          onNavigateToEthics={onNavigateToEthics}
          onLogoClick={onLogoClick}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToUseCases={onNavigateToUseCases}
        />
        
        <HeroSection />
        <Heaturemarketing />
        <EngagementSection />
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

export default MarketingSuite

