# Deployment Guide

## Quick Start

### 1. Frontend Deployment (Cloudflare Pages)

The frontend is already connected to GitHub and auto-deploys. Just:

1. **Push code to GitHub:**
   ```bash
   cd ~/valentine-site
   git init
   git add .
   git commit -m "Initial Valentine site"
   git remote add origin https://github.com/kingston-grace/Valentines-request-idea-Business-.git
   git push -u origin main
   ```

2. **Verify deployment:**
   - Check Cloudflare Pages dashboard
   - Visit: https://phill-love-nyasha.lol
   - Should see the Valentine page

### 2. Backend Deployment (Cloudflare Worker)

#### Method A: Deploy via Cloudflare Dashboard (Easiest)

1. **Go to Cloudflare Dashboard:**
   - Navigate to: Workers & Pages → valentine-chat

2. **Update Worker Code:**
   - Click "Edit code"
   - Copy entire contents of `worker.js`
   - Paste into the editor
   - Click "Save and deploy"

3. **Set Environment Variables:**
   - Go to Settings → Variables
   - Add `PRIVATE_CONTEXT` (as secret):
     ```
     [Paste the full PRIVATE_CONTEXT text from the spec]
     ```
   - Add `SYSTEM_PROMPT` (as secret):
     ```
     [Paste the full SYSTEM_PROMPT text from the spec]
     ```

4. **Enable Workers AI (Optional but Recommended):**
   - Go to Workers & Pages → AI
   - Enable AI binding
   - Model: `@cf/meta/llama-3.1-8b-instruct`
   - Update `wrangler.toml` if deploying via CLI later

#### Method B: Deploy via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
cd ~/valentine-site
wrangler deploy
```

**Note:** Environment variables must still be set in Cloudflare Dashboard (Settings → Variables).

### 3. Set Up Worker Route (IMPORTANT)

To make `/api/chat` work on your custom domain:

1. **Go to Cloudflare Dashboard:**
   - Navigate to: Workers & Pages → valentine-chat → Settings → Triggers

2. **Add Route:**
   - Click "Add route"
   - Route: `phill-love-nyasha.lol/api/chat*`
   - Zone: `phill-love-nyasha.lol` (should auto-select)
   - Click "Add route"

3. **Verify:**
   - Test: `https://phill-love-nyasha.lol/api/chat`
   - Should return JSON (or error if POST not sent)

### 4. Test the Full Stack

1. **Open the site:**
   - Visit: https://phill-love-nyasha.lol

2. **Test chat:**
   - Click "Ask me why" button
   - Send a message
   - Should receive a response from the chatbot

3. **Test buttons:**
   - Click YES → Should show confetti and success message
   - Hover over NO → Should move away

## Troubleshooting

### Chat not working?

1. **Check Worker route:**
   - Verify route is set: `phill-love-nyasha.lol/api/chat*`
   - Check Worker is deployed and active

2. **Check CORS:**
   - Worker should allow `*` origin (already in code)
   - Check browser console for CORS errors

3. **Check environment variables:**
   - Verify `PRIVATE_CONTEXT` and `SYSTEM_PROMPT` are set
   - Check Worker logs in Cloudflare Dashboard

### Frontend not updating?

1. **Check GitHub:**
   - Verify code is pushed to `main` branch
   - Check Cloudflare Pages build logs

2. **Clear cache:**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Worker AI not working?

1. **Check AI binding:**
   - Verify AI is enabled in Workers & Pages → AI
   - Check `wrangler.toml` has AI binding (if using CLI)

2. **Fallback:**
   - Worker has fallback responses if AI fails
   - Check Worker logs for errors

## Environment Variables Reference

### PRIVATE_CONTEXT
```
Nyasha Chendumbu.
From Masvingo, grew up in Gweru. Currently living in Lublin, Poland.
She loves purple & pink. She loves pizza. She recently turned 23.

[... full context from spec ...]
```

### SYSTEM_PROMPT
```
You are Phill (with two Ls), chatting as himself to Nyasha Chendumbu (his girlfriend).
Goal: charm her into clicking YES to "Nyasha, will you be my Valentine?" on a playful Valentine page.

[... full prompt from spec ...]
```

## Next Steps

1. ✅ Push frontend code to GitHub
2. ✅ Deploy Worker code
3. ✅ Set environment variables
4. ✅ Configure Worker route
5. ✅ Test full stack
6. ✅ Iterate and improve!

## Support

- Cloudflare Pages: https://dash.cloudflare.com → Pages
- Cloudflare Workers: https://dash.cloudflare.com → Workers & Pages
- GitHub Repo: https://github.com/kingston-grace/Valentines-request-idea-Business-
