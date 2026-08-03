require('dotenv').config({ path: 'web-admin/.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function getAllStartups() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
  const { data: startups, error } = await supabase
      .from('startups')
      .select('*, teams!startups_team_id_fkey(name, leader_id)');
  if (error) {
    console.error('Error fetching startups:', error);
    return [];
  }
  return startups || [];
}

async function test() {
  const id = "65b9f21b-8a7d-4d41-af6f-707ca3e0a6b3";
  const res = await getAllStartups();
  const found = Array.isArray(res) ? res.find((s) => s.id === id) : undefined;
  console.log("Is array:", Array.isArray(res));
  console.log("Found:", !!found);
  console.log("Data:", found ? found.name : "none");
}
test();
