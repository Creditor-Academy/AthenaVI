const WORKSPACE_KEYS = [
  'workspaceCurrentLevel',
  'workspaceActiveRootTab',
  'workspaceLocalAdditions',
];

/** Reset workspace root tab and drill-down when leaving workspace via sidebar. */
export function clearWorkspaceNavigation() {
  try {
    WORKSPACE_KEYS.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // ignore
  }
}
