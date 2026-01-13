import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import NewsSection from '../components/company/NewsSection.jsx'
import Resources from './Resources.jsx'
const styles = `
.news-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
}
`

function News({ onLoginClick, onLogoClick, onNavigateToCompany, onNavigateToSolution, onNavigateToEthics, onNavigateToTechnology }) {
  return (
    <>
      <style>{styles}</style>
      <div className="news-page">
        <Navbar 
          onLoginClick={onLoginClick}
          onLogoClick={onLogoClick}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToTechnology={onNavigateToTechnology}
        />
        
        <NewsSection variant="light" />
        
        <Footer onNavigateToCompany={onNavigateToCompany} />
      </div>
    </>
  )
}

export default News

