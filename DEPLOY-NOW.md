# 🚀 Deploy to Railway NOW - Copy & Paste Commands

## Step 1: Create GitHub Repository

Open [github.com/new](https://github.com/new) and create a new repository called `snipe-giveaway`

## Step 2: Push Your Code (Copy these commands)

```bash
# Add your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/snipe-giveaway.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy on Railway

1. Open [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your `snipe-giveaway` repository
4. Wait ~2 minutes for deployment

## Step 4: Your Live URLs

After deployment, Railway gives you:
- **App**: `https://[your-app].railway.app`
- **Get CSV**: `https://[your-app].railway.app/api/giveaway/export`

## 🎯 That's it! Your giveaway is live!

Save your Railway URL - you can download all entries anytime by visiting:
```
https://[your-app].railway.app/api/giveaway/export
```
