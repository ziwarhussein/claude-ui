# Claude UI Clone

A clean, modern UI clone of Claude.ai built with Next.js for Vercel deployment.

## Features

✅ Model selector (Opus 4, Sonnet 4, 3.5 Sonnet, 3.5 Haiku)
✅ File uploads (images and PDFs)
✅ Clean dark theme matching Claude
✅ Message history
✅ Settings for API key storage
✅ Responsive design

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"
6. Done! Your Claude UI will be live

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## Custom Domain Setup

1. In Vercel dashboard, go to your project
2. Settings → Domains
3. Add your custom domain (e.g., `claude.kardonia.com`)
4. Update your DNS records as instructed by Vercel

## Getting Your Claude API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / Login
3. Go to API Keys section
4. Create a new key
5. Add credits to your account
6. Copy the key and paste it in the Settings (⚙️) in the app

## Usage

1. Click the settings icon (⚙️) in the top right
2. Paste your Anthropic API key
3. Click Save
4. Start chatting!

## File Upload Support

- **Images**: JPG, PNG, GIF, WEBP
- **Documents**: PDF

Files are automatically converted to base64 and sent to Claude API.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Tech Stack

- Next.js 14
- React 18
- Anthropic Claude API
- CSS-in-JS (styled-jsx)

## Notes

- API key is stored in browser localStorage (client-side only)
- No backend database required
- All API calls go through Next.js API routes for security
- Works with all Claude models that support vision

---

Built for Vercel deployment. Ready to use with your Claude API key!
