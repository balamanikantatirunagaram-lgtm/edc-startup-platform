const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || SUPABASE_SECRET_KEY.includes('••••')) {
  console.error("Error: Valid SUPABASE_SECRET_KEY is required in .env.local to upload users.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function uploadUsers() {
  const csvFile = fs.readFileSync(path.resolve(__dirname, '../stdata.csv'), 'utf8');
  
  const parsed = Papa.parse(csvFile, {
    skipEmptyLines: true,
  });

  const students = parsed.data
    .filter(row => row.length >= 2 && !row[1].includes('NIAT ID')) // Skip header
    .map(row => {
      const name = row[0].trim();
      const niatId = row[1].trim();
      const namePrefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
      const idSuffix = niatId.slice(-4);
      const password = `${namePrefix}${idSuffix}`;
      const email = `${niatId.toLowerCase()}@student.tartup.local`;
      
      return { name, niatId, password, email };
    });

  console.log(`Found ${students.length} students to upload.`);
  let success = 0;
  let errors = 0;

  for (const student of students) {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: student.email,
        password: student.password,
        email_confirm: true,
        user_metadata: {
          niat_id: student.niatId,
          name: student.name,
          is_first_login: true,
        }
      });

      if (authError) {
        if (authError.message.includes('already exists') || authError.status === 422) {
          success++;
        } else {
          console.error(`Auth Error for ${student.niatId}:`, authError.message);
          errors++;
        }
        continue;
      }

      success++;
      
      if (success % 100 === 0) console.log(`Processed ${success} students...`);
    } catch (err) {
      console.error(`Unexpected error for ${student.niatId}:`, err);
      errors++;
    }
  }

  console.log(`Upload complete. Success: ${success}, Errors: ${errors}`);
}

uploadUsers();
