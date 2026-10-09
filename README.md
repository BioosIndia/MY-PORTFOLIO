# Rahul Dewangan — Complete Portfolio

Ready to upload to GitHub and import into Vercel. This export contains the current portfolio source, portrait assets, styles, motion and interaction code, diagrams, research PDFs, resume and document previews.

## Sabse pehle kya karna hai

1. ZIP **extract** karo. ZIP file ko seedha GitHub mein upload mat karo.
2. GitHub mein ek naya repository banao, jaise `rahul-dewangan-portfolio`.
3. **Add file → Upload files** par jao. Extracted folder ke **andar ke saare files aur folders** upload karo. Repository ke first level par `vercel.json`, `README.md` aur `dist` dikhne chahiye. Ek extra `app` ya ZIP-name folder ke andar mat daalna.
4. Commit changes karo. Vercel mein **Add New → Project**, GitHub connect karke isi repository ko **Import** karo.
5. Neeche wali settings check karke **Deploy** dabao. `vercel.json` already settings provide karta hai.

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Root Directory | Repository root; blank / `.` |
| Build Command | Empty — no build needed |
| Install Command | Empty — no dependencies needed |
| Output Directory | `dist` |
| Environment Variables | None required |

Is portfolio ke liye `npm install`, API keys, database ya Docker ki zaroorat nahi. `dist` mein HTML, CSS aur JavaScript hi editable source hain; yeh generated framework bundle nahi hai.

## Package mein kya hai

- `dist/index.html`: complete portfolio content and layout.
- `dist/styles.css`: responsive styling and animation.
- `dist/app.js`: navigation, confirmation dialogs, motion and downloads.
- `dist/assets`: photos, diagrams, fonts, thumbnails, resume, DOI PDFs and academic documents.
- `vercel.json`: static deployment settings.
- `DEPLOY_TO_VERCEL.md`: detailed setup, final checks and common fixes.
- `checks`: portable file checks and 24 interaction regressions.
- `scripts/set-site-url.py`: optional social/canonical metadata update after your new URL is known.
- `SOURCE_MANIFEST.json`: source revision and SHA-256 hashes of every website file.
- `VERIFICATION_REPORT.md`: actual packaging checks and their limits.

No hidden platform directory, credentials, old archive, Git history or extra `app` wrapper is included. All original website files are retained byte-for-byte in the default export.

## Local preview (optional)

From this folder run:

```sh
python3 -m http.server 8000 --directory dist
```

Then open `http://localhost:8000`. Use HTTP preview rather than double-clicking HTML.

## Local checks (optional; deployment does not run these)

```sh
python3 checks/check-package.py
node checks/portfolio-interactions.mjs
node --check dist/app.js
```

Python 3 is needed only for these optional tools. Node.js is needed only for interaction checks. Vercel needs neither installation nor a build for this portfolio.

## Important boundary

This ZIP deploys **the portfolio**, not the BEACON, FORGE or LEDGER-Q applications. Their existing product URLs and access controls stay on their current hosts. Contact uses an email link; no server-side contact form is implied. Google Fonts remains an external font resource, with CSS fallback fonts if it cannot load.

The current canonical and social URLs deliberately remain the original portfolio URL until you choose your permanent Vercel/custom-domain URL. See the optional metadata update in `DEPLOY_TO_VERCEL.md`. Hosting a second copy does not change or redirect the original site.

Personal resume/contact details and supplied public documents are included because they are part of this portfolio. Check that you want these public before making the repository public. No redistribution license is invented; retain rights and permissions for supplied documents and assets.
