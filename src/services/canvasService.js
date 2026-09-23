import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js'

function normalizeId(item) {
  if (!item || typeof item !== 'object') return item
  return { ...item, id: item.id || item._id }
}

async function readErrorMessage(response, fallbackMessage) {
  const errorData = await response.json().catch(() => ({}))
  return errorData.message || fallbackMessage
}

class CanvasService {
  /** Create a new canvas document inside a workspace folder. */
  async createCanvas(workspaceId, { name, folderId, data, thumbnail } = {}) {
    const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CANVASES.LIST(workspaceId)), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, folderId, data, thumbnail }),
    })

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, `Failed to create canvas: ${response.status}`))
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
      throw new Error(await readErrorMessage(response, `Failed to list canvases: ${response.status}`))
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
      throw new Error(await readErrorMessage(response, `Failed to fetch canvas: ${response.status}`))
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
      throw new Error(await readErrorMessage(response, `Failed to update canvas: ${response.status}`))
    }

    const json = await response.json()
    return normalizeId(json.data?.canvas || json.canvas)
  }

  /** Persist the full canvas document (autosave). */
  async saveCanvasData(workspaceId, canvasId, data) {
    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.CANVASES.DATA(workspaceId, canvasId)),
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ data }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const details = errorData.errors ? ` — ${JSON.stringify(errorData.errors)}` : ''
      throw new Error((errorData.message || `Failed to save canvas: ${response.status}`) + details)
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
      throw new Error(await readErrorMessage(response, `Failed to move canvas: ${response.status}`))
    }

    const json = await response.json()
    return normalizeId(json.data?.canvas || json.canvas)
  }

  async deleteCanvas(workspaceId, canvasId) {
    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.CANVASES.ONE(workspaceId, canvasId)),
      { method: 'DELETE', headers: getAuthHeaders() }
    )

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, `Failed to delete canvas: ${response.status}`))
    }

    return true
  }
}

const canvasService = new CanvasService()
export default canvasService
