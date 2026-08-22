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
    let mentoringContext = 'No mentoring data.'

    if (token) {
      try {
        const supabaseAdmin = createClient(
          process.env.SUPABASE_URL || '',
          process.env.SUPABASE_SECRET_KEY || '',
          { auth: { persistSession: false, autoRefreshToken: false } }
        )
        const supabase = createClient(
          process.env.SUPABASE_URL || '',
          process.env.SUPABASE_PUBLISHABLE_KEY || '',
          { auth: { persistSession: false, autoRefreshToken: false } }
        )
        const { data: userData } = await supabase.auth.getUser(token)
        const user = userData?.user

        if (user) {
          const name = user.user_metadata?.name || 'Unknown'
          userContext = `Currently logged in as mentor: ${name}`

          // Get mentored teams
          const { data: activeRequests } = await supabaseAdmin
            .from('mentorship_requests')
            .select('status, teams(id, name)')
            .eq('mentor_id', user.id)

          if (activeRequests && activeRequests.length > 0) {
            const accepted = activeRequests.filter(r => r.status === 'accepted')
            const pending = activeRequests.filter(r => r.status === 'pending')
            const teamNames = accepted.map((r: any) => {
              const t = Array.isArray(r.teams) ? r.teams[0] : r.teams
              return t?.name
            }).filter(Boolean)
            mentoringContext = `Actively mentoring ${accepted.length} team(s): ${teamNames.join(', ') || 'none'}. Pending mentorship requests: ${pending.length}.`
          }
        }
      } catch (e) {
        // ignore context errors, still serve chatbot
      }
    }

    const systemPrompt = `You are EDC AI — an intelligent assistant for the EDC (Entrepreneurship Development Cell) Startup Platform at NIAT college, serving the Mentor Portal.

PLATFORM CONTEXT:
- ${userContext}
- ${mentoringContext}

YOUR CAPABILITIES:
- Help mentors guide student startups on business models, pitching, and product strategy
- Answer questions about the Mentor Portal features (Mentoring Requests, My Startups, Network, Document Center, Funding Applications, Meetings, Messages, Job Board, Learning Hub)
- Provide frameworks for evaluating startups and giving constructive stage-appropriate feedback
- Advise on funding schemes (Startup India, CGTMSE, Angel investors) mentors can point founders to
- Suggest how to structure review sessions and milestone tracking

Be concise, helpful, and professional. Use emojis sparingly. Always refer to yourself as "EDC AI".`

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
