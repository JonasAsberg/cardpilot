# ClosetMode (v1)

Fashion-forward wardrobe organizer with daily outfit intelligence.

## What it does

- Organize wardrobe by categories (T-shirts, Shirts, Sweaters, Hoodies, Jackets, Outerwear, Pants, Jeans, Shorts, Shoes, Accessories)
- Add item details (photo optional, missing fields allowed)
- Log what you wore each day in a quick tap flow
- Get outfit suggestions ranked by:
  1. Activity
  2. Weather
  3. Avoiding recent repeats
  4. Comfort
- Auto-detect weather using browser location
- Add custom color pairing rules on top of default style rules
- 10:00 AM reminder banner if today is not logged yet

## Run locally

Open this file in your browser:

`/Users/jonasasberg/Desktop/Codex/closet-app/index.html`

## Deploy to GitHub Pages

Use a new repository (recommended one app per repo).

```bash
cd /Users/jonasasberg/Desktop/Codex/closet-app
git init
git add .
git commit -m "Initial ClosetMode app"
git branch -M main
git remote add origin https://github.com/<YOUR-USER>/<YOUR-REPO>.git
git push -u origin main
```

Then in GitHub repo settings:

- Pages -> Source = Deploy from a branch
- Branch = `main`, folder = `/ (root)`

## iOS path (after web)

1. Keep this web app live first.
2. Wrap with Capacitor.
3. Open in Xcode and submit to App Store Connect.

If you want, the next step is I can generate the Capacitor setup files and exact iOS submission checklist for this app.
