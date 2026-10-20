import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js'
import { canvasDuplicateRequest } from '../utils/canvasLibrary.js'
import { generateUniqueProjectName } from '../utils/projectNameValidation.js'
import workspaceService from './workspaceService.js'

function normalizeId(item) {
  if (!item || typeof item !== 'object') return item
  return { ...item, id: item.id || item._id }
}

/** Error carrying the HTTP `status` and the server's `errors` list as `details`. */
async function toApiError(response, fallbackMessage) {
  const errorData = await response.json().catch(() => ({}))
  const error = new Error(errorData.message || fallbackMessage)
  error.status = response.status
  error.details = Array.isArray(errorData.errors) ? errorData.errors : []
  return error
}

class CanvasService {
  /** Create a new canvas document inside a workspace folder. */
  async createCanvas(workspaceId, { name, folderId, data, thumbnail } = {}) {
    const rawName = String(name || '').trim() || 'Untitled Design'
    let finalName = rawName
    if (folderId && workspaceId) {
      try {
        const projects = await workspaceService.listProjectsInFolder(workspaceId, folderId)
        finalName = generateUniqueProjectName(rawName, projects)
      } catch {
        // Continue with rawName if listing fails
      }
    }

    const canvasData = data ? { ...data, docTitle: finalName } : data

    const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CANVASES.LIST(workspaceId)), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: finalName, folderId, data: canvasData, thumbnail }),
    })

    if (!response.ok) {
      throw await toApiError(response, `Failed to create canvas: ${response.status}`)
    }

    const json = await response.json()
    return normalizeId(json.data?.canvas || json.canvas)
  }

  async listCanvases(workspaceId, folderId = null) {
    const query = folderId ? `?folderId=${encodeURIComponent(folderId)}` : ''
    const response = await fetch(
      buildUrl(`${API_CONFIG.ENDPOINTS.CANVASES.LIST(workspaceId)}${query}`),
      { method: 'GET', headers: getAuthHeaders(), cache: 'no-store' }
    )

    if (!response.ok) {
      throw await toApiError(response, `Failed to list canvases: ${response.status}`)
    }

    const json = await response.json()
    const canvases = json.data?.canvases || json.canvases || []
    return canvases.map(normalizeId)
  }

  async getCanvas(workspaceId, canvasId) {
    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.CANVASES.ONE(workspaceId, canvasId)),
      { method: 'GET', headers: getAuthHeaders(), cache: 'no-store' }
    )

    if (!response.ok) {
      throw await toApiError(response, `Failed to fetch canvas: ${response.status}`)
    }

    const json = await response.json()
    return normalizeId(json.data?.canvas || json.canvas)
  }

  async updateCanvasMeta(workspaceId, canvasId, updateData) {
    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.CANVASES.ONE(workspaceId, canvasId)),
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      }
    )

    if (!response.ok) {
      throw await toApiError(response, `Failed to update canvas: ${response.status}`)
    }

    const json = await response.json()
    return normalizeId(json.data?.canvas || json.canvas)
  }

  /**
   * Persist the full canvas document (autosave).
   * `baseRevision` makes the server refuse (409) if someone saved since that revision.
   * `keepalive` lets the request outlive the page (tab close); browsers cap those bodies at 64 KB.
   */
  async saveCanvasData(workspaceId, canvasId, data, { baseRevision, keepalive = false } = {}) {
    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.CANVASES.DATA(workspaceId, canvasId)),
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(
          Number.isInteger(baseRevision) ? { data, baseRevision } : { data }
        ),
        keepalive,
      }
    )

    if (!response.ok) {
      throw await toApiError(response, `Failed to save canvas: ${response.status}`)
    }

    const json = await response.json()
    return normalizeId(json.data?.canvas || json.canvas)
  }

  async moveCanvasFolder(workspaceId, canvasId, newFolderId) {
    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.CANVASES.MOVE_FOLDER(workspaceId, canvasId)),
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ folderId: newFolderId }),
      }
    )

    if (!response.ok) {
      throw await toApiError(response, `Failed to move canvas: ${response.status}`)
    }

    const json = await response.json()
    return normalizeId(json.data?.canvas || json.canvas)
  }

  /** New design in the same folder, with the same document and cover. */
  async duplicateCanvas(workspaceId, canvasId) {
    const source = await this.getCanvas(workspaceId, canvasId)
    const request = canvasDuplicateRequest(source)
    if (!request.folderId) {
      throw new Error('A design has to live in a folder.')
    }
    return this.createCanvas(workspaceId, request)
  }

  async deleteCanvas(workspaceId, canvasId) {
    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.CANVASES.ONE(workspaceId, canvasId)),
      { method: 'DELETE', headers: getAuthHeaders() }
    )

    if (!response.ok) {
      throw await toApiError(response, `Failed to delete canvas: ${response.status}`)
    }

    return true
  }
}

const canvasService = new CanvasService()
export default canvasService
