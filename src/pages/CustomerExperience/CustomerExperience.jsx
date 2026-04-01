import Navbar from '../../components/layout/Navbar/Navbar.jsx'
import Footer from '../../components/layout/Footer/Footer.jsx'
import HeroSection from '../../components/features/solutions/solutions/customer-experience/HeroSection.jsx'
import CoreCapabilities from '../../components/features/solutions/solutions/customer-experience/CoreCapabilities.jsx'
import CXComparison from '../../components/features/solutions/solutions/customer-experience/CXComparison.jsx'
import CXImpact from '../../components/features/solutions/solutions/customer-experience/CXImpact.jsx'
import TestimonialsSection from '../../components/features/solutions/solutions/customer-experience/TestimonialsSection.jsx'
import CXFinalCTA from '../../components/features/solutions/solutions/customer-experience/CXFinalCTA.jsx'

const styles = `
.customer-experience-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
}
`

function CustomerExperience({ onLoginClick, onNavigateToEthics, onLogoClick, onNavigateToProduct, onNavigateToSolution, onNavigateToCompany, onNavigateToUseCases, onNavigateToTechnology }) {
  return (
    <>
      <style>{styles}</style>
      <div className="customer-experience-page">
        <Navbar 
          onLoginClick={onLoginClick} 
          onNavigateToEthics={onNavigateToEthics}
          onLogoClick={onLogoClick}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToUseCases={onNavigateToUseCases}
          onNavigateToTechnology={onNavigateToTechnology}
        />
        
        <HeroSection />
        <CXComparison />
        <CoreCapabilities />
        <CXImpact />
        <TestimonialsSection />
        <CXFinalCTA />
        
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

export default CustomerExperience
