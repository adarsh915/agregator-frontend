import { Role, InternalUser, Enterprise, Detection, NotificationItem } from "./types";

// Roles are now loaded from backend - no mock data
export const INITIAL_ROLES: Role[] = [];

// Users are now loaded from backend - no mock data
export const INITIAL_USERS: InternalUser[] = [];

export const INITIAL_ENTERPRISES: Enterprise[] = [];

export const INITIAL_DETECTIONS: Detection[] = [
  { id: 1, enterpriseName: "Tata Consultancy Services Ltd", enterpriseLogo: "TCS", detectionType: "PII Leak", severity: "High", timestamp: "2026-07-03 10:45:22", status: "Pending" },
  { id: 2, enterpriseName: "HDFC Bank Limited", enterpriseLogo: "HDF", detectionType: "Credential Leak", severity: "High", timestamp: "2026-07-03 10:20:11", status: "Pending" },
  { id: 3, enterpriseName: "Reliance Industries Limited", enterpriseLogo: "RIL", detectionType: "SQL Injection", severity: "High", timestamp: "2026-07-03 09:15:00", status: "Reviewed" },
  { id: 4, enterpriseName: "Infosys Limited", enterpriseLogo: "INF", detectionType: "Prompt Injection", severity: "Medium", timestamp: "2026-07-03 08:34:12", status: "Pending" },
  { id: 5, enterpriseName: "Swiggy India (Bundl Technologies)", enterpriseLogo: "SWI", detectionType: "PII Sharing", severity: "Low", timestamp: "2026-07-03 07:12:44", status: "Reviewed" },
  { id: 6, enterpriseName: "Zomato Private Limited", enterpriseLogo: "ZOM", detectionType: "PII Leak", severity: "High", timestamp: "2026-07-02 23:50:18", status: "Pending" },
  { id: 7, enterpriseName: "Tata Consultancy Services Ltd", enterpriseLogo: "TCS", detectionType: "Credential Leak", severity: "High", timestamp: "2026-07-02 21:05:00", status: "Reviewed" },
  { id: 8, enterpriseName: "Paytm Operations (One97)", enterpriseLogo: "PAY", detectionType: "SQL Injection", severity: "Medium", timestamp: "2026-07-02 17:40:22", status: "Reviewed" },
  { id: 9, enterpriseName: "HDFC Bank Limited", enterpriseLogo: "HDF", detectionType: "Prompt Injection", severity: "High", timestamp: "2026-07-02 14:10:05", status: "Pending" },
  { id: 10, enterpriseName: "Zepto Delivery (KiranaKart)", enterpriseLogo: "ZEP", detectionType: "PII Sharing", severity: "Low", timestamp: "2026-07-02 11:25:30", status: "Reviewed" },
  { id: 11, enterpriseName: "Reliance Industries Limited", enterpriseLogo: "RIL", detectionType: "PII Leak", severity: "Medium", timestamp: "2026-07-02 09:05:12", status: "Reviewed" },
  { id: 12, enterpriseName: "Infosys Limited", enterpriseLogo: "INF", detectionType: "Credential Leak", severity: "High", timestamp: "2026-07-01 18:30:19", status: "Reviewed" },
  { id: 13, enterpriseName: "Zomato Private Limited", enterpriseLogo: "ZOM", detectionType: "Prompt Injection", severity: "Medium", timestamp: "2026-07-01 16:15:00", status: "Reviewed" },
  { id: 14, enterpriseName: "Swiggy India (Bundl Technologies)", enterpriseLogo: "SWI", detectionType: "SQL Injection", severity: "Medium", timestamp: "2026-07-01 14:02:55", status: "Pending" },
  { id: 15, enterpriseName: "Paytm Operations (One97)", enterpriseLogo: "PAY", detectionType: "PII Sharing", severity: "Low", timestamp: "2026-07-01 10:45:00", status: "Reviewed" },
  { id: 16, enterpriseName: "HDFC Bank Limited", enterpriseLogo: "HDF", detectionType: "PII Leak", severity: "High", timestamp: "2026-06-30 16:22:44", status: "Reviewed" },
  { id: 17, enterpriseName: "Tata Consultancy Services Ltd", enterpriseLogo: "TCS", detectionType: "SQL Injection", severity: "Low", timestamp: "2026-06-30 11:30:00", status: "Reviewed" },
  { id: 18, enterpriseName: "Reliance Industries Limited", enterpriseLogo: "RIL", detectionType: "Prompt Injection", severity: "High", timestamp: "2026-06-30 08:15:10", status: "Reviewed" },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, title: "Critical PII Leak Onboarded", detail: "Tata Consultancy Services reported a High Severity PII Leak.", time: "12m ago", read: false, tone: "danger" },
  { id: 2, title: "New Enterprise Subscribed", detail: "Zepto Delivery has completed payment for Basic plan.", time: "2h ago", read: false, tone: "safe" },
  { id: 3, title: "HDFC Bank Alert", detail: "Blocked credential injection from unverified IP block.", time: "4h ago", read: true, tone: "warn" },
  { id: 4, title: "Billing Suspended", detail: "Paytm subscription billing cycle renewal failed.", time: "1d ago", read: true, tone: "info" },
];

export const MONTHLY_REVENUE_TREND = [
  { month: "Jan", revenue: 540000 },
  { month: "Feb", revenue: 620000 },
  { month: "Mar", revenue: 710000 },
  { month: "Apr", revenue: 950000 },
  { month: "May", revenue: 1120000 },
  { month: "Jun", revenue: 1450000 },
];
