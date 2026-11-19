import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { installAuthFetch } from './utils/authRefresh.js'
import { installNewVersionReload } from './utils/lazyWithReload.js'
import { installDownloadTracking, rememberSignupSource } from './utils/analytics.js'

// API calls renew an expired access token and retry instead of failing with "Token expired".
installAuthFetch()
// After a deploy, a page opened earlier reloads once to pick up the new files instead of going blank.
installNewVersionReload()
// Analytics (Google Tag Manager): file downloads, and whether this visit came in on /early-access.
installDownloadTracking()
rememberSignupSource()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
