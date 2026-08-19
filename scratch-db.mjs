import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({ path: "web-admin/.env.local" })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)
const { data, error } = await supabase.from('investor_profiles').select('*').limit(0)
console.log(data, error)
const { data: d2, error: e2 } = await supabase.from('incubator_profiles').select('*').limit(0)
console.log(d2, e2)
