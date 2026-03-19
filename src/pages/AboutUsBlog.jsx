import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import AboutUsSection from '../components/company/AboutUsSection.jsx'
import BlogSection from '../components/company/BlogSection.jsx'

const styles = `
.about-blog-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
}
`

function AboutUsBlog({ onLoginClick, onLogoClick, onNavigateToCompany, onNavigateToSolution, onNavigateToEthics, onNavigateToTechnology, onNavigateToProduct, onNavigateToUseCases }) {
  return (
    <>
      <style>{styles}</style>
      <div className="about-blog-page">
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
        
        <AboutUsSection variant="light" />
        <BlogSection variant="dark" />
        
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

export default AboutUsBlog

