import { apiRequest } from './client';

export interface ProfileResponse {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface ProfileUpdateRequest {
  displayName?: string;
  email?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export const profileApi = {
  // GET /api/v1/profile - Get current user profile
  getProfile: async (): Promise<{ ok: boolean; profile: ProfileResponse }> => {
    return apiRequest('/api/v1/profile');
  },

  // PUT /api/v1/profile - Update profile (displayName, email)
  updateProfile: async (data: ProfileUpdateRequest): Promise<{ 
    ok: boolean; 
    profile: ProfileResponse;
    message: string;
  }> => {
    return apiRequest('/api/v1/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // POST /api/v1/profile/password - Change password
  changePassword: async (data: PasswordChangeRequest): Promise<{ 
    ok: boolean; 
    message: string;
  }> => {
    return apiRequest('/api/v1/profile/password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};