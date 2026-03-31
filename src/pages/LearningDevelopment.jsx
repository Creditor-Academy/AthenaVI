import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import HeroSection from '../components/solutions/learning-development/HeroSection.jsx'
import LDImpact from '../components/solutions/learning-development/LDImpact.jsx'
import LDBenefits from '../components/solutions/learning-development/LDBenefits.jsx'
import LDHowItWorks from '../components/solutions/learning-development/LDHowItWorks.jsx'
import LDWhyChoose from '../components/solutions/learning-development/LDWhyChoose.jsx'
import LDFinalCTA from '../components/solutions/learning-development/LDFinalCTA.jsx'

const styles = `
.ld-page {
  min-height: 100vh;
  background: #ffffff;
}
`

function LearningDevelopment({ onLoginClick, onNavigateToEthics, onLogoClick, onNavigateToProduct, onNavigateToSolution, onNavigateToCompany, onNavigateToUseCases, onNavigateToTechnology }) {
  return (
    <>
      <style>{styles}</style>
      <div className="ld-page">
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
        <LDBenefits />
        <LDHowItWorks />
        <LDWhyChoose />
        <LDImpact />
        <LDFinalCTA />
        
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

export default LearningDevelopment
