import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import HeroSection from '../components/solutions/marketing-suite/HeroSection.jsx'
import Heaturemarketing from '../components/solutions/marketing-suite/Heaturemarketing.jsx'
import CTASection from '../components/solutions/marketing-suite/CTASection.jsx'
import EngagementSection from '../components/solutions/marketing-suite/EngagementSection.jsx'

const styles = `
.marketing-suite-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
}
`

function MarketingSuite({ onLoginClick, onNavigateToEthics, onLogoClick, onNavigateToProduct, onNavigateToSolution, onNavigateToCompany }) {
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
        />
      </div>
    </>
  )
}

export default MarketingSuite

