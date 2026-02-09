# Valentine Mini-Site 💖

A romantic Valentine's Day proposal site with an LLM-powered chatbot.

## Features

- Beautiful, modern, romantic design with pink/purple theme
- Interactive YES/NO buttons (NO button runs away!)
- Celebratory confetti animation on YES
- Chatbot widget with LLM integration
- Fully responsive, mobile-first design
- Fast, vanilla HTML/CSS/JS (no build step)

## Project Structure

```
.
├── index.html          # Main page
├── css/
│   └── styles.css     # All styles
├── js/
│   ├── app.js         # Main interactions (buttons, confetti)
│   ├── chat.js        # Chat widget functionality
│   └── api.js         # API wrapper for chat endpoint
├── worker/             # Worker deployment files (separate from Pages)
│   ├── worker.js      # Cloudflare Worker backend
│   └── wrangler.toml  # Worker configuration
└── README.md
```

## Deployment

### Frontend (Cloudflare Pages)

1. Push this code to your GitHub repo: `kingston-grace/Valentines-request-idea-Business-`
2. Cloudflare Pages will auto-deploy from the `main` branch
3. Custom domain: `phill-love-nyasha.lol` (already configured)

### Backend (Cloudflare Worker)

#### Option 1: Deploy via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy worker
wrangler deploy
```

#### Option 2: Deploy via Cloudflare Dashboard

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select `valentine-chat` worker
3. Copy/paste `worker.js` content into the editor
4. Save and deploy

### Worker Configuration

1. **Set Environment Variables** in Cloudflare Dashboard:
   - `PRIVATE_CONTEXT`: Relationship context (set as secret)
   - `SYSTEM_PROMPT`: Chatbot behavior prompt (set as secret)

2. **Set up Route** (if using custom domain):
   - Route: `phill-love-nyasha.lol/api/chat*`
   - Worker: `valentine-chat`

3. **Enable Workers AI** (optional but recommended):
   - Go to Workers & Pages → AI
   - Enable AI binding
   - Update `wrangler.toml` to include AI binding
   - Model: `@cf/meta/llama-3.1-8b-instruct`

### API Endpoint

The chat API is available at:
- Worker URL: `https://valentine-chat.phillmhembere.workers.dev/api/chat`
- Custom domain: `https://phill-love-nyasha.lol/api/chat` (if route configured)

**Request:**
```json
POST /api/chat
{
  "message": "Why should I say yes?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{
  "reply": "Because you're amazing, babe! 💖"
}
```

## Development

No build step required! Just:
1. Edit files locally
2. Test in browser
3. Push to GitHub
4. Cloudflare Pages auto-deploys

## Customization

- **Colors**: Edit CSS variables in `css/styles.css` (`:root` section)
- **Chatbot behavior**: Update `SYSTEM_PROMPT` in Cloudflare Worker env vars
- **Relationship context**: Update `PRIVATE_CONTEXT` in Cloudflare Worker env vars

## Notes

- Chat history is stored in browser memory (resets on refresh)
- NO button uses CSS transforms to "run away" on hover/touch
- Confetti animation triggers on YES button click
- Chat widget is mobile-responsive

## License

Private project - All rights reserved 💖
