# Windstorm Services — Whirled: Second Wind

Static marketing site for Whirled: Second Wind, an independent revival of the
classic Whirled virtual world. Plain HTML/CSS/JS, no build step, deployed as
a Cloudflare Worker with static assets.

## Local development

```sh
npm run dev
```

Runs `wrangler dev` on http://localhost:8788, serving `public/` as static
assets plus the `/api/waitlist` route from `worker/index.js`. Reads secrets
from `.dev.vars` (gitignored — copy `.dev.vars.example` and fill in real
values for local testing).

## Deploy

```sh
npm run deploy
```

Runs `wrangler deploy`. See the deploy notes shared alongside this project
for first-time Cloudflare dashboard setup (environment variables, Turnstile
keys, custom domain).

## Structure

- `public/` — everything served publicly: pages (`*.html`, served at clean
  URLs automatically, e.g. `about.html` is also served at `/about`),
  `assets/` (self-hosted fonts, images/icons, CSS, JS), `_headers`,
  `robots.txt`, `sitemap.xml`
- `worker/index.js` — the Worker script backing `/api/waitlist`; every other
  request is served directly from `public/` without touching this script
  (see `run_worker_first` in `wrangler.toml`)
- `scripts/` — one-off Python scripts used to generate the favicon set and
  OG image from the brand fonts/colors; not part of the deployed site
- `wrangler.toml` — Worker config: assets directory, routing, compatibility
  date
