require('dotenv').config({ path: 'web-admin/.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
  const { data, error } = await supabase
      .from('startups')
      .select('*, teams!startups_team_id_fkey(name, leader_id)')
  console.log("Startups length:", data ? data.length : 0);
  console.log("Error:", error);
}
test();
