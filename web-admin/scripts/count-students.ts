import { createClient } from "@supabase/supabase-js"
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SECRET_KEY || ""

const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { count, error } = await supabaseAdmin.from('students').select('*', { count: 'exact', head: true })
  console.log("Total students:", count)
}
run()
