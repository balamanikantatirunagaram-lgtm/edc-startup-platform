import { createClient } from "@supabase/supabase-js"
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SECRET_KEY || ""

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function run() {
  let allStudents: Array<{ id: string; name?: string; niat_id?: string }> = []
  let from = 0
  const limit = 1000
  
  while (true) {
    const { data: students, error } = await supabaseAdmin.from('students').select('*').range(from, from + limit - 1)
    if (error) {
      console.error("Error fetching students:", error)
      return
    }
    if (!students || students.length === 0) break
    
    allStudents = allStudents.concat(students)
    from += limit
    
    if (students.length < limit) break
  }

  console.log(`Found ${allStudents.length} students in total. Resetting passwords...`)

  let successCount = 0
  let errorCount = 0

  for (const student of allStudents) {
    if (!student.name || !student.niat_id) {
      console.log(`Skipping ${student.id} due to missing name or niat_id`)
      continue
    }

    try {
      // First 4 letters in capital
      const namePart = student.name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase().padEnd(4, 'X')
      
      // Last four digits of niat
      const niatStr = String(student.niat_id).replace(/[^a-zA-Z0-9]/g, '')
      const niatPart = niatStr.substring(niatStr.length - 4)

      const newPassword = `${namePart}${niatPart}`

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        student.id,
        { password: newPassword }
      )

      if (updateError) {
        console.error(`Failed to update ${student.niat_id}: ${updateError.message}`)
        errorCount++
      } else {
        successCount++
      }
    } catch (e) {
      console.error(`Error processing ${student.niat_id}:`, e)
      errorCount++
    }
  }

  console.log(`\nFinished! Success: ${successCount}, Errors: ${errorCount}`)
}

run()
