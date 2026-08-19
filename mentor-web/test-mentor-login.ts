import { login } from "./src/services/auth.service";
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

async function main() {
  try {
    const res = await login("mentor1", "password");
    console.log("Result:", res);
  } catch (e) {
    console.error("Caught exception:", e);
  }
}
main();
