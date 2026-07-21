import { apiRequest } from './client';
import { Permission } from './roles';

export const permissionsApi = {
  // GET /api/v1/permissions - List all permissions
  list: async (): Promise<{ ok: boolean; permissions: Permission[] }> => {
    const response = await apiRequest('/api/v1/permissions');
    return { ok: response.success, permissions: response.data };
  },
};