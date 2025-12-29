# Quick Deployment Guide

## 🚀 Fastest Way: Vercel (5 minutes)

### Option A: Via GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" → "Continue with GitHub"
   - Click "New Project"
   - Import your repository
   - Click "Deploy" (no configuration needed!)

3. **Done!** Your app will be live at `your-app.vercel.app`

### Option B: Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? stock-news-app
# - Directory? ./
# - Override settings? N
```

---

## 📋 Pre-Deployment Checklist

✅ **Build tested locally**:
```bash
npm run build
npm start
```

✅ **No environment variables needed** (app uses free APIs)

✅ **Git ignore configured** (`.gitignore` already set up)

---

## 🔗 Other Platforms

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

---

## ✅ Post-Deployment

1. Test your live URL:
   - Search for `AAPL` (US stock)
   - Search for `RELIANCE` (Indian stock)
   - Verify charts load
   - Check news articles

2. (Optional) Add custom domain:
   - Go to Project Settings → Domains
   - Add your domain
   - Update DNS records

---

## 🐛 Troubleshooting

**Build fails?**
- Ensure Node.js 18+ is used
- Run `npm install` first
- Check TypeScript errors: `npm run lint`

**API errors?**
- Yahoo Finance may have rate limits
- Check server logs in deployment dashboard
- Consider adding retry logic

---

## 📝 Notes

- **Port**: Production uses PORT env variable (defaults to 3000)
- **No API keys**: App uses free Yahoo Finance API
- **Free tier**: Vercel free tier is sufficient for this app

