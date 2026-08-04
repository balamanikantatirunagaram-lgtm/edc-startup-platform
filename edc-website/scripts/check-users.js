const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Missing keys");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 10 });
  if (error) {
    console.error(error);
  } else {
    data.users.forEach(u => {
      if (u.user_metadata?.niat_id) {
        const name = u.user_metadata.name;
        const niatId = u.user_metadata.niat_id;
        const namePrefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
        const idSuffix = niatId.slice(-4);
        const password = `${namePrefix}${idSuffix}`;
        console.log(`NIAT ID: ${niatId}, Password: ${password}`);
      }
    });
  }
}
run();
