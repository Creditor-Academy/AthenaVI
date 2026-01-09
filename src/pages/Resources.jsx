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

function Resources({ onLoginClick, onLogoClick, onNavigateToCompany }) {
  return (
    <>
      <style>{styles}</style>
      <div className="resources-page">
        <Navbar 
          onLoginClick={onLoginClick}
          onLogoClick={onLogoClick}
          onNavigateToCompany={onNavigateToCompany}
        />
        
        <ResourcesSection variant="light" />
        
        <Footer />
      </div>
    </>
  )
}

export default Resources

