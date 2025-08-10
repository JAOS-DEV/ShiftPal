# GitHub Pages Deployment Guide

## Quick Setup

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**

   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically deploy when you push to main

3. **Set up Environment Variables (Optional)**
   - Go to Settings → Secrets and variables → Actions
   - Add `GEMINI_API_KEY` if you want the AI chatbot to work on the live site

## Manual Deployment

If you prefer manual deployment:

```bash
# Install gh-pages package
npm install --save-dev gh-pages

# Build and deploy
npm run deploy
```

## Custom Domain (Optional)

1. Go to Settings → Pages
2. Under "Custom domain", enter your domain
3. Add a CNAME file to your repository root with your domain
4. Update your DNS settings at your domain registrar

## Troubleshooting

- **404 errors**: Make sure your `vite.config.ts` has the correct base path (`/ShiftPal/`)
- **Build failures**: Check the Actions tab for detailed error logs
- **Environment variables**: Ensure secrets are properly set in repository settings

## Local Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`
