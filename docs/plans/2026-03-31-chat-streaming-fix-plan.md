# Implementation Plan: Chat Streaming Fix

## Prerequisites
- [x] Design document approved (`docs/plans/2026-03-31-chat-streaming-fix-design.md`)

## Steps

### Step 1: Update API Route to use Data Stream
**Files:** `d:\bugrakarsli\02-projects\xeref\xeref-claw\app\api\chat\route.ts`
**Action:** Change `toTextStreamResponse()` to `toDataStreamResponse()`.
**Notes:** This aligns the backend with the default Next.js Vercel AI SDK data streaming format.

### Step 2: Remove Custom Transport from useChat
**Files:** `d:\bugrakarsli\02-projects\xeref\xeref-claw\components\dashboard\chat\chat-interface.tsx`
**Action:** Remove `import { TextStreamChatTransport } from 'ai'` and remove the `transport` configuration from the `useChat` hook, leaving just the `api` and `body` properties.
**Notes:** The default transport natively handles the data stream.

### Step 3: Simplify message mapping and remove getMessageText
**Files:** `d:\bugrakarsli\02-projects\xeref\xeref-claw\components\dashboard\chat\chat-interface.tsx`
**Action:** Remove the `getMessageText` function entirely. Update `renderedMessages` mapping to extract `m.content` directly instead of calling `getMessageText`.
**Notes:** New messages appended by the SDK natively use `.content`.

### Step 4: Fix initialMessages state loading
**Files:** `d:\bugrakarsli\02-projects\xeref\xeref-claw\components\dashboard\chat\chat-interface.tsx`
**Action:** In the `useEffect` that calls `setMessages`, remove the fabrication of the `parts` array and ensure it maps `m.content` to `content`.
**Notes:** Maps initial messages loaded from Supabase to correctly populate `content`.

### Step 5: Update onFinish message saving
**Files:** `d:\bugrakarsli\02-projects\xeref\xeref-claw\components\dashboard\chat\chat-interface.tsx`
**Action:** Inside `useChat`'s `onFinish` handler, get the assistant's text using `lastMsg.content` instead of `getMessageText(lastMsg.parts)`.
**Notes:** ensures the fully streamed response is successfully saved to the database.

### Step 6: Final Verification
- Start the server (`npm run dev`)
- Select an active agent and send a test message
- Verify the user message instantly appears without crashing
- Verify the assistant message stream progressively renders
- Check Supabase to ensure the chat persists correctly
