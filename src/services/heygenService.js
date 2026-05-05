import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js';

class HeygenService {
  async getAvatarLooks(params = {}) {
    try {
      const mergedParams = { limit: 50, ...params };
      const queryParams = new URLSearchParams(mergedParams).toString();
      const endpoint = `${API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.LOOKS}${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch avatar looks: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data; // Backend might wrap it in .data
    } catch (error) {
      console.error('Error fetching avatar looks:', error);
      throw error;
    }
  }

  async getAvatarGroups(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = `${API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.GROUPS}${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch avatar groups: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching avatar groups:', error);
      throw error;
    }
  }
}

const heygenService = new HeygenService();
export default heygenService;
