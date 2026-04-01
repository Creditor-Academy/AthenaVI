import Navbar from '../../components/layout/Navbar/Navbar.jsx'
import Footer from '../../components/layout/Footer/Footer.jsx'
import HeroSection from '../../components/features/solutions/solutions/learning-development/HeroSection.jsx'
import LDImpact from '../../components/features/solutions/solutions/learning-development/LDImpact.jsx'
import LDBenefits from '../../components/features/solutions/solutions/learning-development/LDBenefits.jsx'
import LDHowItWorks from '../../components/features/solutions/solutions/learning-development/LDHowItWorks.jsx'
import LDWhyChoose from '../../components/features/solutions/solutions/learning-development/LDWhyChoose.jsx'
import LDFinalCTA from '../../components/features/solutions/solutions/learning-development/LDFinalCTA.jsx'

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
