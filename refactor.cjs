const fs = require('fs');
const path = require('path');

const root = path.resolve('src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, callback);
    } else {
      callback(filepath);
    }
  });
}

// Map of old import strings to new ones
const globalReplacements = [
  // Layout components: Navbar, Footer, DashboardSidebar, DashboardTopbar
  [/from ['"]([^'"]*?)\/components\/Navbar\.jsx['"]/g, (_, pre) => `from '${pre}/components/layout/Navbar/Navbar.jsx'`],
  [/from ['"]([^'"]*?)\/components\/Footer\.jsx['"]/g, (_, pre) => `from '${pre}/components/layout/Footer/Footer.jsx'`],
  [/from ['"]([^'"]*?)\/components\/DashboardSidebar\.jsx['"]/g, (_, pre) => `from '${pre}/components/layout/DashboardSidebar/DashboardSidebar.jsx'`],
  [/from ['"]([^'"]*?)\/components\/DashboardTopbar\.jsx['"]/g, (_, pre) => `from '${pre}/components/layout/DashboardTopbar/DashboardTopbar.jsx'`],

  // UI components
  [/from ['"]([^'"]*?)\/components\/ImportPowerPointModal\.jsx['"]/g, (_, pre) => `from '${pre}/components/ui/ImportPowerPointModal/ImportPowerPointModal.jsx'`],
  [/from ['"]([^'"]*?)\/components\/TranslateVideoModal\.jsx['"]/g, (_, pre) => `from '${pre}/components/ui/TranslateVideoModal/TranslateVideoModal.jsx'`],
  [/from ['"]([^'"]*?)\/components\/ProfileDropdown\.jsx['"]/g, (_, pre) => `from '${pre}/components/ui/ProfileDropdown/ProfileDropdown.jsx'`],
  [/from ['"]([^'"]*?)\/components\/VoiceCreatePanel\.jsx['"]/g, (_, pre) => `from '${pre}/components/ui/VoiceCreatePanel/VoiceCreatePanel.jsx'`],
  [/from ['"]([^'"]*?)\/components\/AIVideoAssistant\.jsx['"]/g, (_, pre) => `from '${pre}/components/ui/AIVideoAssistant/AIVideoAssistant.jsx'`],

  // CSS imports for UI modals
  [/from ['"]([^'"]*?)\/components\/ImportPowerPointModal\.css['"]/g, (_, pre) => `from '${pre}/components/ui/ImportPowerPointModal/ImportPowerPointModal.css'`],
  [/from ['"]([^'"]*?)\/components\/TranslateVideoModal\.css['"]/g, (_, pre) => `from '${pre}/components/ui/TranslateVideoModal/TranslateVideoModal.css'`],
  [/from ['"]([^'"]*?)\/components\/ProfileDropdown\.css['"]/g, (_, pre) => `from '${pre}/components/ui/ProfileDropdown/ProfileDropdown.css'`],

  // Feature folders
  [/\/components\/authentication\//g, '/components/features/auth/'],
  [/\/components\/admin\//g, '/components/features/admin/'],
  [/\/components\/company\//g, '/components/features/company/'],
  [/\/components\/editor\//g, '/components/features/editor/'],
  [/\/components\/products\//g, '/components/features/products/'],
  [/\/components\/settings\//g, '/components/features/settings/'],
  [/\/components\/solutions\//g, '/components/features/solutions/'],
  [/\/components\/workspace\//g, '/components/features/workspace/'],

  // Layout misc components
  [/from ['"]([^'"]*?)\/components\/AvatarMarquee\.jsx['"]/g, (_, pre) => `from '${pre}/components/layout/AvatarMarquee.jsx'`],
  [/from ['"]([^'"]*?)\/components\/TemplateShowcase\.jsx['"]/g, (_, pre) => `from '${pre}/components/layout/TemplateShowcase.jsx'`],
  [/from ['"]([^'"]*?)\/components\/GoogleCallback\.jsx['"]/g, (_, pre) => `from '${pre}/components/features/auth/GoogleCallback.jsx'`],
  [/from ['"]([^'"]*?)\/components\/ModernVideoEditor\.jsx['"]/g, (_, pre) => `from '${pre}/components/features/editor/ModernVideoEditor.jsx'`],
  [/from ['"]([^'"]*?)\/components\/TimelineEditor\.jsx['"]/g, (_, pre) => `from '${pre}/components/features/editor/TimelineEditor.jsx'`],
];

// For files that moved into subfolders (pages/X/X.jsx), we need to adjust relative paths
// These files previously used '../' but now need '../../' to reach src-level folders
const pageFilePattern = /src[/\\]pages[/\\][^/\\]+[/\\][^/\\]+\.(jsx|js|css)$/;

const pageRelativeReplacements = [
  // Adjust relative paths that go up one level from a page file to reach src-level
  [/from '\.\.\/components\//g, "from '../../components/"],
  [/from '\.\.\/contexts\//g, "from '../../contexts/"],
  [/from '\.\.\/services\//g, "from '../../services/"],
  [/from '\.\.\/assets\//g, "from '../../assets/"],
  [/from '\.\.\/styles\//g, "from '../../styles/"],
  [/from '\.\.\/config\//g, "from '../../config/"],
  [/from '\.\.\/constants\//g, "from '../../constants/"],
  [/from '\.\.\/hooks\//g, "from '../../hooks/"],
  [/from '\.\.\/utils\//g, "from '../../utils/"],
  // CSS imports in page files
  [/import '\.\.\/components\//g, "import '../../components/"],
];

walk(root, (filepath) => {
  if (!filepath.endsWith('.jsx') && !filepath.endsWith('.css') && !filepath.endsWith('.js')) return;

  let content = fs.readFileSync(filepath, 'utf8');
  const original = content;

  // Apply global replacements to all files
  globalReplacements.forEach(r => {
    if (typeof r[1] === 'function') {
      content = content.replace(r[0], r[1]);
    } else {
      content = content.replace(r[0], r[1]);
    }
  });

  // For page files inside subfolders, fix relative up-one-level paths
  if (pageFilePattern.test(filepath.replace(/\\/g, '/'))) {
    pageRelativeReplacements.forEach(([from, to]) => {
      content = content.replace(from, to);
    });

    // Fix CSS self-imports: Settings.jsx imports './Settings.css' - that still works
    // Fix sibling page imports like: import Credits from './Credits';
    // These need to become: import Credits from '../Credits/Credits';
    content = content.replace(/from '\.\/([A-Z][^'"./]+)'([^;])/g, (m, name, after) => {
      return `from '../${name}/${name}'${after}`;
    });
    content = content.replace(/from '\.\/([A-Z][^'"./]+\.jsx)'/g, (m, name) => {
      const base = name.replace('.jsx', '');
      return `from '../${base}/${name}'`;
    });
  }

  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Updated: ' + filepath.replace(root, 'src'));
  }
});

console.log('Done!');
