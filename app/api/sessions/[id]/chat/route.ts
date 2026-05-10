import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { createOpenRouterForPlan, resolveModelId, type UserPlan } from '@/lib/ai/openrouter-config';
import { getConnectionWithSecrets } from '@/lib/connections/store';
import { NextResponse } from 'next/server';

async function fetchRepoContext(repo: string, token: string): Promise<string> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'xeref-app',
  };

  // Get default branch
  const repoRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!repoRes.ok) return '';
  const repoData = await repoRes.json() as { default_branch: string; description: string | null };
  const branch = repoData.default_branch;

  // Get top-level file tree
  const treeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=0`, { headers });
  const treeData = treeRes.ok ? await treeRes.json() as { tree: Array<{ path: string; type: string }> } : null;
  const fileList = treeData?.tree?.map(f => `${f.type === 'tree' ? '📁' : '📄'} ${f.path}`).join('\n') ?? '';

  // Get README
  let readme = '';
  const readmeRes = await fetch(`https://api.github.com/repos/${repo}/contents/README.md`, { headers });
  if (readmeRes.ok) {
    const readmeData = await readmeRes.json() as { content?: string };
    if (readmeData.content) {
      readme = Buffer.from(readmeData.content, 'base64').toString('utf-8').slice(0, 3000);
    }
  }

  const parts: string[] = [
    `Repository: ${repo}`,
    repoData.description ? `Description: ${repoData.description}` : '',
    fileList ? `\nTop-level structure:\n${fileList}` : '',
    readme ? `\nREADME (truncated):\n${readme}` : '',
  ];
  return parts.filter(Boolean).join('\n');
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const body = await request.json();

  // DefaultChatTransport sends { messages, id, trigger, messageId, repo, model }
  const messages: UIMessage[] = body.messages ?? [];
  const model: string = body.model ?? 'xeref-free';
  const repo: string | null = body.repo ?? null;
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  const textPart = lastUserMsg?.parts?.find((p) => p.type === 'text');
  const userContent: string = textPart && 'text' in textPart ? textPart.text : '';

  const supabase = await createClient();

  // 1. Auth & Plan
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
  const userPlan = profile?.plan || 'free';

  try {
    // 2. Save user message + auto-title the session on first message
    if (userContent) {
      await supabase.from('code_messages').insert({
        session_id: sessionId,
        user_id: user.id,
        role: 'user',
        content: userContent,
      });

      // Set session title from first user message if still default
      const { data: session } = await supabase
        .from('code_sessions')
        .select('title')
        .eq('id', sessionId)
        .single();
      if (!session?.title || session.title === 'New session') {
        const autoTitle = userContent.slice(0, 60).trim();
        await supabase
          .from('code_sessions')
          .update({ title: autoTitle, updated_at: new Date().toISOString() })
          .eq('id', sessionId);
      }
    }

    // 3. Build system prompt — include GitHub repo context if a repo is selected
    let systemPrompt = 'You are a helpful coding assistant.';
    if (repo) {
      const conn = await getConnectionWithSecrets(user.id, 'github');
      if (conn?.access_token) {
        const repoContext = await fetchRepoContext(repo, conn.access_token);
        if (repoContext) {
          systemPrompt = `You are a coding assistant helping with the GitHub repository \`${repo}\`.\n\n${repoContext}\n\nAnswer questions about the repository's code, structure, and purpose. When asked to read or modify specific files, ask the user to paste the file contents since you only have the top-level structure above.`;
        }
      }
    }

    // 4. Convert UI messages to model messages for the LLM
    const modelMessages = await convertToModelMessages(messages);

    const openrouter = createOpenRouterForPlan((userPlan || 'free') as UserPlan);
    const resolvedModelId = resolveModelId(model, userContent);

    // 5. Stream response
    const result = streamText({
      model: openrouter(resolvedModelId),
      system: systemPrompt,
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
