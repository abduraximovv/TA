import { getUnifiedVerificationRequests } from "./src/app/actions/verificationActions.ts";
import 'dotenv/config';

async function test() {
  const reqs = await getUnifiedVerificationRequests();
  console.log("Total:", reqs.length);
  console.log("Pending:", reqs.filter(r => r.status === 'pending').length);
  console.log("First Pending:", reqs.find(r => r.status === 'pending'));
}

test();
