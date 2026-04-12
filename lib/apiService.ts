export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | any[];
}

export interface OpenRouterChatSession {
  modelId: string;
  systemInstruction: string;
  history: OpenRouterMessage[];
}

export const createChatSession = (
  modelId: string = 'google/gemini-2.5-flash',
  systemInstruction: string = "You are Xeref.ai, an advanced AI coding assistant.",
  enableSynthID: boolean = false
): OpenRouterChatSession => {
  return {
    modelId,
    systemInstruction,
    history: []
  };
};

export const sendMessageToGemini = async (
  session: OpenRouterChatSession,
  message: string | Array<any>,
  onChunk: (text: string, error?: any) => void
): Promise<void> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is not set.");
    }

    // Add user message to session history
    session.history.push({
      role: 'user',
      content: message
    });

    const body = {
      model: session.modelId,
      messages: [
        { role: 'system', content: session.systemInstruction },
        ...session.history
      ],
      stream: true
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Xeref Claw",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    if (!reader) {
      throw new Error("Response body is empty.");
    }

    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
              const contentChunk = data.choices[0].delta.content;
              fullResponse += contentChunk;
              onChunk(contentChunk);
            }
          } catch (e) {
             // Ignoring JSON parse errors on incomplete chunks
          }
        }
      }
    }

    // Add assistant response to history
    session.history.push({
      role: 'assistant',
      content: fullResponse
    });

  } catch (error: any) {
    console.error("Error sending message to OpenRouter:", error);
    onChunk("\n\n[Error: Failed to get response from the agent. Please check your connection or API key.]", error);
  }
};
