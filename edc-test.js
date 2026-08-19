const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'edc-website/.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

async function check() {
  const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job_postings!inner(id, title, startup_id),
        students(id, name, email, phone, department, academic_year)
      `)
      .eq('job_postings.startup_id', 'ceeb17b8-15cf-42ec-a0df-269e802de29e') // some startup ID, but let's just get all
  console.log("Job Applications in edc:", data);
  if (error) console.error("Error in edc query:", error);
}

check();
