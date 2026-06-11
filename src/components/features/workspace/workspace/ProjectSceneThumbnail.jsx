import { useEffect, useState } from 'react';
import { MdVideoLibrary } from 'react-icons/md';
import workspaceService from '../../../../services/workspaceService';
import { fromBackendProjectData } from '../../../../utils/projectDataMapper';
import { normalizeSceneClips } from '../../../../utils/clipLayout';
import { normalizeClipsToScene } from '../../../../utils/editorLayerUtils';
import LiveCanvasRenderer from '../../editor/editor/LiveCanvasRenderer';

const scenePreviewCache = new Map();

function normalizePreviewScene(scene, resolution = { width: 1920, height: 1080 }) {
  if (!scene) return null;
  const duration = scene.duration || 8;
  const clips = normalizeClipsToScene(
    normalizeSceneClips(scene.clips || [], resolution),
    duration
  );
  if (!clips.length) return null;
  return { ...scene, clips, duration };
}

const ProjectSceneThumbnail = ({ video }) => {
  const [previewScene, setPreviewScene] = useState(null);
  const [previewResolution, setPreviewResolution] = useState({ width: 1920, height: 1080 });
  const [loading, setLoading] = useState(true);

  const workspaceId = video?.workspaceId;
  const projectId = video?.id || video?._id;
  const cacheKey = workspaceId && projectId ? `${workspaceId}:${projectId}` : '';

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      if (!workspaceId || !projectId) {
        setLoading(false);
        return;
      }

      if (scenePreviewCache.has(cacheKey)) {
        const cached = scenePreviewCache.get(cacheKey);
        setPreviewScene(cached.scene);
        setPreviewResolution(cached.resolution || { width: 1920, height: 1080 });
        setLoading(false);
        return;
      }

      try {
        let projectData = video?.data;
        if (!projectData?.scenes?.length) {
          const project = await workspaceService.getProject(workspaceId, projectId);
          projectData = project?.data;
        }

        if (cancelled || !projectData?.scenes?.length) {
          setPreviewScene(null);
          return;
        }

        const mapped = fromBackendProjectData(projectData);
        const resolution = mapped.resolution || { width: 1920, height: 1080 };
        const firstScene = normalizePreviewScene(mapped.scenes[0], resolution);
        const cached = { scene: firstScene, resolution };
        scenePreviewCache.set(cacheKey, cached);
        if (!cancelled) {
          setPreviewScene(firstScene);
          setPreviewResolution(resolution);
        }
      } catch {
        if (!cancelled) setPreviewScene(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, projectId, cacheKey, video?.data]);

  if (loading || !previewScene) {
    return <MdVideoLibrary size={48} className="video-icon" />;
  }

  return (
    <div className="project-scene-thumb">
      <LiveCanvasRenderer
        scene={previewScene}
        overlayMode={false}
        scaleMode="cover"
        compositionWidth={previewResolution.width || 1920}
        compositionHeight={previewResolution.height || 1080}
      />
    </div>
  );
};

export default ProjectSceneThumbnail;
