# Runbook: MCP Server Incident

## When to run
- MCP client (Claude Desktop, etc.) cannot connect or gets auth errors
- Unexpected data returned for wrong user
- MCP server process crash

## MCP server overview

Transport: **stdio** — the server is not a long-running HTTP service. It's invoked per session:
```bash
SUPABASE_SERVICE_ROLE_KEY=... XEREF_MCP_USER_ID=<uuid> npx tsx mcp/server.ts
```

The `XEREF_MCP_USER_ID` env var determines which user's data is served. There is no per-request auth — the trust boundary is the process environment.

## Diagnosis

### Connection refused / cannot start
1. Verify env vars are set: `echo $XEREF_MCP_USER_ID && echo $SUPABASE_SERVICE_ROLE_KEY`
2. Run manually and check stderr: `npx tsx mcp/server.ts 2>&1`
3. Common failure: `Missing NEXT_PUBLIC_SUPABASE_URL` — check `.env.local` is loaded

### Wrong user's data returned
The only user served is `XEREF_MCP_USER_ID`. If wrong data appears:
1. Stop the server process immediately
2. Check which `XEREF_MCP_USER_ID` value was set
3. All queries in `mcp/server.ts` filter by `user_id = getUserId()` — a mismatch here means the env var was wrong, not a query bug

### Service role key exposed
1. Rotate `SUPABASE_SERVICE_ROLE_KEY` in Supabase dashboard → Project Settings → API
2. Update `.env.local` and any hosting environment (Vercel)
3. Restart the MCP server with the new key

## Key files
- `mcp/server.ts` — full server implementation; all tools enforce `getUserId()`
- `app/api/mcp/route.ts` — HTTP transport wrapper (alternative to stdio)

## Multi-tenant note
The current server is intentionally single-user (self-hosted). For multi-tenant use, `getUserId()` would need to move to per-request Supabase JWT verification, not env.
