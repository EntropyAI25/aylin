# AYLIN website

Static site (no build step) + Supabase for products, content, images and admin login.
`main` is the live site; new changes are tried on the `site-build` branch.

## Pages
`index.html` home · `shop.html` · `product.html?slug=…` · `about.html` · `contact.html` · `policies.html?p=shipping|returns|size-guide` · `admin/` (admin panel) · `coming-soon.html` (copy of the placeholder)

## Connect Supabase (one-time, ~5 minutes)
1. Create a free project at supabase.com.
2. SQL Editor → paste `supabase/schema.sql`, **change `you@example.com` to your admin email**, Run.
3. Run `supabase/admin-passkey.sql` and follow the comments in it (creates the one admin user; the admin login is a single passkey).
4. Authentication → Sign In / Providers → turn **off** "Allow new users to sign up".
5. Project Settings → API → copy **Project URL** and **anon public key** into `js/config.js`.
6. Open `/admin`, sign in, add categories and products.

Everything editable (products, photos, banners, text, WhatsApp number and message, theme) is in `/admin`.
No code changes are needed for new products.

## Preview / launch
- Theme preview: add `?theme=midnight` or `?theme=luxe` to any URL, or use the switch bottom-left.
  Choose the final theme in Admin → Appearance & brand, then set `SHOW_THEME_TOGGLE: false` in `js/config.js`.
- Hosting is Cloudflare Pages. A push to `site-build` updates the preview at `https://site-build.aylin-a3v.pages.dev` only.
- Go live: merge `site-build` into `main`. That updates `theaylinlabel.in`, `www` and `demo.theaylinlabel.in`.
- The preview and the live site share one D1 database, so admin edits on either one show on both.
