export interface ProviderVerification {
  id: string;
  user_id: string;
  business_name: string;
  role: 'provider' | 'agency';
  status: 'pending' | 'approved' | 'rejected';
  documents_url: string | null;
  phone?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  email?: string;
}
