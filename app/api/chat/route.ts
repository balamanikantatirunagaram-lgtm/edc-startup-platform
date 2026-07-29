import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Get current user context for the chatbot
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    
    let userContext = 'User is not logged in.'
    let startupContext = 'No startup data.'
    let teamContext = 'No team data.'

    if (token) {
      try {
        const supabase = createClient(
          process.env.SUPABASE_URL || '',
          process.env.SUPABASE_PUBLISHABLE_KEY || '',
          { auth: { persistSession: false, autoRefreshToken: false } }
        )
        const { data: userData } = await supabase.auth.getUser(token)
        const user = userData?.user

        if (user) {
          const name = user.user_metadata?.name || 'Unknown'
          const niatId = user.user_metadata?.niat_id || 'Unknown'
          userContext = `Currently logged in as: ${name} (NIAT ID: ${niatId})`

          // Get team info
          const { data: member } = await supabase
            .from('team_members')
            .select('team_id, status, teams(id, name, code, leader_id)')
            .eq('student_id', user.id)
            .eq('status', 'approved')
            .maybeSingle()

          if (member?.teams) {
            const team: any = member.teams
            const isLeader = team.leader_id === user.id
            teamContext = `Team: ${team.name}, Code: ${team.code}, Role: ${isLeader ? 'Team Leader' : 'Team Member'}`

            const { data: startup } = await supabase
              .from('startups')
              .select('*')
              .eq('team_id', team.id)
              .maybeSingle()

            if (startup) {
              startupContext = `Startup: ${startup.name}, Stage: ${startup.stage || 'N/A'}, Industry: ${startup.industry || 'N/A'}, Status: ${startup.status || 'N/A'}, Problem: ${startup.problem_statement || 'N/A'}, Solution: ${startup.proposed_solution || 'N/A'}`
            }

            // Get tasks
            const { data: tasks } = await supabase
              .from('tasks')
              .select('*')
              .eq('team_id', team.id)

            if (tasks && tasks.length > 0) {
              const taskSummary = tasks.map(t => `${t.title} (${t.status})`).join(', ')
              startupContext += `. Tasks: ${taskSummary}`
            }
          }
        }
      } catch (e) {
        // ignore context errors, still serve chatbot
      }
    }

    const systemPrompt = `You are EDC AI — an intelligent assistant for the EDC (Entrepreneurship Development Cell) Startup Platform at NIAT college.

PLATFORM CONTEXT:
- ${userContext}
- ${teamContext}  
- ${startupContext}

YOUR CAPABILITIES:
- Help students with startup ideas, business models, pitching, and planning
- Answer questions about the EDC platform features (Team Connect, Register Startup, Tasks, Notifications)
- Guide students on forming teams, writing problem statements and solutions
- Provide advice on startup stages: Idea → Prototype → MVP → Traction → Scaling
- Help with funding schemes (Startup India, CGTMSE, Angel investors)
- Advise on pitch deck structure, business model canvas, lean canvas

PLATFORM RULES YOU KNOW:
- Students log in with NIAT ID and default password
- First-time users must change password and set security question
- Students can either Register a Startup (becoming Team Leader) or Join a Team via code/QR/invite
- Team Leaders can assign tasks, invite students, approve/reject join requests
- Once in a team, "Team Connect" disappears from navigation

Be concise, helpful, and encouraging. Use emojis sparingly for warmth. Always refer to yourself as "EDC AI".`

    const nvidiaApiKey = process.env.NVIDIA_API_KEY
    if (!nvidiaApiKey) {
      return NextResponse.json({ error: 'NVIDIA API key not configured.' }, { status: 500 })
    }

    // Use highly optimized Llama 3.1 models for lightning-fast responses
    const modelsToTry = [
      'meta/llama-3.1-70b-instruct',
      'meta/llama-3.1-8b-instruct',
    ]

    let response: Response | null = null
    let lastError = ''

    for (const model of modelsToTry) {
      response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${nvidiaApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
          temperature: 0.6,
          max_tokens: 1024,
          stream: false,
        }),
      })

      if (response.ok) break

      const errText = await response.text()
      lastError = errText
      console.error(`NVIDIA model ${model} failed:`, errText)
      response = null
    }

    if (!response) {
      console.error('All NVIDIA models failed. Last error:', lastError)
      return NextResponse.json({ error: 'AI service error. Please try again.' }, { status: 500 })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error('Chatbot error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
