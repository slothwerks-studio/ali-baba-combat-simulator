# GitHub Pages Deployment Guide

## Quick Deploy

You've already committed everything to the `web-interface` branch. Now:

1. **Push the branch to GitHub:**
   ```bash
   git push origin web-interface
   ```

2. **Enable GitHub Pages:**
   - Go to your repo: https://github.com/[YOUR-USERNAME]/ali-baba-combat-simulator
   - Click **Settings** tab
   - Click **Pages** in the left sidebar
   - Under "Build and deployment":
     - Source: **Deploy from a branch**
     - Branch: **web-interface**
     - Folder: **/docs**
   - Click **Save**

3. **Wait for deployment** (1-2 minutes)
   - GitHub will show a message: "Your site is ready to be published at..."
   - Refresh after a minute to get the live URL

4. **Update README.md** with your actual GitHub Pages URL:
   - Replace `[YOUR-USERNAME]` in the Play Now link with your GitHub username

5. **Test your live site:**
   - Visit: `https://[YOUR-USERNAME].github.io/ali-baba-combat-simulator/`

## What's Deployed

The `/docs` folder contains:
- ✅ `index.html` - Main application
- ✅ `styles.css` - All styling
- ✅ `js/app.js` - UI controller
- ✅ `js/engine.js` - Combat engine
- ✅ `js/data.js` - Character/creature data
- ✅ `js/dice.js` - Random number utilities

## Testing Locally

Before pushing, you can test locally:
```bash
open docs/index.html
```

Or use a local server (optional):
```bash
cd docs
python3 -m http.server 8000
# Visit: http://localhost:8000
```

## Troubleshooting

**Site not loading?**
- Check that you selected `/docs` folder, not `/` (root)
- Verify the branch is `web-interface`
- Wait 2-3 minutes after saving settings

**Seeing old version?**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear browser cache

**Want to make changes?**
1. Edit files in the `docs/` folder
2. Test locally: `open docs/index.html`
3. Commit: `git add -A && git commit -m "Update: description"`
4. Push: `git push origin web-interface`
5. Wait 1-2 minutes for automatic redeployment

## Next Steps

Once deployed, you can:
- Share the URL with others to test
- Get feedback on combat balance
- Iterate on character bonuses and difficulty
- Move to Phase 2: Equipment customization (see MVP.md)
