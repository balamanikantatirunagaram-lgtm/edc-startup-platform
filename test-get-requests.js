const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'edc-website/.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

async function check() {
  const leaderId = '45511b69-e801-44a1-b44e-e2beedd2c540';
  
  const { data: member } = await supabaseAdmin
      .from('team_members')
      .select('team_id')
      .eq('student_id', leaderId)
      .eq('status', 'approved')
      .limit(1)
      .maybeSingle();

  console.log("Member:", member);
  
  if (member) {
      const { data: requests, error: reqError } = await supabaseAdmin
        .from('team_members')
        .select('*')
        .eq('team_id', member.team_id)
        .in('status', ['pending', 'invited'])
      
      console.log("Requests:", requests);
  }
}

check();
