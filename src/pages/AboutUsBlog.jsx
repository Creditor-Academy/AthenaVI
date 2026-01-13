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

function AboutUsBlog({ onLoginClick, onLogoClick, onNavigateToCompany }) {
  return (
    <>
      <style>{styles}</style>
      <div className="about-blog-page">
        <Navbar 
          onLoginClick={onLoginClick}
          onLogoClick={onLogoClick}
          onNavigateToCompany={onNavigateToCompany}
        />
        
        <AboutUsSection variant="light" />
        <BlogSection variant="dark" />
        
        <Footer onNavigateToCompany={onNavigateToCompany} />
      </div>
    </>
  )
}

export default AboutUsBlog

