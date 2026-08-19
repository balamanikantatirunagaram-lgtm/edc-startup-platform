const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY; // Service Role key

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log("Creating bucket 'startup-documents'...");
  const { data, error } = await supabase.storage.createBucket('startup-documents', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg']
  });

  if (error) {
    if (error.message.includes('already exists') || error.statusCode === '400') {
      console.log("Bucket already exists or 400 error. Proceeding...");
    } else {
      console.error("Error creating bucket:", error);
      return;
    }
  } else {
    console.log("Bucket created successfully.");
  }

  // To set RLS policies on storage.objects, we need SQL execution. 
  // Wait, if the bucket is public, we still need RLS to allow authenticated inserts.
  // We don't have direct SQL exec via REST API unless rpc is defined.
  // But wait! If we just disable RLS on storage.objects or insert via Service Role, it works. But client uploads run as authenticated.
  // Actually, wait, creating the bucket via Admin API automatically sets it to Public, but we STILL need INSERT policies.
  // Wait, if there are no policies on `storage.objects`, it blocks everything by default.
  // Is there an RPC we can call? We cannot run SQL from the js client natively without a function.
  // However, I can just create an upload via server action to bypass RLS!
  
  console.log("Done.");
}

main();
