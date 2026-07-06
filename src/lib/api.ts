// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

import type { BillingRecordFilters } from './types';

// Get token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// API Request wrapper with auth
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add existing headers from options
  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  // Debug logging
  console.log('API Response:', { 
    endpoint, 
    status: response.status, 
    statusText: response.statusText,
    ok: response.ok,
    data 
  });

  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`);
  }

  return data;
}

// ==========================================
// AUTH API
// ==========================================

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
    
    // Backend returns data directly: {userId, email, displayName, role, token}
    // Transform it to match our expected format
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.userId,
        email: data.email,
        displayName: data.displayName,
        role: data.role // ✅ Add role to stored user
      }));
      
      // Return in expected format
      return {
        success: true,
        data: {
          user: {
            id: data.userId,
            email: data.email,
            displayName: data.displayName
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

// ==========================================
// PACKAGE API
// ==========================================

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
  list: async (includeInactive = false): Promise<{ ok: boolean; packages?: BillingPackage[]; error?: string }> => {
    return apiRequest(`/api/v1/packages?includeInactive=${includeInactive}`);
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

// ==========================================
// ENTERPRISE API
// ==========================================

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
  list: async (): Promise<{ ok: boolean; enterprises: EnterpriseResponse[] }> => {
    return apiRequest('/api/v1/enterprises');
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


// ==========================================
// ROLES API (RBAC)
// ==========================================

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

// ==========================================
// PERMISSIONS API (RBAC)
// ==========================================

export const permissionsApi = {
  // GET /api/v1/permissions - List all permissions
  list: async (): Promise<{ ok: boolean; permissions: Permission[] }> => {
    const response = await apiRequest('/api/v1/permissions');
    return { ok: response.success, permissions: response.data };
  },
};

// ==========================================
// USERS API (RBAC)
// ==========================================

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
  list: async (): Promise<{ ok: boolean; users: UserResponse[] }> => {
    const response = await apiRequest('/api/v1/users');
    return { ok: response.success, users: response.data };
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

// ==========================================
// IMAGE UPLOAD API
// ==========================================

export const uploadApi = {
  // Upload enterprise logo
  uploadLogo: async (file: File): Promise<{ 
    ok: boolean; 
    data: {
      filename: string;
      logoUrl: string;
      storagePath: string;
      size: number;
      mimetype: string;
    }
  }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/uploads/logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    
    console.log('Upload Response:', { 
      status: response.status, 
      ok: response.ok,
      data 
    });

    if (!response.ok) {
      throw new Error(data.error || `Upload failed: ${response.status}`);
    }

    return data;
  },

  // Delete logo
  deleteLogo: async (storagePath: string): Promise<{ ok: boolean; message: string }> => {
    return apiRequest('/api/v1/uploads/logo', {
      method: 'DELETE',
      body: JSON.stringify({ storagePath })
    });
  },

  // Get full logo URL
  getLogoUrl: (logoUrl: string): string => {
    if (!logoUrl) return '';
    if (logoUrl.startsWith('http')) return logoUrl;
    return `${API_BASE_URL}${logoUrl}`;
  }
};

// ==========================================
// ERROR HANDLER
// ==========================================

export function handleApiError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// ==========================================
// PROFILE API
// ==========================================

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

// ==========================================
// AUDIT LOGS API
// ==========================================

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
  }
};


// ==========================================
// SUBSCRIPTION API
// ==========================================

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

// ==========================================
// BILLING RECORDS API
// ==========================================

export interface MarkAsPaidRequest {
  paymentMethod: string;
  paymentReference?: string;
}

export const billingRecordsApi = {
  // GET /api/v1/billing-records - List all billing records
  getAll: async (filters?: BillingRecordFilters): Promise<{ 
    ok: boolean; 
    records?: any[]; 
    error?: string 
  }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.enterpriseId) params.append('enterpriseId', filters.enterpriseId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/v1/billing-records${query}`);
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
    message?: string;
    error?: string 
  }> => {
    return apiRequest(`/api/v1/billing-records/${id}/pay`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // PUT /api/v1/billing-records/:id/status - Update status
  updateStatus: async (id: string, status: string): Promise<{ 
    ok: boolean; 
    record?: any; 
    message?: string;
    error?: string 
  }> => {
    return apiRequest(`/api/v1/billing-records/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // GET /api/v1/enterprises/:id/billing-records - Get enterprise billing records
  getEnterpriseRecords: async (enterpriseId: string): Promise<{ 
    ok: boolean; 
    records?: any[]; 
    error?: string 
  }> => {
    return apiRequest(`/api/v1/enterprises/${enterpriseId}/billing-records`);
  },

  // POST /api/v1/billing-records/check-overdue - Check overdue (admin only)
  checkOverdue: async (): Promise<{ 
    ok: boolean; 
    message?: string;
    updatedCount?: number;
    error?: string 
  }> => {
    return apiRequest('/api/v1/billing-records/check-overdue', {
      method: 'POST',
    });
  },
};


