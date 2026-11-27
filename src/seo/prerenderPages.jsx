import { createElement } from 'react'
import Landing from '../pages/Landing/Landing.jsx'
import Products from '../pages/Products/Products.jsx'
import MarketingSuite from '../pages/MarketingSuite/MarketingSuite.jsx'
import SalesSuite from '../pages/SalesSuite/SalesSuite.jsx'
import CustomerExperience from '../pages/CustomerExperience/CustomerExperience.jsx'
import LearningDevelopment from '../pages/LearningDevelopment/LearningDevelopment.jsx'
import UseCases from '../pages/UseCases/UseCases.jsx'
import AIVideos from '../pages/AIVideos/AIVideos.jsx'
import AIAvatarsVideos from '../pages/AIAvatarsVideos/AIAvatarsVideos.jsx'
import Ethics from '../pages/Ethics/Ethics.jsx'
import HelpCenter from '../pages/HelpCenter/HelpCenter.jsx'
import PrivacyPolicy from '../pages/PrivacyPolicy/PrivacyPolicy.jsx'
import { INDEXABLE_PATHS } from './seoRoutes.js'

const PAGES = {
  '/': Landing,
  '/products': Products,
  '/marketing-suite': MarketingSuite,
  '/sales-suite': SalesSuite,
  '/customer-experience': CustomerExperience,
  '/learning-development': LearningDevelopment,
  '/use-cases': UseCases,
  '/ai-videos': AIVideos,
  '/ai-avatars-videos': AIAvatarsVideos,
  '/ethics': Ethics,
  '/help': HelpCenter,
  '/privacy': PrivacyPolicy,
}

const noop = () => {}

/** The public page as a React element, for build-time prerender. No app or auth routes. */
export function pageElement(pathname) {
  const Page = PAGES[pathname]
  if (!Page) return null
  return createElement(Page, {
    onLoginClick: noop,
    onLogoClick: noop,
    onNavigateToProduct: noop,
    onNavigateToSolution: noop,
    onNavigateToCompany: noop,
    onNavigateToEthics: noop,
    onNavigateToTechnology: noop,
    onNavigateToUseCases: noop,
    initialSection: null,
  })
}

export { INDEXABLE_PATHS }
