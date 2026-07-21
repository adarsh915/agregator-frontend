import { apiRequest, getAuthToken, API_BASE_URL } from './client';

export const uploadApi = {
  // Upload enterprise logo
  uploadLogo: async (file: File): Promise<{ 
    ok: boolean; 
    data: {
      filename: string;
      logoUrl: string;
      storagePath: string;
      size: number;
      mimetype: string;
    }
  }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/uploads/logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    


    if (!response.ok) {
      throw new Error(data.error || `Upload failed: ${response.status}`);
    }

    return data;
  },

  // Delete logo
  deleteLogo: async (storagePath: string): Promise<{ ok: boolean; message: string }> => {
    return apiRequest('/api/v1/uploads/logo', {
      method: 'DELETE',
      body: JSON.stringify({ storagePath })
    });
  },

  // Get full logo URL
  getLogoUrl: (logoUrl: string): string => {
    if (!logoUrl) return '';
    if (logoUrl.startsWith('http')) return logoUrl;
    return `${API_BASE_URL}${logoUrl}`;
  }
};