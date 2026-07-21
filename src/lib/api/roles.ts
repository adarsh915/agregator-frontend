import { apiRequest } from './client';

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  resource: string;
  action: string;
  createdAt: string;
}

export interface RolePermissionAssignment {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  resource: string;
  action: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissionCount?: number;
  permissions?: RolePermissionAssignment[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface RoleCreateRequest {
  name: string;
  displayName: string;
  description?: string;
  permissionIds: string[];
}

export interface RoleUpdateRequest {
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

export const rolesApi = {
  // GET /api/v1/roles - List all roles
  list: async (): Promise<{ ok: boolean; roles: RoleResponse[] }> => {
    const response = await apiRequest('/api/v1/roles');
    return { ok: response.success, roles: response.data };
  },

  // GET /api/v1/roles/:id - Get single role with permissions
  getById: async (id: string): Promise<{ ok: boolean; role: RoleResponse }> => {
    const response = await apiRequest(`/api/v1/roles/${id}`);
    return { ok: response.success, role: response.data };
  },

  // POST /api/v1/roles - Create new role
  create: async (data: RoleCreateRequest): Promise<{ ok: boolean; role: RoleResponse }> => {
    const response = await apiRequest('/api/v1/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { ok: response.success, role: response.data };
  },

  // PUT /api/v1/roles/:id - Update role
  update: async (id: string, data: RoleUpdateRequest): Promise<{ ok: boolean; role: RoleResponse }> => {
    const response = await apiRequest(`/api/v1/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { ok: response.success, role: response.data };
  },

  // PUT /api/v1/roles/:id/permissions - Update role permissions
  updatePermissions: async (id: string, permissionIds: string[]): Promise<{ ok: boolean; message: string }> => {
    const response = await apiRequest(`/api/v1/roles/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissionIds }),
    });
    return { ok: response.success, message: response.message };
  },

  // DELETE /api/v1/roles/:id - Delete role
  delete: async (id: string): Promise<{ ok: boolean; message: string }> => {
    const response = await apiRequest(`/api/v1/roles/${id}`, {
      method: 'DELETE',
    });
    return { ok: response.success, message: response.message };
  },
};