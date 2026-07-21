import { apiRequest } from './client';

export interface EnterpriseCreateRequest {
  name: string;
  logoUrl?: string;
  logoStoragePath?: string;
  generalPhone?: string;
  generalEmail: string;
  apiUrl?: string;
  gstinNumber: string;
  panNumber: string;
  hqStreet?: string;
  hqCity?: string;
  hqState?: string;
  hqPincode?: string;
  status?: 'active' | 'inactive' | 'suspended';
  billingPlan?: 'starter' | 'professional' | 'enterprise';
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';
  billingAmount?: number;
  nextBillingDate?: string;
  contactName: string;
  contactDesignation?: string;
  contactEmail: string;
  contactPhone?: string;
}

export interface EnterpriseUpdateRequest {
  name?: string;
  logoUrl?: string;
  logoStoragePath?: string;
  generalPhone?: string;
  generalEmail?: string;
  apiUrl?: string;
  gstinNumber?: string;
  panNumber?: string;
  hqStreet?: string;
  hqCity?: string;
  hqState?: string;
  hqPincode?: string;
  status?: 'active' | 'inactive' | 'suspended';
  billingPlan?: 'starter' | 'professional' | 'enterprise';
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';
  billingAmount?: number;
  nextBillingDate?: string;
  contactName?: string;
  contactDesignation?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface EnterpriseResponse {
  id: string;
  name: string;
  logoUrl?: string;
  logoStoragePath?: string;
  generalPhone?: string;
  generalEmail: string;
  apiUrl?: string;
  gstinNumber: string;
  panNumber: string;
  hqStreet?: string;
  hqCity?: string;
  hqState?: string;
  hqPincode?: string;
  status: 'active' | 'inactive' | 'suspended';
  packageId?: string;
  billingPlan: 'starter' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  billingAmount: number;
  nextBillingDate?: string;
  contactName: string;
  contactDesignation?: string;
  contactEmail: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface EnterpriseStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  mrr: number;
  planCounts: { starter: number; professional: number; enterprise: number };
  revenueByPlan: { starter: number; professional: number; enterprise: number };
  trend: { labels: string[]; onboarded: number[] };
}

export const enterpriseApi = {
  // GET /api/v1/enterprises - List all enterprises
  list: async (params?: { page?: number; limit?: number; search?: string; status?: string; billingPlan?: string }): Promise<{ 
    ok: boolean; 
    enterprises: EnterpriseResponse[];
    pagination?: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.billingPlan) query.append('billingPlan', params.billingPlan);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/api/v1/enterprises${queryString}`);
  },

  // GET /api/v1/enterprises/stats - Dashboard aggregated stats
  getStats: async (): Promise<{ ok: boolean; stats: EnterpriseStats }> => {
    return apiRequest('/api/v1/enterprises/stats');
  },

  // GET /api/v1/enterprises/:id - Get single enterprise
  getById: async (id: string): Promise<{ ok: boolean; enterprise: EnterpriseResponse }> => {
    return apiRequest(`/api/v1/enterprises/${id}`);
  },

  // POST /api/v1/enterprises - Create new enterprise
  create: async (data: EnterpriseCreateRequest): Promise<{ ok: boolean; enterprise?: EnterpriseResponse; error?: string }> => {
    return apiRequest('/api/v1/enterprises', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT /api/v1/enterprises/:id - Update enterprise
  update: async (id: string, data: EnterpriseUpdateRequest): Promise<{ ok: boolean; enterprise?: EnterpriseResponse; error?: string }> => {
    return apiRequest(`/api/v1/enterprises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // DELETE /api/v1/enterprises/:id - Soft delete enterprise
  delete: async (id: string): Promise<{ ok: boolean; message: string }> => {
    return apiRequest(`/api/v1/enterprises/${id}`, {
      method: 'DELETE',
    });
  },

  // POST /api/v1/enterprises/:id/restore - Restore deleted enterprise
  restore: async (id: string): Promise<{ ok: boolean; message: string }> => {
    return apiRequest(`/api/v1/enterprises/${id}/restore`, {
      method: 'POST',
    });
  },
};