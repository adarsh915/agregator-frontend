import { apiRequest } from './client';

export interface BillingPackage {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackageCreateRequest {
  name: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isActive?: boolean;
}

export const packageApi = {
  list: async (params?: { includeInactive?: boolean; page?: number; limit?: number; search?: string }): Promise<{ 
    ok: boolean; 
    packages?: BillingPackage[]; 
    pagination?: { total: number; page: number; limit: number; totalPages: number };
    error?: string;
  }> => {
    const query = new URLSearchParams();
    if (params?.includeInactive !== undefined) {
      query.append('includeInactive', params.includeInactive.toString());
    }
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await apiRequest(`/api/v1/packages${queryString}`);
    return { ok: response.ok ?? true, packages: response.packages || [], pagination: response.pagination, error: response.error };
  },

  get: async (id: string): Promise<{ ok: boolean; package?: BillingPackage; error?: string }> => {
    return apiRequest(`/api/v1/packages/${id}`);
  },

  create: async (data: PackageCreateRequest): Promise<{ ok: boolean; package?: BillingPackage; error?: string }> => {
    return apiRequest('/api/v1/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<PackageCreateRequest>): Promise<{ ok: boolean; package?: BillingPackage; error?: string }> => {
    return apiRequest(`/api/v1/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deactivate: async (id: string): Promise<{ ok: boolean; error?: string }> => {
    return apiRequest(`/api/v1/packages/${id}`, {
      method: 'DELETE',
    });
  },
};