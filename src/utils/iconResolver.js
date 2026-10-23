/**
 * Resolves semantic icon intents to actual graphic assets.
 */

// A mock dictionary mapping semantic intents to approved icon IDs or SVGs.
// This should be expanded to connect to the actual Superadmin SVG/graphics library.
const ICON_DICTIONARY = {
  analytics: 'graphic_analytics',
  growth: 'graphic_growth',
  users: 'graphic_users',
  security: 'graphic_security',
  cloud: 'graphic_cloud',
  speed: 'graphic_speed',
  search: 'graphic_search',
  settings: 'graphic_settings',
  success: 'graphic_success',
  warning: 'graphic_warning',
  error: 'graphic_error',
  info: 'graphic_info',
  // fallback graphic
  default: 'graphic_default'
};

export function resolveSemanticIcon(iconIntent) {
  if (!iconIntent || typeof iconIntent !== 'string') return null;
  
  const normalizedIntent = iconIntent.trim().toLowerCase();
  
  if (ICON_DICTIONARY[normalizedIntent]) {
    return ICON_DICTIONARY[normalizedIntent];
  }
  
  // If we don't have a specific mapping, return the intent as a fallback,
  // or a default icon, depending on how the Canvas renderer handles it.
  // For now, return the original string so the Canvas can try to render it or fallback.
  return normalizedIntent;
}
