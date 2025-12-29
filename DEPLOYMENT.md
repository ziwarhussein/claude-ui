# QUICK DEPLOYMENT GUIDE

## METHOD 1: GitHub + Vercel (RECOMMENDED - 5 Minutes)

1. **Push to GitHub:**
   - Create a new repository on GitHub
   - Upload all these files to the repository
   
2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"
   - DONE! ✅

3. **Add Your API Key:**
   - Open your deployed site
   - Click settings icon (⚙️)
   - Paste your Claude API key from console.anthropic.com
   - Save and start chatting!

## METHOD 2: Vercel CLI (For Advanced Users)

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project folder
cd claude-ui

# Login
vercel login

# Deploy
vercel --prod
```

## Custom Domain Setup

After deployment:
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add `claude.kardonia.com` or `claude.shibaru.online`
3. Follow DNS instructions from Vercel
4. Wait 5-10 minutes for propagation

## Get Claude API Key

1. https://console.anthropic.com
2. Login/Signup
3. API Keys → Create Key
4. Add credits (required)
5. Copy key and paste in app settings

---

That's it! Your Claude UI is ready to use.

Features included:
✅ Model selector (Opus 4, Sonnet 4, 3.5 Sonnet, 3.5 Haiku)
✅ File uploads (images + PDFs)
✅ Chat history
✅ Dark theme like Claude
✅ Mobile responsive
