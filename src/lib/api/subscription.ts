import { apiRequest } from './client';

export interface SubscriptionUpdateRequest {
  packageId?: string;
  packageName?: string;
  billingCycle?: "monthly" | "quarterly" | "yearly";
  amountPerCycle?: number;
}

export const subscriptionApi = {
  // GET /api/v1/subscriptions/:enterpriseId - Get subscription by enterprise ID
  getByEnterprise: async (enterpriseId: string): Promise<{ 
    ok: boolean; 
    subscription?: any; 
    error?: string 
  }> => {
    return apiRequest(`/api/v1/subscriptions/${enterpriseId}`);
  },

  // PUT /api/v1/subscriptions/:id - Update subscription
  update: async (id: string, data: SubscriptionUpdateRequest): Promise<{ 
    ok: boolean; 
    subscription?: any; 
    message?: string;
    error?: string 
  }> => {
    return apiRequest(`/api/v1/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // GET /api/v1/subscriptions/metrics/all - Get subscription metrics
  getMetrics: async (): Promise<{ 
    ok: boolean; 
    metrics?: any; 
    error?: string 
  }> => {
    return apiRequest('/api/v1/subscriptions/metrics/all');
  },

  // POST /api/v1/subscriptions/:id/pause - Pause subscription
  pause: async (id: string): Promise<{ 
    ok: boolean; 
    subscription?: any; 
    message?: string;
    error?: string 
  }> => {
    return apiRequest(`/api/v1/subscriptions/${id}/pause`, {
      method: 'POST',
    });
  },

  // POST /api/v1/subscriptions/:id/resume - Resume subscription
  resume: async (id: string): Promise<{ 
    ok: boolean; 
    subscription?: any; 
    message?: string;
    error?: string 
  }> => {
    return apiRequest(`/api/v1/subscriptions/${id}/resume`, {
      method: 'POST',
    });
  },

  // POST /api/v1/subscriptions/:id/cancel - Cancel subscription
  cancel: async (id: string): Promise<{ 
    ok: boolean; 
    subscription?: any; 
    message?: string;
    error?: string 
  }> => {
    return apiRequest(`/api/v1/subscriptions/${id}/cancel`, {
      method: 'POST',
    });
  },

  // POST /api/v1/subscriptions/renew - Manual renewal (admin only)
  renewAll: async (): Promise<{ 
    ok: boolean; 
    message?: string;
    renewedCount?: number;
    error?: string 
  }> => {
    return apiRequest('/api/v1/subscriptions/renew', {
      method: 'POST',
    });
  },
};