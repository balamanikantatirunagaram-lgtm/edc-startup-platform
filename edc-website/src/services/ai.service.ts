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
    if (!process.env.NVIDIA_API_KEY) {
      console.warn("NVIDIA_API_KEY is not set.");
      return { content: "[Configuration Error]: The AI assistant is not configured right now. Please contact the EDC team.", error: "missing_api_key" };
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

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
              content: m.content || ""
            }))
          ],
          max_tokens: 1024,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId)

      if (!response.ok) {
        const text = await response.text();
        console.error("AI API Error:", text);
        return { content: `[API Error]: I encountered an error communicating with the API. (${response.status})` };
      }

      const data = await response.json();
      return { content: data.choices?.[0]?.message?.content || "No response generated." };
    } catch (fetchErr: any) {
      clearTimeout(timeoutId)
      if (fetchErr.name === 'AbortError') {
        return { content: "[Timeout Error]: The AI service took too long to respond." };
      }
      throw fetchErr;
    }
  } catch (err: any) {
    console.error("AI request failed:", err);
    return { content: `[Error]: ${err.message}` };
  }
}
