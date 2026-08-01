require('dotenv').config({ path: './edc-website/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

async function test() {
  console.log('Testing with ANON key...');
  const anonClient = createClient(url, anonKey);
  const { data: anonData, error: anonError } = await anonClient.from('events').select('*');
  console.log('Anon Error:', anonError);
  console.log('Anon Data length:', anonData ? anonData.length : 0);

  console.log('\nTesting with SECRET key...');
  const secretClient = createClient(url, secretKey);
  const { data: secretData, error: secretError } = await secretClient.from('events').select('*');
  console.log('Secret Error:', secretError);
  console.log('Secret Data length:', secretData ? secretData.length : 0);
}

test();
