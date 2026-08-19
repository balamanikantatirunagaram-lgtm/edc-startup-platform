import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({ path: "web-admin/.env.local" })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)
const { data: { user } } = await supabase.auth.admin.getUserById('45511b69-e801-44a1-b44e-e2beedd2c540')
console.log(user.user_metadata)
