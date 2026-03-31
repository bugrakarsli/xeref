# Chat Interface Streaming Fix Design

## Problem Statement
The chat UI crashes and displays no message text when the user sends an input. This is caused by the message items from `useChat` returning `.content` string format while the UI erroneously maps `.parts` (which is `undefined` on newly streamed messages), leading to a rendering crash. Furthermore, the backend is not streaming data via standard AI SDK chunking.

## Goals
- Fix the blank/crashed chat bubble on message submission.
- Re-architect `api/chat/route.ts` to use Vercel AI SDK's standard `toDataStreamResponse()`.
- Simplify `chat-interface.tsx` to handle standard message `.content` cleanly without the unnecessary `TextStreamChatTransport`.

## Non-Goals
- Adding complex UI tools, functional tool calling, or streaming generative UI from the backend. (Future-proofing will be baked in but not implemented here).

## Proposed Solution
We will implement standard native AI SDK data streaming:
1. **Backend (`/api/chat/route.ts`)**: Replace `toTextStreamResponse()` with `toDataStreamResponse()`.
2. **Frontend (`chat-interface.tsx`)**:
   - Remove `import { TextStreamChatTransport } from 'ai'`.
   - Reconfigure the `useChat` hook to simply use the standard endpoint configuration without custom transports.
   - Remove the `getMessageText(parts)` mapping parser entirely.
   - Parse directly from `message.content`.
3. **State Initialization**: Ensure the `initialMessages` parsed in `chat-interface.tsx` consistently seed `m.content` without fabricating `m.parts` arrays.

## Alternatives Considered
- **Approach B**: Safely patch `getMessageText` to fallback `m.content || m.parts`. Rejected because keeping `.parts` parsing and `TextStreamChatTransport` adds technical debt and prevents adding SDK tooling seamlessly in the future.

## Implementation Notes
- Update React component mapping for rendering messages:
  `renderedMessages = messages.map(m => ({ id: m.id, role: m.role, content: m.content }))`
- Remove `TextStreamChatTransport` from `useChat` config entirely. The AI SDK automatically streams out JSON stream chunks (`0:"Chunk"`) with `toDataStreamResponse()`.

## Success Criteria
- [ ] Submitting a prompt displays the user's chat bubble natively without UI crashes.
- [ ] The LLM response stream renders progressively in the assistant message bubble.
- [ ] The full conversation properly persists via `saveMessage`.
