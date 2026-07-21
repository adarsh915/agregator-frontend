import { apiRequest, getAuthToken } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      displayName: string;
      role?: string;
      permissions?: string[];
    };
    token: string;
  };
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const data = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Backend returns data directly: {userId, email, displayName, role, permissions, token}
    // Transform it to match our expected format
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.userId,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        permissions: data.permissions || []
      }));
      
      // Return in expected format
      return {
        success: true,
        data: {
          user: {
            id: data.userId,
            email: data.email,
            displayName: data.displayName,
            role: data.role,
            permissions: data.permissions || []
          },
          token: data.token
        }
      };
    }
    
    // If no token, login failed
    return {
      success: false,
      data: {
        user: { id: '', email: '', displayName: '' },
        token: ''
      }
    };
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getStoredUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },
};