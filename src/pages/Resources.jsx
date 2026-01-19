import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import ResourcesSection from '../components/company/ResourcesSection.jsx'

const styles = `
.resources-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
}
`

function Resources({ onLoginClick, onLogoClick, onNavigateToCompany, onNavigateToSolution, onNavigateToEthics, onNavigateToTechnology }) {
  return (
    <>
      <style>{styles}</style>
      <div className="resources-page">
        <Navbar 
          onLoginClick={onLoginClick}
          onLogoClick={onLogoClick}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToTechnology={onNavigateToTechnology}
        />
        
        <ResourcesSection variant="light" />
        
        <Footer onNavigateToCompany={onNavigateToCompany} />
      </div>
    </>
  )
}

export default Resources

