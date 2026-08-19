const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLS() {
  console.log("Testing RLS on gamification_points...");
  
  // We don't have a user JWT, but using anon key to insert should FAIL if RLS is enabled.
  // Wait, standard user role means 'authenticated'. We need to log in or sign up a dummy user to test.
  
  const dummyEmail = `test_${Date.now()}@test.com`;
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: dummyEmail,
    password: 'password123'
  });
  
  if (authErr) {
    console.error("Auth error:", authErr.message);
    return;
  }
  
  console.log("Created test user:", authData.user.id);
  
  const { error } = await supabase
    .from('gamification_points')
    .insert([{ 
      student_id: authData.user.id, 
      points: 1000, 
      reason: 'Hacking the mainframe' 
    }]);

  if (error) {
    console.log("✅ RLS SUCCESS: Insert blocked by RLS.");
    console.log("Error message:", error.message);
  } else {
    console.log("❌ RLS FAILURE: Insert succeeded! RLS is NOT enforcing the policy.");
  }
  
  // Clean up if we had service key, but we don't.
}

testRLS();
