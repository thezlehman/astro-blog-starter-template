# Windstorm Services — Whirled: Second Wind

Static marketing site for Whirled: Second Wind, an independent revival of the
classic Whirled virtual world. Plain HTML/CSS/JS, no build step, deployed to
Cloudflare Pages.

## Local development

```sh
npm run dev
```

Runs `wrangler pages dev .` on http://localhost:8788, including the
`/functions/api/waitlist` Pages Function.

## Deploy

```sh
npm run deploy
```

Runs `wrangler pages deploy .`. See the deploy notes shared alongside this
project for first-time Cloudflare dashboard setup (environment variables,
Turnstile keys, custom domain).

## Structure

- `*.html` — pages (served at clean URLs automatically by Cloudflare Pages,
  e.g. `about.html` is also served at `/about`)
- `assets/` — self-hosted fonts, images/icons, CSS, JS
- `functions/api/waitlist.js` — Pages Function backing the waitlist form
- `_headers`, `_redirects` — Cloudflare Pages config
