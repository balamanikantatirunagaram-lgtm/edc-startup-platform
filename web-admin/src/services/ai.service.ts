"use server"

export async function generateEventDescription(title: string, type: string, location: string, date: string) {
  try {
    if (!process.env.NVIDIA_API_KEY) {
      console.warn("NVIDIA_API_KEY is not set. Using mock AI response.");
      return { content: `[MOCK AI]: Join us for ${title}, a ${type} event at ${location} on ${date}. It's going to be an amazing opportunity to connect and learn!` };
    }

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
            content: "You are an expert event coordinator and copywriter. Write a compelling, engaging, and professional 3-4 sentence event description."
          },
          {
            role: "user",
            content: `Write an event description for an upcoming event with these details: Title: ${title}, Type: ${type}, Location: ${location}, Date: ${date}. Do not include placeholders.`
          }
        ],
        max_tokens: 256,
      })
    });

    if (!response.ok) {
      return { error: `API Error: ${response.status}` };
    }

    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content || "No response generated." };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function rewriteEventDescription(currentDescription: string) {
  try {
    if (!process.env.NVIDIA_API_KEY) {
      console.warn("NVIDIA_API_KEY is not set. Using mock AI response.");
      return { content: `[MOCK AI REWRITE]: ${currentDescription} (Enhanced by AI)` };
    }

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
            content: "You are an expert copywriter. Improve the provided event description to be more compelling, professional, and exciting. Keep it concise (3-5 sentences)."
          },
          {
            role: "user",
            content: `Rewrite this description: "${currentDescription}"`
          }
        ],
        max_tokens: 300,
      })
    });

    if (!response.ok) {
      return { error: `API Error: ${response.status}` };
    }

    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content || "No response generated." };
  } catch (err: any) {
    return { error: err.message };
  }
}
