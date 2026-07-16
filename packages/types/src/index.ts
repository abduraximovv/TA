export interface UserProfile {
  id: string;
  role: "tourist" | "provider" | "agency" | "admin";
  email: string;
  fullName: string;
}
