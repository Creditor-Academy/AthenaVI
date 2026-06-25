import {
  bringClipForward,
  bringClipToFront,
  duplicateClip,
  duplicateScene,
  pasteClipsAt,
  sendClipBackward,
  sendClipToBack,
  snapPoint,
} from '../utils/editorLayerUtils';
import { buildSceneMusicClip } from '../utils/audioClipUtils';

export function useEditorUx({
  project,
  setProject,
  activeSceneId,
  selectedLayerIds,
  setSelectedLayerIds,
  setSelectedLayerId,
  editorView,
  clipboardRef,
  showToast,
}) {
  const updateScene = (id, updates, { history = true } = {}) => {
    setProject(
      (prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        scenes: prev.scenes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }),
      { history }
    );
  };

  const updateActiveSceneClips = (clipUpdater, { history = true } = {}) => {
    if (!activeSceneId) return;
    setProject(
      (prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        scenes: prev.scenes.map((s) => {
          if (s.id !== activeSceneId) return s;
          const clips = typeof clipUpdater === 'function' ? clipUpdater(s.clips || []) : clipUpdater;
          return { ...s, clips };
        }),
      }),
      { history }
    );
  };

  const moveLayerOrder = (clipId, direction) => {
    updateActiveSceneClips((clips) => {
      if (direction === 'forward') return bringClipForward(clips, clipId);
      if (direction === 'backward') return sendClipBackward(clips, clipId);
      if (direction === 'toFront') return bringClipToFront(clips, clipId);
      if (direction === 'toBack') return sendClipToBack(clips, clipId);
      return clips;
    });
  };

  const toggleLayerLock = (clipId, locked) => {
    updateActiveSceneClips((clips) =>
      clips.map((c) => (c.id === clipId ? { ...c, locked } : c))
    );
  };

  const duplicateSceneById = (sceneId) => {
    const index = project.scenes.findIndex((s) => s.id === sceneId);
    if (index === -1) return null;
    const copy = duplicateScene(project.scenes[index], index);
    setProject(
      (prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        scenes: [
          ...prev.scenes.slice(0, index + 1),
          copy,
          ...prev.scenes.slice(index + 1),
        ],
      }),
      { history: true }
    );
    return copy.id;
  };

  const duplicateSelectedLayers = () => {
    if (!activeSceneId || !selectedLayerIds.length) return;
    updateActiveSceneClips((clips) => {
      const selected = clips.filter((c) => selectedLayerIds.includes(c.id));
      if (!selected.length) return clips;
      return pasteClipsAt(clips, selected, { x: 24, y: 24 });
    });
    showToast?.('Layer duplicated', 'success');
  };

  const copySelectedLayers = () => {
    const scene = project.scenes.find((s) => s.id === activeSceneId);
    if (!scene || !selectedLayerIds.length) return;
    const selected = (scene.clips || []).filter((c) => selectedLayerIds.includes(c.id));
    if (!selected.length) return;
    clipboardRef.current = JSON.parse(JSON.stringify(selected));
    showToast?.(`Copied ${selected.length} layer(s)`, 'info');
  };

  const pasteLayers = () => {
    if (!activeSceneId || !clipboardRef.current?.length) return;
    updateActiveSceneClips((clips) => pasteClipsAt(clips, clipboardRef.current));
    showToast?.('Pasted layer(s)', 'success');
  };

  const deleteSelectedLayers = () => {
    if (!activeSceneId || !selectedLayerIds.length) return;
    updateActiveSceneClips((clips) => clips.filter((c) => !selectedLayerIds.includes(c.id)));
    setSelectedLayerIds([]);
    setSelectedLayerId(null);
    showToast?.('Layer deleted', 'info');
  };

  const selectLayer = (layerId, sceneId, { additive = false } = {}) => {
    if (sceneId && sceneId !== activeSceneId) {
      // scene switch handled by caller
    }
    if (additive && layerId) {
      setSelectedLayerIds((prev) =>
        prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]
      );
      setSelectedLayerId(layerId);
    } else if (layerId) {
      setSelectedLayerIds([layerId]);
      setSelectedLayerId(layerId);
    } else {
      setSelectedLayerIds([]);
      setSelectedLayerId(null);
    }
  };

  const updateLayerPosition = (layerId, x, y, { history = false } = {}) => {
    if (!activeSceneId) return;
    const snapped = snapPoint(
      { x, y },
      editorView.gridSize,
      editorView.snapToGrid
    );
    setProject(
      (prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        scenes: prev.scenes.map((s) => {
          if (s.id !== activeSceneId) return s;
          return {
            ...s,
            clips: s.clips.map((c) => {
              if (c.id !== layerId || c.locked) return c;
              return { ...c, position: snapped, _userPlaced: true };
            }),
          };
        }),
      }),
      { history }
    );
  };

  const commitLayerPositionHistory = () => {
    setProject((prev) => prev, { history: true });
  };

  const addAudioClip = (src, assetId = null, options = {}) => {
    if (!activeSceneId) return null;
    let newId = null;
    updateActiveSceneClips((clips) => {
      const scene = project.scenes.find((s) => s.id === activeSceneId);
      const duration = scene?.duration || 8;
      const clip = buildSceneMusicClip({
        src: src || null,
        assetId,
        sceneDuration: duration,
        name: options.name || 'Background music',
        volume: options.volume ?? 1,
        startTime: options.startTime ?? 0,
      });
      newId = clip.id;
      return [
        ...clips.filter((c) => c.type !== 'audio' || !['scene-audio', 'background-music'].includes(c.role)),
        clip,
      ];
    });
    showToast?.('Audio added to scene', 'success');
    return newId;
  };

  return {
    updateScene,
    updateActiveSceneClips,
    moveLayerOrder,
    toggleLayerLock,
    duplicateSceneById,
    duplicateSelectedLayers,
    copySelectedLayers,
    pasteLayers,
    deleteSelectedLayers,
    selectLayer,
    updateLayerPosition,
    commitLayerPositionHistory,
    addAudioClip,
  };
}
