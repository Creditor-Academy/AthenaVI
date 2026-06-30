import {
  MissingAvatarError,
  MissingVoiceError,
  ExportFailedError,
} from './exportErrors';
import { getSceneAvatarLookId } from './heygenAvatars';
import { resolveSceneHeygenVideoId } from './heygenVideo';

export function validateExport(projectState) {
  if (!projectState?.scenes?.length) {
    throw new ExportFailedError('Add at least one scene before downloading.');
  }

  for (let index = 0; index < projectState.scenes.length; index++) {
    const scene = projectState.scenes[index];
    const sceneName = scene.title || scene.name || `Scene ${index + 1}`;
    const hasScript = typeof scene.script === 'string' && scene.script.trim();

    // 1. Check voice if script is present
    if (hasScript && !scene.voiceId) {
      throw new MissingVoiceError({
        sceneName,
        details: `Scene "${sceneName}" has script text but no voice assigned.`
      });
    }

    // 2. Check avatar look if script is present
    const lookId = getSceneAvatarLookId(scene);
    if (hasScript && !lookId) {
      throw new MissingAvatarError({
        sceneName,
        details: `Scene "${sceneName}" has script text but no avatar look selected.`
      });
    }

    // 3. Check if avatar video needs generation or is still generating.
    // Use resolveSceneHeygenVideoId to check scene fields AND clip content.
    if (lookId && hasScript && scene.voiceId) {
      const status = scene.heygenStatus || scene.generation?.status;
      const videoId = resolveSceneHeygenVideoId(scene);

      if (status === 'processing') {
        throw new MissingAvatarError({
          sceneName,
          details: `Avatar video for Scene "${sceneName}" is still generating. Please wait for it to complete.`
        });
      } else if (status === 'failed') {
        throw new MissingAvatarError({
          sceneName,
          details: `Avatar video generation failed for Scene "${sceneName}". Please click "Generate" again in Scene Settings.`
        });
      } else if (status === 'needs_regeneration') {
        throw new MissingAvatarError({
          sceneName,
          details: `Avatar video for Scene "${sceneName}" needs to be regenerated. Click "Generate" in Scene Settings.`
        });
      } else if (!videoId) {
        // Only block if there is truly no video ID anywhere in the scene.
        // If a videoId exists with unknown/missing status, treat it as ready.
        throw new MissingAvatarError({
          sceneName,
          details: `Avatar video has not been generated for Scene "${sceneName}". Click "Generate" in Scene Settings first.`
        });
      }
    }
  }
}
