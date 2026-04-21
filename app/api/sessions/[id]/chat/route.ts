import { streamText, convertToModelMessages } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { createOpenRouterForPlan, resolveModelId } from '@/lib/ai/openrouter-config';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const { content, model } = await request.json();
  const supabase = await createClient();

  // 1. Auth & Plan
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
  const userPlan = profile?.plan || 'free';

  try {
    // 2. Save user message
    await supabase.from('code_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      role: 'user',
      content
    });

    // 3. Fetch history for context
    const { data: history } = await supabase
      .from('code_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(30);

    const modelMessages = (history || []).map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content
    }));

    const openrouter = createOpenRouterForPlan(userPlan as any);
    const resolvedModelId = resolveModelId(model || 'xeref-free', content);

    // 4. Stream response
    const result = streamText({
      model: openrouter(resolvedModelId),
      messages: modelMessages as any,
      onFinish: async ({ text }) => {
        // Save assistant message to DB
        await supabase.from('code_messages').insert({
          session_id: sessionId,
          user_id: user.id,
          role: 'assistant',
          content: text
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
