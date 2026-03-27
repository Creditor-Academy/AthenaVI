import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import HeroSection from '../components/solutions/customer-experience/HeroSection.jsx'
import ProblemSolution from '../components/solutions/customer-experience/ProblemSolution.jsx'
import CoreCapabilities from '../components/solutions/customer-experience/CoreCapabilities.jsx'
import InteractiveAIExperience from '../components/solutions/customer-experience/InteractiveAIExperience.jsx'
import ExperienceFeatures from '../components/solutions/customer-experience/ExperienceFeatures.jsx'
import TestimonialsSection from '../components/solutions/customer-experience/TestimonialsSection.jsx'
import CTASection from '../components/solutions/customer-experience/CTASection.jsx'

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
        <ProblemSolution />
        <CoreCapabilities />
        <InteractiveAIExperience />
        <ExperienceFeatures />
        <TestimonialsSection />
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

export default CustomerExperience
