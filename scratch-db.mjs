import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({ path: "web-admin/.env.local" })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)
const { data, error } = await supabase.from('gamification_points').select('*, student_profiles(*)')
console.log(error)
