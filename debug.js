const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'edc-website/.env.local' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

async function check() {
  const { data: teamMembers, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('status', 'pending');
  console.log("Pending requests:", teamMembers);
  
  if (teamMembers && teamMembers.length > 0) {
    const teamId = teamMembers[0].team_id;
    const { data: team } = await supabase.from('teams').select('*').eq('id', teamId).single();
    console.log("Team details:", team);
    
    // Simulate what the leader sees:
    const leaderId = team.leader_id;
    const { data: leaderTeams } = await supabase.from('teams').select('id').eq('leader_id', leaderId);
    console.log("Teams for leader:", leaderTeams);
  }
}

check();
