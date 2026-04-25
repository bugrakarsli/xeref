import { streamText, convertToModelMessages } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { createOpenRouterForPlan, resolveModelId } from '@/lib/ai/openrouter-config';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const body = await request.json();

  // DefaultChatTransport sends { messages, id, trigger, messageId }
  // Extract the last user message text and the model preference
  const messages: any[] = body.messages ?? [];
  const model: string = body.model ?? 'xeref-free';
  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
  const userContent: string =
    lastUserMsg?.parts?.find((p: any) => p.type === 'text')?.text ??
    lastUserMsg?.content ??
    '';

  const supabase = await createClient();

  // 1. Auth & Plan
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
  const userPlan = profile?.plan || 'free';

  try {
    // 2. Save user message
    if (userContent) {
      await supabase.from('code_messages').insert({
        session_id: sessionId,
        user_id: user.id,
        role: 'user',
        content: userContent,
      });
    }

    // 3. Convert UI messages to model messages for the LLM
    const modelMessages = await convertToModelMessages(messages);

    const openrouter = createOpenRouterForPlan(userPlan as any);
    const resolvedModelId = resolveModelId(model, userContent);

    // 4. Stream response
    const result = streamText({
      model: openrouter(resolvedModelId),
      messages: modelMessages,
      onFinish: async ({ text }) => {
        await supabase.from('code_messages').insert({
          session_id: sessionId,
          user_id: user.id,
          role: 'assistant',
          content: text,
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
