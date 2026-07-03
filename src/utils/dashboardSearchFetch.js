import videoLibraryService from '../services/videoLibraryService';
import workspaceService from '../services/workspaceService';
import heygenService from '../services/heygenService';
import assetService from '../services/assetService';
import { fetchTemplateBundles } from './fetchTemplateBundles';
import { createSearchResult } from './dashboardSearchIndex';

const MAX_PROJECTS = 100;
const MAX_ASSETS = 200;
const MAX_AVATARS_PER_SECTION = 50;

function extractAvatarList(responseData) {
  const data = responseData?.data || responseData;
  if (Array.isArray(data)) return data;
  if (data?.avatar_groups) return data.avatar_groups;
  if (data?.avatars) return data.avatars;
  if (responseData?.avatar_groups) return responseData.avatar_groups;
  return [];
}

function extractVoiceList(result) {
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.voices)) return result.voices;
  if (result?.data && Array.isArray(result.data.voices)) return result.data.voices;
  if (result?.data && Array.isArray(result.data)) return result.data;
  if (result && Array.isArray(result.list)) return result.list;
  return [];
}

function libraryTabLabel(tab) {
  switch (tab) {
    case 'images':
      return 'Photos';
    case 'videos':
      return 'Videos';
    case 'music':
      return 'Music';
    case 'fonts':
      return 'Fonts';
    default:
      return 'Assets';
  }
}

/**
 * Fetch searchable content from APIs (videos, workspaces, avatars, etc.)
 * @returns {Promise<import('./dashboardSearchNavigate.js').DashboardSearchResult[]>}
 */
export async function fetchDynamicSearchIndex() {
  const results = [];

  const [videoRes, workspaces, templateBundles] = await Promise.all([
    videoLibraryService.listUserVideos({ take: 100, skip: 0 }).catch(() => ({ videos: [] })),
    workspaceService.listWorkspaces().catch(() => []),
    fetchTemplateBundles().catch(() => []),
  ]);

  for (const video of videoRes.videos || []) {
    results.push(
      createSearchResult({
        id: `video-export-${video.id}`,
        category: 'videos',
        title: video.title,
        location: 'My videos',
        keywords: [video.workspaceName, video.title],
        action: {
          type: 'editVideo',
          video: {
            id: video.projectId || video.id,
            workspaceId: video.workspaceId,
            folderId: video.folderId,
            title: video.title,
            name: video.title,
            workspaceName: video.workspaceName,
            raw: video.raw || video,
          },
        },
      })
    );
  }

  let projectCount = 0;
  let assetCount = 0;

  await Promise.all(
    (workspaces || []).map(async (ws) => {
      const wsName = ws.name || 'Workspace';
      const wsId = ws.id;

      results.push(
        createSearchResult({
          id: `workspace-${wsId}`,
          category: 'workspaces',
          title: wsName,
          location: 'Workspace',
          keywords: [wsName, ws.type],
          action: {
            type: 'navigate',
            section: 'workspace',
            workspace: ws,
            entityId: wsId,
          },
        })
      );

      const [folders, projects, assets] = await Promise.all([
        workspaceService.listFolders(wsId).catch(() => []),
        projectCount < MAX_PROJECTS
          ? workspaceService.listProjects(wsId).catch(() => [])
          : Promise.resolve([]),
        assetCount < MAX_ASSETS
          ? assetService.listAllAssets(wsId, { pageSize: 50 }).catch(() => [])
          : Promise.resolve([]),
      ]);

      const folderById = Object.fromEntries((folders || []).map((f) => [f.id, f]));

      for (const folder of folders || []) {
        results.push(
          createSearchResult({
            id: `folder-${wsId}-${folder.id}`,
            category: 'workspaces',
            title: folder.name || 'Folder',
            location: `Workspace · ${wsName}`,
            keywords: [folder.name, wsName],
            action: {
              type: 'navigate',
              section: 'workspace',
              workspace: ws,
              folder,
              entityId: folder.id,
            },
          })
        );
      }

      for (const project of projects || []) {
        if (projectCount >= MAX_PROJECTS) break;
        projectCount += 1;
        const folderId = project.folderId || project.folder?.id;
        const folder = folderId ? folderById[folderId] : null;
        const folderName = folder?.name || project.folderName || '';
        const location = folderName
          ? `Workspace · ${wsName} · ${folderName}`
          : `Workspace · ${wsName}`;

        results.push(
          createSearchResult({
            id: `project-${wsId}-${project.id}`,
            category: 'workspaces',
            title: project.title || project.name || 'Untitled',
            location,
            keywords: [project.title, project.name, wsName, folderName],
            action: {
              type: 'editVideo',
              video: {
                id: project.id,
                workspaceId: wsId,
                folderId: folderId || null,
                title: project.title || project.name,
                name: project.title || project.name,
                workspaceName: wsName,
                folderName,
                workspace: ws,
                folder,
              },
            },
          })
        );
      }

      for (const rawAsset of assets || []) {
        if (assetCount >= MAX_ASSETS) break;
        assetCount += 1;
        const asset = assetService.normalizeAsset(rawAsset) || rawAsset;
        const tab = assetService.toLibraryTab(asset.mediaType);
        results.push(
          createSearchResult({
            id: `library-${wsId}-${asset.id}`,
            category: 'library',
            title: asset.name || 'Asset',
            location: `Library · ${wsName} · ${libraryTabLabel(tab)}`,
            keywords: [asset.name, asset.id, wsName, tab],
            action: {
              type: 'navigate',
              section: 'library',
              libraryTab: tab,
              libraryWorkspaceId: wsId,
              entityId: asset.id,
            },
          })
        );
      }
    })
  );

  for (const ownership of ['private', 'public']) {
    try {
      const data = await heygenService.getAvatarGroups({
        ownership,
        limit: MAX_AVATARS_PER_SECTION,
      });
      const list = extractAvatarList(data);
      const label = ownership === 'private' ? 'Private' : 'Public';
      for (const av of list) {
        const id = av.avatar_group_id || av.id;
        if (!id) continue;
        results.push(
          createSearchResult({
            id: `avatar-${ownership}-${id}`,
            category: 'avatars',
            title: av.name || av.group_name || 'AI Presenter',
            location: `Avatars · ${label}`,
            keywords: [av.name, av.role, av.category, ownership],
            action: {
              type: 'navigate',
              section: 'avatars',
              avatarsSection: ownership,
              entityId: id,
            },
          })
        );
      }
    } catch {
      // skip avatars section on failure
    }
  }

  for (const voiceType of ['public', 'private']) {
    try {
      const data = await heygenService.getVoices({ type: voiceType });
      const list = extractVoiceList(data);
      const label = voiceType === 'private' ? 'Private' : 'Public';
      for (const voice of list) {
        const id = voice.voice_id || voice.id;
        if (!id) continue;
        results.push(
          createSearchResult({
            id: `voice-${voiceType}-${id}`,
            category: 'voices',
            title: voice.name || voice.voice_name || 'Voice',
            location: `Voices · ${label}`,
            keywords: [voice.name, voice.language, voice.gender, voiceType],
            action: {
              type: 'navigate',
              section: 'voices',
              voicesSection: voiceType,
              entityId: id,
            },
          })
        );
      }
    } catch {
      // skip voices on failure
    }
  }

  for (const bundle of templateBundles || []) {
    results.push(
      createSearchResult({
        id: `template-${bundle.id}`,
        category: 'templates',
        title: bundle.name || 'Template',
        location: 'Templates',
        keywords: [bundle.name, bundle.description, bundle.category],
        action: {
          type: 'openTemplate',
          bundle,
        },
      })
    );

    for (const scene of bundle.scenes || []) {
      const sceneTitle = scene.title || scene.name;
      if (!sceneTitle) continue;
      results.push(
        createSearchResult({
          id: `template-scene-${bundle.id}-${scene.id || sceneTitle}`,
          category: 'templates',
          title: sceneTitle,
          location: `Templates · ${bundle.name}`,
          keywords: [sceneTitle, bundle.name, bundle.category],
          action: {
            type: 'openTemplate',
            bundle,
          },
        })
      );
    }
  }

  return results;
}
