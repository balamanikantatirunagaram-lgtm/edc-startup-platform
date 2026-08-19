const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'edc-website/.env.local' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

async function check() {
  const { data: members, error } = await supabase.from('team_members').select('*');
  console.log("All Team Members:");
  console.log(members);
  
  if (error) console.error(error);
}

check();
