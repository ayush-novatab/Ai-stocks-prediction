# Deployment Guide

This guide covers multiple deployment options for the Stock News App.

## Option 1: Vercel (Recommended - Easiest)

Vercel is made by the creators of Next.js and offers the easiest deployment.

### Steps:

1. **Install Vercel CLI** (optional, you can also use the web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

3. **Or Deploy via GitHub**:
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and deploy

4. **Environment Variables** (if needed in future):
   - Go to Project Settings → Environment Variables
   - Add any required variables

**Note**: No environment variables needed currently as the app uses free APIs.

---

## Option 2: Netlify

### Steps:

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Or use Netlify Dashboard**:
   - Push code to GitHub
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect GitHub and select your repo
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`

---

## Option 3: Railway

### Steps:

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**:
   ```bash
   railway login
   ```

3. **Initialize and deploy**:
   ```bash
   railway init
   railway up
   ```

4. **Or use Railway Dashboard**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository

---

## Option 4: Render

### Steps:

1. **Go to Render Dashboard**:
   - Visit [render.com](https://render.com)
   - Sign up/login

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure**:
   - Name: `stock-news-app`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free tier available

---

## Option 5: Self-Hosting (VPS/Server)

### Using PM2 (Process Manager):

1. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Build the app**:
   ```bash
   npm run build
   ```

3. **Start with PM2**:
   ```bash
   pm2 start npm --name "stock-news-app" -- start
   ```

4. **Save PM2 configuration**:
   ```bash
   pm2 save
   pm2 startup
   ```

5. **Use Nginx as reverse proxy** (optional):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Pre-Deployment Checklist

### 1. Update package.json scripts for production:

The current `start` script uses port 4000. For production, it's better to use the PORT environment variable:

```json
"start": "next start"
```

Then set PORT in your deployment platform's environment variables.

### 2. Test the build locally:

```bash
npm run build
npm start
```

### 3. Ensure .gitignore includes:

```
node_modules/
.next/
.env.local
.env*.local
```

### 4. Create a .vercelignore (if using Vercel):

```
node_modules
.env.local
```

---

## Environment Variables

Currently, **no environment variables are required** as the app uses:
- Free Yahoo Finance API (no key needed)
- Free RSS feeds (no key needed)
- Keyword-based sentiment analysis (no AI API needed)

If you want to add OpenAI/Tavily in the future, you would add:
- `OPENAI_API_KEY` (optional)
- `TAVILY_API_KEY` (optional)

---

## Quick Deploy Commands

### Vercel (Fastest):
```bash
npm i -g vercel
vercel
```

### Netlify:
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Railway:
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

---

## Post-Deployment

1. **Test your deployed app**:
   - Try searching for stocks (AAPL, RELIANCE.NS, TCS.NS)
   - Verify charts load correctly
   - Check news articles display

2. **Monitor**:
   - Check deployment logs for errors
   - Monitor API usage (Yahoo Finance has rate limits)

3. **Custom Domain** (optional):
   - Most platforms allow custom domains
   - Add your domain in platform settings
   - Update DNS records as instructed

---

## Troubleshooting

### Build fails:
- Check Node.js version (requires Node 18+)
- Run `npm install` locally first
- Check for TypeScript errors: `npm run lint`

### API errors in production:
- Yahoo Finance may have rate limits
- Check server logs for specific errors
- Consider adding error handling/retry logic

### Charts not loading:
- Ensure Recharts is properly bundled
- Check browser console for errors
- Verify API routes are accessible

---

## Recommended: Vercel

For Next.js apps, **Vercel is the best choice** because:
- ✅ Zero configuration needed
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Free tier available
- ✅ Built by Next.js creators
- ✅ Automatic deployments from GitHub

