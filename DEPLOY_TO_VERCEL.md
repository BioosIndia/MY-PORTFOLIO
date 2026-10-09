# Vercel publishing — simple guide

## 1. GitHub upload

Extract the ZIP, open the extracted folder, and upload **its contents** to your repository. Upload the folders too; only uploading `index.html` will lose photos, documents and styling. Do not upload the ZIP as a single file and do not create an extra enclosing `app` folder.

The repository first level must contain:

| Item | Purpose |
| --- | --- |
| `dist/` | Entire website, including documents and images |
| `vercel.json` | Vercel settings |
| `README.md` | Quick setup |
| `checks/`, `scripts/` | Optional local verification tools |
| `SOURCE_MANIFEST.json`, `VERIFICATION_REPORT.md` | Export evidence |

## 2. Vercel import

Open https://vercel.com/new, connect the GitHub account and import this repository. Confirm **Other** framework, root directory at the repository root, output directory **dist**, and empty build/install commands. The included configuration defines these settings. Add no API credentials: this portfolio does not call an AI provider.

Click Deploy. Open the URL Vercel returns. The original ChatGPT Site remains available; deploying this copy does not delete it or change project links.

## 3. Check your actual published copy

- Hero portrait, thumbnails and styles appear.
- Mobile navigation opens, closes and works with keyboard/Escape.
- BEACON, FORGE and LEDGER-Q buttons still open their intended current Sites after confirmation.
- Resume button opens/downloads the supplied resume.
- TRACE, Bharat-VPop and ClaimGraph-RD each open their own DOI PDF.
- Architecture image and academic document links open actual files.
- Confirmation dialogs can close/cancel, and email/contact links work.
- Scrolling works up/down; reduced-motion users can read everything.

Packaging tests cannot substitute for testing your actual new Vercel URL. If any product asks for its own login, that is controlled by the product host, not by this static portfolio.

## 4. Make the new URL your main sharing address (optional)

Choose your permanent Vercel URL or connect a domain first. If you want the new URL to be the canonical/social address, run this **locally from the extracted package folder**, replacing the example with your real deployed URL:

```sh
python3 scripts/set-site-url.py https://YOUR-ACTUAL-SITE.vercel.app
```

The script changes only the canonical link and Open Graph URL/image metadata in `dist/index.html`. It does not change project destinations, PDF contents, LinkedIn/email or visible portfolio text. Commit the updated `dist/index.html` to GitHub; the connected Vercel project redeploys it. No guessed domain is baked into the ZIP.

An existing resume PDF retains its original contents and links. Do not silently replace its portfolio URL with a guessed domain; update the resume separately only after choosing a permanent public URL.

## Common fixes

| Problem | Check |
| --- | --- |
| 404 on homepage | `dist/index.html` exists; root is repo root; output is `dist` |
| Build asks for npm/package.json | Set framework Other and build/install overrides to empty; keep `vercel.json` at root |
| Images/PDFs missing | Upload the complete `dist/assets` folder; preserve case and filenames |
| GitHub shows only a ZIP file | Extract first, then upload contents |
| Pages work locally but not on Vercel | Inspect Vercel deployment logs and compare repository paths/settings |
| Shared card still points to old Site | Use the optional metadata script with your actual final URL and redeploy |

There is no SPA catch-all rewrite: PDFs, SVGs and document HTML must retain their real paths and file types.

## Official references

- https://vercel.com/docs/deployments/git
- https://vercel.com/docs/builds/configure-a-build
- https://vercel.com/docs/project-configuration/vercel-json

Prepared 9 October 2026. Vercel account access, GitHub import and the actual hosted deployment are steps you complete; this export has not been deployed to your Vercel account.
