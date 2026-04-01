import Navbar from '../../components/layout/Navbar/Navbar.jsx'
import Footer from '../../components/layout/Footer/Footer.jsx'
import ResourcesSection from '../../components/features/company/ResourcesSection.jsx'

const styles = `
.resources-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
}
`

function Resources({ onLoginClick, onLogoClick, onNavigateToCompany, onNavigateToSolution, onNavigateToEthics, onNavigateToTechnology, onNavigateToProduct, onNavigateToUseCases }) {
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
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToUseCases={onNavigateToUseCases}
        />
        
        <ResourcesSection variant="light" />
        
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

export default Resources

