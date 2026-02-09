# Chatbot Setup Instructions

## Current Status
✅ Worker exists: `valentine-chat`
✅ Route configured: `phill-love-nyasha.lol/api/chat*`
✅ Environment variables set: `PRIVATE_CONTEXT` and `SYSTEM_PROMPT`

## Issue
The Worker code needs to be updated in Cloudflare Dashboard.

## Quick Fix Steps

### Option 1: Update via Cloudflare Dashboard (Easiest)

1. **Go to Cloudflare Dashboard:**
   - Navigate to: Workers & Pages → valentine-chat

2. **Click "Edit code" button** (top right)

3. **Copy the Worker code:**
   - Open `worker/worker.js` from this repo
   - Copy ALL the code

4. **Paste into Cloudflare editor:**
   - Replace everything in the editor
   - Click "Save and deploy"

5. **Verify:**
   - Test the endpoint: https://phill-love-nyasha.lol/api/chat
   - Should return JSON (or error if POST not sent)

### Option 2: Enable Workers AI (Optional but Recommended)

If you want the full LLM experience:

1. **Go to Workers & Pages → AI**
2. **Enable AI binding**
3. **Update Worker code** to use AI binding:
   - The code already supports it - just needs the binding enabled
   - Model: `@cf/meta/llama-3.1-8b-instruct`

### Testing the Chatbot

After deployment, test with:

```bash
curl -X POST https://phill-love-nyasha.lol/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hi","history":[]}'
```

Should return:
```json
{"reply":"..."}
```

## Troubleshooting

### Error 1101
- Worker not deployed or route not active
- Solution: Deploy the Worker code

### CORS errors
- Already handled in code (should work)

### Fallback responses
- If Workers AI isn't enabled, it uses rule-based responses
- These should still work and be romantic/funny

## Current Worker Code Location
`worker/worker.js` in this repository
