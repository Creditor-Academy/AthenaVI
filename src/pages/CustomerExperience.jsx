import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import HeroSection from '../components/solutions/customer-experience/HeroSection.jsx'
import CoreCapabilities from '../components/solutions/customer-experience/CoreCapabilities.jsx'
import CXComparison from '../components/solutions/customer-experience/CXComparison.jsx'
import CXImpact from '../components/solutions/customer-experience/CXImpact.jsx'
import TestimonialsSection from '../components/solutions/customer-experience/TestimonialsSection.jsx'
import CXFinalCTA from '../components/solutions/customer-experience/CXFinalCTA.jsx'

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
