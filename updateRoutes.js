const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add import
content = content.replace(
  "import InviteAcceptance from './pages/InviteAcceptance.jsx'",
  "import InviteAcceptance from './pages/InviteAcceptance.jsx'\nimport AIVideos from './pages/AIVideos.jsx'"
);

// 2. Add to pathToViewMap
content = content.replace(
  "'/customer-experience': 'customer-experience',",
  "'/customer-experience': 'customer-experience',\n      '/ai-videos': 'ai-videos',"
);
content = content.replace(
  "'/customer-experience': 'customer-experience',",
  "'/customer-experience': 'customer-experience',\n        '/ai-videos': 'ai-videos',"
); 

// 3. Add to urlMap
content = content.replace(
  "'customer-experience': '/customer-experience',",
  "'customer-experience': '/customer-experience',\n      'ai-videos': '/ai-videos',"
);

// 4. Update onNavigateToSolution blocks
const oldBlock = "} else if (solution === 'Learning & Development') {\n                setView('learning-development')\n              }";
const newBlock = "} else if (solution === 'Learning & Development') {\n                setView('learning-development')\n              } else if (solution === 'AI Videos') {\n                setView('ai-videos')\n              }";
content = content.split(oldBlock).join(newBlock);

// 5. Add view rendering
const renderBlock = `
      {view === 'ai-videos' && (
        <>
          <AIVideos 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={(section) => {
              setProductSection(section)
              setView('products')
            }}
            onNavigateToSolution={(solution) => {
              if (solution === 'Marketing Suite') {
                setView('marketing-suite')
              } else if (solution === 'Sales Solutions') {
                setView('sales-suite')
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
              } else if (solution === 'Learning & Development') {
                setView('learning-development')
              } else if (solution === 'AI Videos') {
                setView('ai-videos')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}
`;

content = content.replace("{view === 'settings' && (", renderBlock + "\n      {view === 'settings' && (");

fs.writeFileSync('src/App.jsx', content);
console.log('Done modifying App.jsx');
