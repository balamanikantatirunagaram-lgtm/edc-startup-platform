const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'edc-website/.env.local' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

async function check() {
  const leaderId = '45511b69-e801-44a1-b44e-e2beedd2c540';
  const { data: team, error } = await supabase.from('teams').select('id').eq('leader_id', leaderId).single();
  console.log("Team:", team);
  console.log("Error:", error);
}

check();
