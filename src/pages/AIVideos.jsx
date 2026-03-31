import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import ProductVideo from '../assets/ProductVideo.mp4'

const styles = `
.ai-videos-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  font-family: 'Inter', sans-serif;
}

.ai-videos-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
}

.ai-videos-wrapper {
  width: 100%;
  max-width: 1200px;
  aspect-ratio: 16/9;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(0,0,0,0.05);
  border: 8px solid #ffffff;
  position: relative;
  background: #000;
}

.ai-videos-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
`

function AIVideos({
  onLoginClick,
  onNavigateToProduct,
  onLogoClick,
  onNavigateToCompany,
  onNavigateToSolution,
  onNavigateToEthics,
  onNavigateToTechnology,
  onNavigateToUseCases
}) {
  return (
    <>
      <style>{styles}</style>
      <div className="ai-videos-page">
        <Navbar
          onLoginClick={onLoginClick}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToTechnology={onNavigateToTechnology}
          onLogoClick={onLogoClick}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToUseCases={onNavigateToUseCases}
        />
        
        <main className="ai-videos-content">
          <div className="ai-videos-wrapper">
            <video 
              className="ai-videos-player"
              src={ProductVideo}
              autoPlay
              controls
              playsInline
            />
          </div>
        </main>

        <Footer
          onLogoClick={onLogoClick}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToUseCases={onNavigateToUseCases}
        />
      </div>
    </>
  )
}

export default AIVideos
