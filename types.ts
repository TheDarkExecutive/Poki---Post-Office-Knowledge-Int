
export interface User {
  id: string;
  email: string;
  fullName: string;
  badgeId: string;
}

export interface ScannedItem {
  id: string;
  trackingId: string;
  recipientName: string;
  address: string;
  timestamp: string;
  session_id: string;
  status: 'captured' | 'synced';
  pincodeWarning?: string; // New: Stores dictionary mismatch warnings
  translations?: {
    fr: string;
    es: string;
  };
}

export interface ScanningSession {
  id: string;
  startTime: string;
  endTime?: string;
  totalItems: number;
  status: 'active' | 'completed';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
