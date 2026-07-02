export const DASHBOARD_SEARCH_CONTEXT_KEY = 'athenavi:dashboardSearchContext';

/**
 * @typedef {object} DashboardSearchResult
 * @property {string} id
 * @property {string} category
 * @property {string} title
 * @property {string} location
 * @property {string[]} [keywords]
 * @property {DashboardSearchAction} action
 */

/**
 * @typedef {object} DashboardSearchContext
 * @property {string} section
 * @property {string} [searchQuery]
 * @property {string} [entityId]
 * @property {string} [settingsTab]
 * @property {string} [avatarsSection]
 * @property {string} [voicesSection]
 * @property {string} [libraryTab]
 * @property {string} [libraryWorkspaceId]
 * @property {string} [helpCategoryId]
 * @property {string} [helpArticleTitle]
 * @property {object} [workspaceLevel]
 */

export function setDashboardSearchContext(ctx) {
  try {
    if (!ctx) {
      sessionStorage.removeItem(DASHBOARD_SEARCH_CONTEXT_KEY);
      return;
    }
    sessionStorage.setItem(DASHBOARD_SEARCH_CONTEXT_KEY, JSON.stringify(ctx));
  } catch {
    // ignore
  }
}

export function peekDashboardSearchContext() {
  try {
    const raw = sessionStorage.getItem(DASHBOARD_SEARCH_CONTEXT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Read and clear search context when it matches the active section.
 * @param {string} section
 * @returns {DashboardSearchContext | null}
 */
export function consumeDashboardSearchContext(section) {
  const ctx = peekDashboardSearchContext();
  if (!ctx || ctx.section !== section) return null;
  try {
    sessionStorage.removeItem(DASHBOARD_SEARCH_CONTEXT_KEY);
  } catch {
    // ignore
  }
  return ctx;
}

export function saveWorkspaceSearchTarget({ workspace, folder = null }) {
  try {
    if (folder && workspace) {
      sessionStorage.setItem(
        'workspaceCurrentLevel',
        JSON.stringify({
          type: 'folder',
          id: folder.id,
          folder,
          ws: workspace,
        })
      );
    } else if (workspace) {
      sessionStorage.setItem(
        'workspaceCurrentLevel',
        JSON.stringify({
          type: 'workspace',
          id: workspace.id,
          ws: workspace,
        })
      );
    }
  } catch {
    // ignore
  }
}

/**
 * @param {DashboardSearchResult} result
 * @param {object} handlers
 */
export function applySearchResult(result, handlers = {}) {
  const {
    goToSection,
    handleEditVideo,
    setSelectedTemplateForDetails,
    bundleToDetailsTemplate,
    onOpenCreateVideo,
  } = handlers;

  const action = result?.action || { type: 'navigate', section: 'home' };

  switch (action.type) {
    case 'editVideo': {
      if (handleEditVideo && action.video) {
        handleEditVideo(action.video);
        return;
      }
      setDashboardSearchContext({
        section: 'videos',
        searchQuery: result.title,
        entityId: action.video?.id,
      });
      goToSection?.('videos');
      return;
    }

    case 'openTemplate': {
      if (setSelectedTemplateForDetails && bundleToDetailsTemplate && action.bundle) {
        setSelectedTemplateForDetails(bundleToDetailsTemplate(action.bundle));
      }
      setDashboardSearchContext({
        section: 'templates',
        searchQuery: result.title,
        entityId: action.bundle?.id,
      });
      goToSection?.('template-details');
      return;
    }

    case 'openHelpArticle': {
      setDashboardSearchContext({
        section: 'help',
        helpCategoryId: action.categoryId,
        helpArticleTitle: action.articleTitle,
      });
      goToSection?.('help');
      return;
    }

    case 'openSettings': {
      setDashboardSearchContext({
        section: 'settings',
        settingsTab: action.tab || 'preferences',
        searchQuery: result.title,
      });
      goToSection?.('settings');
      return;
    }

    case 'navigate':
    default: {
      if (action.section === 'workspace' && action.workspace) {
        saveWorkspaceSearchTarget({
          workspace: action.workspace,
          folder: action.folder || null,
        });
      }

      const ctx = {
        section: action.section || 'home',
        searchQuery: result.title,
        entityId: action.entityId,
      };

      if (action.section === 'avatars' && action.avatarsSection) {
        ctx.avatarsSection = action.avatarsSection;
      }
      if (action.section === 'voices' && action.voicesSection) {
        ctx.voicesSection = action.voicesSection;
      }
      if (action.section === 'library') {
        if (action.libraryTab) ctx.libraryTab = action.libraryTab;
        if (action.libraryWorkspaceId) ctx.libraryWorkspaceId = action.libraryWorkspaceId;
      }

      setDashboardSearchContext(ctx);
      goToSection?.(action.section || 'home');
      return;
    }
  }
}
