const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('web-admin/.env.local', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SECRET_KEY);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: 'ALTER TABLE public.funding_opportunities ADD COLUMN IF NOT EXISTS link TEXT;' });
  if (error) {
    console.error("RPC exec_sql failed, trying direct REST or alternative...", error);
    // If exec_sql doesn't exist, we can't run arbitrary SQL this way.
  } else {
    console.log("Success via RPC");
  }
}
run();
