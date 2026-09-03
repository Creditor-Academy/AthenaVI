function hexLuminance(hex) {
  const raw = String(hex || '').trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) return 1
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : raw
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255
  const toLin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b)
}

function appearanceFromBackground(background) {
  return hexLuminance(background) < 0.35 ? 'dark' : 'light'
}

function makeTheme({ id, name, vibe, background, background_secondary, text_primary, text_secondary, primary, secondary, accent, border, appearance }) {
  return {
    id,
    name,
    vibe,
    background,
    background_secondary,
    text_primary,
    text_secondary,
    primary,
    secondary,
    accent,
    border,
    appearance: appearance || appearanceFromBackground(background),
    // Legacy keys used by theme modal / cards
    outer: `linear-gradient(135deg, ${primary}, ${secondary})`,
    inner: background,
    title: text_primary,
    body: text_secondary,
  }
}

export const THEMES = [
  // —— Light (10) ——
  makeTheme({
    id: 'soft-sky',
    name: 'Soft Sky',
    vibe: 'airy / calm / light',
    appearance: 'light',
    background: '#F5FAFE', // Cloud White
    background_secondary: '#FFF8EE', // Warm Cream
    primary: '#5BA4D6', // Sky Blue
    secondary: '#9BB896', // Sage Green
    accent: '#7EB8DA', // Sky highlight
    text_primary: '#1E293B',
    text_secondary: '#8B939E', // Soft Gray
    border: '#D5DEE6',
  }),
  makeTheme({
    id: 'pastel-dream',
    name: 'Pastel Dream',
    vibe: 'pastel / soft / dreamy',
    appearance: 'light',
    background: '#FBF8FF', // Light Lilac base
    background_secondary: '#FFF9E6', // Pale Yellow
    primary: '#B8A0D8', // Lavender Mist
    secondary: '#9DD4C0', // Mint Green
    accent: '#F0B8A8', // Peachy Pink
    text_primary: '#3B3450',
    text_secondary: '#8A82A3',
    border: '#E6DFF5',
  }),
  makeTheme({
    id: 'minimalist',
    name: 'Minimalist',
    vibe: 'minimal / editorial / clean',
    appearance: 'light',
    background: '#FAFAF8', // Off White
    background_secondary: '#E8E4DC', // Soft Beige
    primary: '#5B7C99', // Steel Blue
    secondary: '#9CA3AF', // Cool Gray
    accent: '#374151', // Charcoal accent
    text_primary: '#1F2937',
    text_secondary: '#6B7280',
    border: '#D1D5DB',
  }),
  makeTheme({
    id: 'sunrise',
    name: 'Sunrise',
    vibe: 'warm / energetic / morning',
    appearance: 'light',
    background: '#FFFBF5', // Cream White
    background_secondary: '#F5E6D8', // Light Tan
    primary: '#F4847B', // Coral Pink
    secondary: '#F5C542', // Golden Yellow
    accent: '#F5A66E', // Pale Orange
    text_primary: '#3A1F14',
    text_secondary: '#8A6A55',
    border: '#F0D5C0',
  }),
  makeTheme({
    id: 'nature-fresh',
    name: 'Nature Fresh',
    vibe: 'nature / organic / fresh',
    appearance: 'light',
    background: '#FFFEF7', // Ivory White
    background_secondary: '#EEF5E8',
    primary: '#2D6A4F', // Forest Green
    secondary: '#95D5B2', // Leaf Lime
    accent: '#A67C52', // Earthy Brown
    text_primary: '#1A2E1F',
    text_secondary: '#6B7F6A', // Moss Gray
    border: '#D4E0D0',
  }),
  makeTheme({
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    vibe: 'cool / coastal / trust',
    appearance: 'light',
    background: '#F8FCFF', // Pearl White
    background_secondary: '#D4EEF0', // Aqua Mist
    primary: '#4A90A4', // Sea Blue
    secondary: '#5EC4B6', // Light Teal
    accent: '#E8D9C5', // Sand Beige
    text_primary: '#0D2B3A',
    text_secondary: '#5A7A84',
    border: '#C5E0E4',
  }),
  makeTheme({
    id: 'botanical',
    name: 'Botanical',
    vibe: 'garden / soft / natural',
    appearance: 'light',
    background: '#FBF6EE', // Vanilla Cream
    background_secondary: '#F0E8DC',
    primary: '#9CAF88', // Sage Green
    secondary: '#E8A0A0', // Blush Pink
    accent: '#C4785A', // Terracotta
    text_primary: '#2C2A26',
    text_secondary: '#6B7280', // Slate Gray
    border: '#DDD4C8',
  }),
  makeTheme({
    id: 'ethereal',
    name: 'Ethereal',
    vibe: 'soft / romantic / airy',
    appearance: 'light',
    background: '#F7F4F0', // Linen White
    background_secondary: '#EFE8E4',
    primary: '#C9A0A0', // Dusty Rose
    secondary: '#B8A0C0', // Mauve
    accent: '#A8D4D8', // Pale Cyan
    text_primary: '#3A322E',
    text_secondary: '#A89888', // Soft Taupe
    border: '#DDD4CE',
  }),
  makeTheme({
    id: 'urban-cool',
    name: 'Urban Cool',
    vibe: 'modern / cool / city',
    appearance: 'light',
    background: '#FFFFFF', // White
    background_secondary: '#E8F0F5', // Ice Blue
    primary: '#6B8CAE', // Slate Blue
    secondary: '#C0C5CC', // Silver Gray
    accent: '#2D3436', // Charcoal
    text_primary: '#1A1F24',
    text_secondary: '#64748B',
    border: '#D8DEE6',
  }),
  makeTheme({
    id: 'warm-embrace',
    name: 'Warm Embrace',
    vibe: 'cozy / warm / inviting',
    appearance: 'light',
    background: '#FFF8F0', // Cream
    background_secondary: '#F8E8DC',
    primary: '#F5A66E', // Apricot
    secondary: '#E8C547', // Honey Yellow
    accent: '#E8A8A0', // Blush
    text_primary: '#3B2415',
    text_secondary: '#8B5E3C', // Warm Brown
    border: '#E8D4C0',
  }),

  // —— Dark (10) ——
  makeTheme({
    id: 'deep-space',
    name: 'Deep Space',
    vibe: 'space / navy / dark',
    appearance: 'dark',
    background: '#0A0A0C', // Charcoal Black
    background_secondary: '#0F2744', // Navy
    primary: '#1E3A5F', // Midnight Blue
    secondary: '#C0C5CC', // Silver
    accent: '#8A94A0', // Steel Gray
    text_primary: '#F1F5F9',
    text_secondary: '#94A3B8',
    border: '#1E2A3A',
  }),
  makeTheme({
    id: 'modern-dark',
    name: 'Modern Dark',
    vibe: 'modern / slate / tech',
    appearance: 'dark',
    background: '#0A0A0A', // Deep Black
    background_secondary: '#1A2332', // Dark Slate
    primary: '#3B82F6', // Neon Blue
    secondary: '#D1D5DB', // Light Gray
    accent: '#60A5FA',
    text_primary: '#F8FAFC',
    text_secondary: '#9CA3AF',
    border: '#2A3340',
  }),
  makeTheme({
    id: 'tech-noir',
    name: 'Tech Noir',
    vibe: 'futuristic / neon / noir',
    appearance: 'dark',
    background: '#0D0D0F', // Carbon Black
    background_secondary: '#1A1D24', // Dark Steel
    primary: '#00D4FF', // Electric Blue
    secondary: '#A8B0BC', // Metallic Silver
    accent: '#7C3AED', // Deep Purple highlight
    text_primary: '#E8E8FF',
    text_secondary: '#8C8CB3',
    border: '#2A2D38',
  }),
  makeTheme({
    id: 'sunset-dark',
    name: 'Sunset Dark',
    vibe: 'warm / dusk / dramatic',
    appearance: 'dark',
    background: '#1A0F0A', // Dark Brown
    background_secondary: '#2A2A2A', // Dark Gray
    primary: '#E85D04', // Deep Orange
    secondary: '#D4AF37', // Gold Accent
    accent: '#9C4221', // Burnt Sienna
    text_primary: '#FFF7ED',
    text_secondary: '#C4A484',
    border: '#3A2A20',
  }),
  makeTheme({
    id: 'forest-night',
    name: 'Forest Night',
    vibe: 'forest / emerald / night',
    appearance: 'dark',
    background: '#050705', // Black
    background_secondary: '#0D2818', // Deep Green
    primary: '#10B981', // Emerald
    secondary: '#C9A84C', // Muted Gold
    accent: '#34D399',
    text_primary: '#ECFDF5',
    text_secondary: '#86A899',
    border: '#1A3024',
  }),
  makeTheme({
    id: 'ocean-deep',
    name: 'Ocean Deep',
    vibe: 'deep sea / navy / dark',
    appearance: 'dark',
    background: '#050A0C', // Black
    background_secondary: '#0A1628', // Navy Blue
    primary: '#0E3A4A', // Deep Sea
    secondary: '#B8C0C8', // Silver
    accent: '#14B8A6', // Dark Teal highlight
    text_primary: '#E0F2FE',
    text_secondary: '#7BA3B8',
    border: '#143040',
  }),
  makeTheme({
    id: 'luxe-dark',
    name: 'Luxe Dark',
    vibe: 'luxury / burgundy / gold',
    appearance: 'dark',
    background: '#0A0808', // Black
    background_secondary: '#1A1214', // Dark Charcoal
    primary: '#4A0E1F', // Deep Burgundy
    secondary: '#B8960F', // Dark Gold
    accent: '#7C3AED', // Rich Purple
    text_primary: '#F5EFE0',
    text_secondary: '#B8AF9A',
    border: '#3A2A2E',
  }),
  makeTheme({
    id: 'cosmic',
    name: 'Cosmic',
    vibe: 'cosmic / neon / purple',
    appearance: 'dark',
    background: '#050508', // Black
    background_secondary: '#1A0A2E', // Deep Purple
    primary: '#6366F1', // Dark Blue-violet
    secondary: '#22D3EE', // Neon Cyan
    accent: '#A78BFA',
    text_primary: '#F5F3FF',
    text_secondary: '#A5A0B8',
    border: '#2A1E40',
  }),
  makeTheme({
    id: 'elegant-dark',
    name: 'Elegant Dark',
    vibe: 'elegant / gold / charcoal',
    appearance: 'dark',
    background: '#0A0A0A', // Deep Black
    background_secondary: '#1C1C1E', // Charcoal
    primary: '#D4C4A0', // Soft Gold
    secondary: '#F5F5F5', // White accent
    accent: '#A89880', // Dark Taupe metal
    text_primary: '#FAFAF9',
    text_secondary: '#A8A29E',
    border: '#2A2A2C',
  }),
  makeTheme({
    id: 'industrial',
    name: 'Industrial',
    vibe: 'industrial / gunmetal / rust',
    appearance: 'dark',
    background: '#0C0C0E', // Deep Black
    background_secondary: '#1A1D20', // Dark Zinc
    primary: '#C45C26', // Rust Orange
    secondary: '#A8AEB4', // Silver Gray
    accent: '#2C333A', // Gunmetal
    text_primary: '#F1F5F9',
    text_secondary: '#94A3B8',
    border: '#2A3036',
  }),
]
