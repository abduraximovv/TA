export interface ProviderVerification {
  id: string;
  user_id: string;
  business_name: string;
  role: 'provider' | 'agency';
  status: 'pending' | 'approved' | 'rejected';
  documents_url: string;
  created_at: string;
  email?: string; // We'll mock this for now or fetch it if available
}
