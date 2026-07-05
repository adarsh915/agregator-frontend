export interface Enterprise {
  id: string;  // UUID from backend
  logoUrl?: string;
  logoStoragePath?: string;
  name: string;
  hqStreet?: string;
  hqCity?: string;
  hqState?: string;
  hqPincode?: string;
  gstinNumber: string;
  panNumber: string;
  generalEmail: string;
  generalPhone?: string;
  apiUrl?: string;
  contactName: string;
  contactDesignation?: string;
  contactEmail: string;
  contactPhone?: string;
  packageId?: string;
  billingPlan?: string; // Legacy support
  billingCycle: "monthly" | "quarterly" | "yearly";
  billingAmount: number;
  nextBillingDate?: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Detection {
  id: number;
  enterpriseName: string;
  enterpriseLogo: string;
  detectionType: string;
  severity: "High" | "Medium" | "Low";
  timestamp: string;
  status: "Reviewed" | "Pending";
}

export interface InternalUser {
  id: string; // Changed from number to string (UUID)
  name: string;
  email: string;
  phone?: string;
  role: string; // Primary role display (for UI compatibility)
  roles?: string[]; // Multiple role names
  status: "Active" | "Inactive";
  lastLogin: string;
}

export interface RolePermission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: RolePermission[];
  isSystem?: boolean; // System roles cannot be deleted
}

export interface NotificationItem {
  id: number;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  tone: "info" | "warn" | "danger" | "safe";
}

// ==========================================
// SUBSCRIPTION & BILLING TYPES
// ==========================================

export interface Subscription {
  id: string;
  enterpriseId: string;
  enterpriseName?: string;
  packageId: string | null;
  packageName: string;
  billingCycle: "monthly" | "quarterly" | "yearly";
  amountPerCycle: number;
  startDate: string;
  nextBillingDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  status: "active" | "paused" | "cancelled";
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface BillingRecord {
  id: string;
  subscriptionId: string;
  enterpriseId: string;
  enterpriseName?: string;
  periodStart: string;
  periodEnd: string;
  billingCycle: string;
  packageName: string;
  amount: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingRecordFilters {
  status?: "pending" | "paid" | "overdue" | "cancelled";
  enterpriseId?: string;
  startDate?: string;
  endDate?: string;
}

export interface SubscriptionMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  activeSubscriptions: number;
  pausedSubscriptions: number;
  cancelledSubscriptions: number;
}

export interface BillingStats {
  totalRevenue: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  totalRecords: number;
  paidRecords: number;
  pendingRecords: number;
  overdueRecords: number;
}
