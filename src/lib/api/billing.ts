import { apiRequest } from './client';
import type { BillingRecordFilters } from '../types';

export interface MarkAsPaidRequest {
  paymentMethod: string;
  paymentReference?: string;
}

export const billingRecordsApi = {
  // GET /api/v1/billing-records - List all billing records
  getAll: async (filters?: BillingRecordFilters): Promise<{ 
    ok: boolean; 
    records?: any[]; 
    pagination?: { total: number; page: number; limit: number; totalPages: number };
    error?: string 
  }> => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.enterpriseId && filters.enterpriseId !== 'all') params.append('enterpriseId', filters.enterpriseId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiRequest(`/api/v1/billing-records${query}`);
    return { ok: response.ok ?? true, records: response.records || [], pagination: response.pagination, error: response.error };
  },

  // GET /api/v1/billing-records/:id - Get billing record details
  getById: async (id: string): Promise<{ 
    ok: boolean; 
    record?: any; 
    error?: string 
  }> => {
    return apiRequest(`/api/v1/billing-records/${id}`);
  },

  // GET /api/v1/billing-records/stats - Get billing statistics
  getStats: async (): Promise<{ 
    ok: boolean; 
    stats?: any; 
    error?: string 
  }> => {
    return apiRequest('/api/v1/billing-records/stats');
  },

  // PUT /api/v1/billing-records/:id/pay - Mark as paid
  markAsPaid: async (id: string, data: MarkAsPaidRequest): Promise<{ 
    ok: boolean; 
    record?: any; 
    error?: string 
  }> => {
    return apiRequest(`/api/v1/billing-records/${id}/pay`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // POST /api/v1/billing-records/:id/invoice - Generate invoice PDF
  generateInvoice: async (id: string): Promise<{ 
    ok: boolean; 
    url?: string; 
    error?: string 
  }> => {
    return apiRequest(`/api/v1/billing-records/${id}/invoice`, {
      method: 'POST'
    });
  }
};