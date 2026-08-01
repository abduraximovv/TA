import { redirect } from "next/navigation";

// This page used to run a fake, simulated phone/OTP flow (setTimeout "success", no real
// credential check) that redirected straight into the Provider App dashboard -- a real
// security hole, not just a styling issue. Real phone/OTP auth requires Supabase phone auth
// with an SMS provider (e.g. Twilio) configured in the Supabase dashboard first; until that's
// set up, providers sign in the same way everyone else does.
export default function ProviderAccessPage() {
  redirect("/auth/login");
}
