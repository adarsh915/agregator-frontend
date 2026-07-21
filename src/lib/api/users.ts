import { apiRequest } from './client';

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  roles: Array<{
    id: string;
    name: string;
    displayName: string;
  }>;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  displayName: string;
  roleIds: string[]; // Array of role IDs to assign
}

export interface UserUpdateRequest {
  email?: string;
  displayName?: string;
  roleIds?: string[]; // Array of role IDs
  isActive?: boolean;
  password?: string; // Optional password update
}

export const usersApi = {
  // GET /api/v1/users - List all users
  list: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ 
    ok: boolean; 
    users: UserResponse[];
    pagination?: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await apiRequest(`/api/v1/users${queryString}`);
    return { ok: response.success, users: response.data, pagination: response.pagination };
  },

  // GET /api/v1/users/:id - Get single user
  getById: async (id: string): Promise<{ ok: boolean; user: UserResponse }> => {
    const response = await apiRequest(`/api/v1/users/${id}`);
    return { ok: response.success, user: response.data };
  },

  // POST /api/v1/users - Create new user
  create: async (data: UserCreateRequest): Promise<{ ok: boolean; user: UserResponse; message: string }> => {
    const response = await apiRequest('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { ok: response.success, user: response.data, message: response.message };
  },

  // PUT /api/v1/users/:id - Update user
  update: async (id: string, data: UserUpdateRequest): Promise<{ ok: boolean; user: UserResponse; message: string }> => {
    const response = await apiRequest(`/api/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { ok: response.success, user: response.data, message: response.message };
  },

  // DELETE /api/v1/users/:id - Delete user (kept for compatibility, but not implemented in backend)
  delete: async (id: string): Promise<{ ok: boolean; message: string }> => {
    const response = await apiRequest(`/api/v1/users/${id}`, {
      method: 'DELETE',
    });
    return { ok: response.success, message: response.message };
  },

  // PUT /api/v1/users/:id/roles - Replace all user roles
  setRoles: async (id: string, roleIds: string[]): Promise<{ ok: boolean; message: string }> => {
    const response = await apiRequest(`/api/v1/users/${id}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ roleIds }),
    });
    return { ok: response.success, message: response.message };
  },

  // POST /api/v1/users/:id/change-password - Change password
  changePassword: async (id: string, currentPassword: string, newPassword: string): Promise<{ ok: boolean; message: string }> => {
    const response = await apiRequest(`/api/v1/users/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return { ok: response.success, message: response.message };
  },
};