require('dotenv').config({ path: 'web-admin/.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
  const { data: startups, error } = await supabase
      .from('startups')
      .select(`
        *,
        teams (
          name,
          leader_id
        )
      `)
  console.log("Startups length:", startups ? startups.length : 0);
  console.log("Startups:", JSON.stringify(startups, null, 2));
  console.log("Error:", error);
}
test();
