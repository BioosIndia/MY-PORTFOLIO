# Portfolio export — verification report

Checked: 9 October 2026. Current source: portfolio Site v33, commit `60cd5ba0f133814c162b75281d24faa5953faf69`.

| Check | Actual result |
| --- | --- |
| Complete website copy | 64/64 files preserved byte-for-byte |
| Local HTML/CSS links, including academic documents | 106 checked; zero missing |
| PDF file signatures | 20/20 present and valid signatures |
| DOI research editions | 3 supplied editions retained; original checks passed |
| Navigation/document interaction regressions | 24/24 passed in simulated DOM |
| Application JavaScript syntax | Passed Node syntax check |
| Vercel configuration properties | Field types, enum and length limits checked against current official schema |
| Local HTTP serving | Homepage plus all 64 files returned HTTP 200; SHA-256 bytes matched |
| PDF delivery type | All 20 served as application/pdf |
| Optional URL metadata helper | Four fields updated; body unchanged; unsafe URL forms rejected |
| Upload size | Largest website file 611,614 bytes; total website 6,472,953 bytes |
| Root layout | vercel.json and dist at ZIP root; no app wrapper |
| Export exclusions | No .openai, .git, .env, node_modules, platform tokens or cached build folders |
| ZIP integrity | Fresh extraction matched every file; package and 24 interaction checks rerun successfully |

All source assets are included, including existing documents that are not currently linked in the interface. These are retained for a complete source export; package contents should be treated as public if uploaded to a public repository.

## Limits of these checks

- This package has not been deployed into your Vercel account.
- Simulated DOM checks are not browser/device visual or hosted end-to-end QA.
- 29 external URL references were identified, not live-availability tested during packaging. Product access/settings remain controlled by their existing hosts.
- The portfolio export does not deploy the three SaaS backends, validate their regulatory outcomes or introduce new feature claims.
- Google Fonts availability depends on that external service; CSS fallback fonts remain available.

After import, check the actual Vercel URL using DEPLOY_TO_VERCEL.md. Default source content and the original Site's canonical/social metadata are preserved. Use the optional URL helper once you choose a permanent new sharing URL.
