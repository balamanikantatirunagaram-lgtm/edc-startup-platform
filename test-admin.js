require('dotenv').config({ path: 'web-admin/.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
  const { data, error } = await supabase.from('startups').select('*');
  console.log("Startups:", data);
  console.log("Error:", error);
}
test();
