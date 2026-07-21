import { apiRequest } from './client';

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorEmail: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  httpMethod: string;
  httpPath: string;
  ipAddress: string;
  userAgent: string;
  oldValues: any;
  newValues: any;
  status: 'success' | 'failed';
  errorMessage: string | null;
  createdAt: string;
}

export interface AuditLogActor {
  id: string;
  email: string;
  name: string;
}

export interface AuditLogFilters {
  action?: string;
  actorId?: string;
  resourceType?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const auditLogsApi = {
  // GET /api/v1/audit-logs
  list: async (filters: AuditLogFilters = {}): Promise<{
    success: boolean;
    data: AuditLogEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const params = new URLSearchParams();
    if (filters.action) params.append('action', filters.action);
    if (filters.actorId) params.append('actorId', filters.actorId);
    if (filters.resourceType) params.append('resourceType', filters.resourceType);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/v1/audit-logs${query}`);
  },

  // GET /api/v1/audit-logs/actors
  getActors: async (): Promise<{ success: boolean; data: AuditLogActor[] }> => {
    return apiRequest('/api/v1/audit-logs/actors');
  },

  // GET /api/v1/audit-logs/actions
  getActions: async (): Promise<{ success: boolean; data: string[] }> => {
    return apiRequest('/api/v1/audit-logs/actions');
  },
};