/** Static scene thumbnail (no live canvas) for the left scenes list. */
function getSceneThumbStyle(scene) {
  if (scene?.backgroundImage) {
    return {
      backgroundImage: `url(${scene.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  if (scene?.avatar) {
    return {
      backgroundImage: `url(${scene.avatar})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  const bg = scene?.background;
  if (bg?.value) {
    const value = String(bg.value);
    if (value.includes('gradient(')) {
      return { backgroundImage: value, backgroundSize: 'cover' };
    }
    return { backgroundColor: value };
  }
  if (typeof bg === 'string') {
    return { backgroundColor: bg };
  }
  return {
    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
  };
}

const SidebarSceneThumb = ({ scene, isActive }) => (
  <div
    className="sidebar-scene-thumb sidebar-scene-thumb--static"
    style={getSceneThumbStyle(scene)}
    aria-hidden
  >
    {isActive ? <div className="sidebar-scene-thumb__ring" aria-hidden /> : null}
  </div>
);

export default SidebarSceneThumb;
