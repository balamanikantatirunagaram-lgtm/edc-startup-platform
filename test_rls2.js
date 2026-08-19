const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLS() {
  // Test unauthenticated insert
  const { error } = await supabase
    .from('gamification_points')
    .insert([{ student_id: '11111111-1111-1111-1111-111111111111', points: 10000, reason: 'Hacking the mainframe' }]);

  if (error) {
    console.log("✅ RLS SUCCESS: Insert blocked by RLS.");
    console.log("Error details:", error.message);
  } else {
    console.log("❌ RLS FAILURE: Insert succeeded! RLS is NOT enforcing the policy.");
  }
}
testRLS();
