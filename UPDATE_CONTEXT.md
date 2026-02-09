# Update Worker Context in Cloudflare

## The Problem
The chatbot is hallucinating because the PRIVATE_CONTEXT and SYSTEM_PROMPT in Cloudflare need to be updated.

## Quick Fix

### Step 1: Go to Cloudflare Dashboard
1. Navigate to: **Workers & Pages** → **valentine-chat** → **Settings**

### Step 2: Update Environment Variables

#### Update PRIVATE_CONTEXT:
1. Go to **Variables and Secrets** section
2. Find `PRIVATE_CONTEXT` (Plaintext)
3. Click **Edit**
4. Copy the entire content from `worker/PRIVATE_CONTEXT.txt` in this repo
5. Paste it into the value field
6. Click **Save**

#### Update SYSTEM_PROMPT:
1. In the same **Variables and Secrets** section
2. Find `SYSTEM_PROMPT` (Plaintext)
3. Click **Edit**
4. The system prompt is already updated in `worker.js` - but if you want to set it as an env var, copy from the DEFAULT_SYSTEM_PROMPT in `worker.js`
5. Click **Save**

### Step 3: Update Worker Code (if not done)
1. Click **"</> Edit code"** button
2. Copy all code from `worker/worker.js`
3. Paste and **Save and deploy**

### Step 4: Test
1. Refresh https://phill-love-nyasha.lol
2. Try the chat - it should now use the full context!

## What Changed
✅ Full relationship context (family, friends, memories, inside jokes)
✅ Improved system prompt with better tone guidance
✅ Better fallback responses that use context
✅ "Mwana we beam" reason included
✅ Best friend + boyfriend dynamic included

## Files to Copy From
- `worker/PRIVATE_CONTEXT.txt` → Cloudflare `PRIVATE_CONTEXT` variable
- `worker/worker.js` → Cloudflare Worker code editor
