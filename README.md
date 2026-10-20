# AYLIN website

Static site (no build step) + Supabase for products, content, images and admin login.
`main` is the "coming soon" placeholder; this work lives on the `site-build` branch.

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
- Vercel: every push to `site-build` gets its own preview URL automatically, without touching the live placeholder.
- Launch: merge `site-build` into `main`. The custom domain (`theaylinlabel.in`, bought on GoDaddy) is already connected in Vercel → Settings → Domains, with DNS records set in GoDaddy.
