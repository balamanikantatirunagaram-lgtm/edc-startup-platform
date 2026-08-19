import { login } from "./src/services/auth.service";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  try {
    const res = await login("EdcAdmin", "Niat@2025");
    console.log("Result:", res);
  } catch (e) {
    console.error("Caught exception:", e);
  }
}
main();
