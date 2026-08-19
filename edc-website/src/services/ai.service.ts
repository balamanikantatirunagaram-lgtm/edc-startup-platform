"use server"

import { getAuthenticatedSupabase } from "@/lib/supabase/client"

export async function getAiPrompts() {
  const supabase = await getAuthenticatedSupabase()
  const { data, error } = await supabase
    .from('ai_prompts')
    .select('*')
  
  if (error) {
    console.error('Error fetching AI prompts:', error)
    return { prompts: [] }
  }
  return { prompts: data }
}

export async function chatWithAI(messages: {role: string, content: string}[]) {
  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content: "You are the EDC Startup Assistant. Help students with their pitches, ideation, and business models."
          },
          ...messages.map(m => ({
            role: m.role === 'ai' ? 'assistant' : m.role,
            content: m.content
          }))
        ],
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      console.error("AI API Error:", await response.text());
      return { error: "Failed to communicate with AI." };
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
  } catch (err: any) {
    console.error("AI request failed:", err);
    return { error: err.message };
  }
}
