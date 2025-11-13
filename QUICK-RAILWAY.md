# 🚂 Railway Quick Reference

## Deploy in 3 Steps

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy to Railway"
git push

# 2. Go to railway.app
# 3. New Project → Deploy from GitHub → Select your repo
# Done! 🎉
```

## Your URLs (After Deploy)

- **Live App**: `https://your-app.up.railway.app`
- **Get All Data**: `https://your-app.up.railway.app/api/giveaway/export`

## Get Your Data Anytime

```bash
# Download all entries as CSV
curl https://your-app.up.railway.app/api/giveaway/export > entries.csv

# Quick count
curl https://your-app.up.railway.app/api/giveaway/count
```

## That's It! 

No servers to manage, automatic HTTPS, deploys on every push. Railway handles everything! 🚀
