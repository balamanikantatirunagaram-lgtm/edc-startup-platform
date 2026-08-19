import { getCourse } from './web-admin/src/services/learning.service';

async function main() {
  const data = await getCourse("1bbee52e-b674-4873-9844-0d1f9d87f65d");
  console.log("COURSE DATA:", data);
}
main();
