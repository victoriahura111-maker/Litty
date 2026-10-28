> A prioritized, working checklist for the static Litty site. Work top-down: **P0** items block launch, **P1** items drive revenue, **P2/P3** are refinements.
>
> **Legend:** `[P0]` launch blocker · `[P1]` high impact · `[P2]` next · `[P3]` later

**Baseline audit — 25 Oct 2026**

| Metric | Baseline | Target |
| --- | --- | --- |
| Initial page transfer | 469 KB | < 150 KB |
| Font Awesome payload | ~300 KB (CSS + 3 font files) | 0 KB |
| CSS | 246 KB measured, ~83% unused on home; 45 local `@import`s | one bundled file, < 50 KB |
| LCP (cold, local) | ~2.18 s | < 1 s fast connection; < 2.5 s mobile |
| CLS | 0.0005 | < 0.1 |
| DOM nodes (home) | 295 | < 800 |
| Accessibility basics | labels, names, `lang`, one `h1` pass | no critical axe issues |

**Files:** `site/data/site.json` · `site/data/products.json` · `site/assets/site.js` · `site/assets/site.css` · `build.mjs`

---

## If you only do ten things

1. Replace the domain, email, phone, WhatsApp and address placeholders.
2. Shoot real photos for your top 8 pieces and wire them into `products.json`.
3. Add product detail pages with specs, care and availability.
4. Rewrite the repeated product descriptions.
5. Fix “Secure checkout” and state lead time, shipping origin and returns.
6. Turn on Netlify form notifications and add analytics.
7. Add a real payment path (Paystack/Flutterwave payment links are the fastest).
8. Add genuine reviews and an artist/process story.
9. Remove Font Awesome, self-host fonts and bundle the CSS.
10. Connect the newsletter to a real email provider.

## Already in place — don't redo

- Static build + Netlify config, 16 pages, 404 and legacy redirects.
- Client-side cart and wishlist, quantity/totals, WhatsApp handoff.
- Search, sale/new/popular filters and category navigation.
- Netlify Forms with honeypots and inline success states.
- Unique titles/descriptions, canonical URLs, OG/Twitter tags, sitemap and robots.
- Mobile drawer, keyboard dropdown support, skip link, labelled inputs, no CLS.
- Optional product-image support in the build.

---

## 0. Launch gates — P0

- [ ] Replace every placeholder in `site/data/site.json`:
  - [ ] `url` → final domain (currently `https://litty.netlify.app`)
  - [ ] `email` → real business inbox (currently `info@litty.com`)
  - [ ] `phone`, `phoneDisplay` → real number
  - [ ] `whatsapp` → international format, digits only (e.g. `2348012345678`)
  - [ ] `address` → real studio / pickup address
  - [ ] `instagram`, `instagramHandle` → confirmed account
- [ ] Buy/connect a custom domain, enable HTTPS, update `url`, rebuild.
- [ ] Create a brand email (`orders@` or `hello@`) and forward it to your phone.
- [ ] Confirm commercial settings in `site.json`:
  - [ ] free-shipping threshold
  - [ ] flat shipping fee
  - [ ] VAT rate
- [ ] Enable **Netlify form notifications** for all four forms:
  - [ ] `contact`
  - [ ] `order-request`
  - [ ] `track-order`
  - [ ] `newsletter`
- [ ] Submit each form on the **deployed** URL and confirm delivery.
- [ ] Turn on Netlify spam protection (reCAPTCHA or honeypot is already present).
- [ ] Review `site/pages/policies.html` with your business/legal details:
  - [ ] business/legal name and RC number (if applicable)
  - [ ] real address and contact email
  - [ ] returns/refunds wording
  - [ ] NDPR/NDPA data-processing wording matches your tools
- [ ] Add privacy-friendly analytics (Plausible/Fathom) or GA4 + consent.
- [ ] Verify Google Search Console + submit `sitemap.xml`.
- [ ] Run `node build.mjs`, deploy, and smoke-test every page (see §10).
- [ ] Confirm old URLs redirect: `/home`, `/home/`, `/home.html`, `/products.html`, `/contact.html`.
- [ ] Confirm old root drafts (`home.html`, `products.html`, `about.html`, `contact.html`) are **not** deployed.
- [ ] Back up `site/`, `dist/`, and the deploy zip.

> **Done when:** no placeholder text remains, all four forms arrive in your inbox, redirects and 404 work, and the site is live on its real domain.

Useful check:

```bash
grep -RIn "info@litty.com\|(123) 456-7890\|123 Clay Street\|litty.netlify.app" site dist
```

---

## 1. Product proof & catalogue — P1

### Photography

- [ ] Define a consistent look: matte charcoal backdrop, diffused window light, no harsh flash.
- [ ] Shot list per piece: **front**, **texture/detail**, **in-hand/scale**, plus one lifestyle shot.
- [ ] Add one wide **hero lifestyle** image for the homepage.
- [ ] Add process shots: greenware, glazing, kiln, packaging.
- [ ] Export formats:
  - [ ] card image ~1200×1500 (4:5), WebP/AVIF
  - [ ] hero ~2400 px wide, WebP/AVIF
  - [ ] thumbnail ~600 px
- [ ] Use `width`/`height`, `srcset`, `loading="lazy"` below the fold, `fetchpriority="high"` on the hero.
- [ ] Write descriptive alt text: product name + material + colour + context.

### Wire the images in

- [ ] Create `site/assets/images/`.
- [ ] Add an `image` field per product in `products.json`:
  ```json
  "image": "/assets/images/premium-clay-case-01.webp"
  ```
- [ ] Rebuild and confirm cards, cart lines and checkout summaries show the photo.
- [ ] Add an `images` array (3–5) when product detail pages are added.

### Product detail pages

- [ ] Add a `product.html` template to `site/pages/` and generate `/products/<slug>/`.
- [ ] Include: gallery, price, **1 of 1** note, dimensions, weight, material, finish, care, lead time, availability, Add to Cart, Reserve on WhatsApp, shipping/returns accordion, related pieces.
- [ ] Add Product/Offer + BreadcrumbList JSON-LD.
- [ ] Add unique `<title>`, meta description and OG image per product.
- [ ] Link product cards and cart items to the detail page.
- [ ] Add all product URLs to `sitemap.xml`.
- [ ] Add a sold/archive state so sold pieces remain viewable.

### Copy

- [ ] Rewrite all 36 descriptions with material, dimensions, finish, care and what makes each piece unique.
- [ ] Remove duplicated lines such as “Timeless design with premium finish.”
- [ ] Add 150–250 word intros to each category page.
- [ ] Add “made in / ships from” provenance.
- [ ] Add care instructions (hand wash, avoid thermal shock, etc.).
- [ ] Add an artist name, photo and process story to the About page.

> **Done when:** every product has 3+ photos, a detail page, unique copy, specs and alt text.

---

## 2. Trust & conversion — P1

- [ ] Replace “**Secure checkout**” in the promo strip with accurate wording: “No card details needed — pay after confirmation.”
- [ ] State **lead time**, **ships from**, and **returns window** near Add to Cart and at checkout.
- [ ] Add 3–5 genuine testimonials with names/photos (with permission). Do not invent reviews.
- [ ] Add an Instagram grid or UGC section.
- [ ] Remove **Account** from the top bar until real accounts exist; use “Track order” or “Order help”.
- [ ] Add a “How it works” 3-step section to the homepage (choose → request → confirm).
- [ ] Add a dedicated **Custom Orders** page with budget, timeline, references and a form.
- [ ] Add a **Wholesale** page with minimums, lead times and an enquiry form.
- [ ] Add a pickup option and/or delivery estimate for Lagos.
- [ ] Reduce required checkout fields; keep only what is needed to quote delivery.
- [ ] Add a response-time promise (“we reply within one business day”).
- [ ] Add an FAQ link next to the checkout submit button.
- [ ] Add sold-out handling and a “notify me” path.
- [ ] Add bundles/sets (e.g. lighter case + ash tray) to raise average order value.
- [ ] Add a gift-note field (optional).

> **Done when:** a first-time buyer can understand the product, total cost, timing and next step without messaging you.

---

## 3. Payments & operations — P1/P2

- [ ] Decide the selling model:
  - [ ] Payment links (Paystack/Flutterwave) — fastest
  - [ ] Netlify Function + Paystack/Flutterwave — real cart checkout
  - [ ] Shopify Buy Button / Snipcart — managed commerce
- [ ] Complete provider KYC/business verification and confirm fees.
- [ ] Keep secret keys in Netlify environment variables — never in `site.js`.
- [ ] Implement and test:
  - [ ] successful payment
  - [ ] failed/cancelled payment
  - [ ] refund
  - [ ] webhook/verification
  - [ ] order confirmation email
- [ ] Keep WhatsApp as a first-class fallback with the prefilled cart message.
- [ ] Choose order management: Netlify Forms inbox, Google Sheet, Airtable or Shopify.
- [ ] Add an auto-reply to every order request.
- [ ] Define an inventory/sold workflow (update `products.json` + rebuild).
- [ ] Connect the newsletter to MailerLite/Buttondown — Netlify Forms is **not** a mailing list.
- [ ] Add a welcome email / first-access-to-drops automation.
- [ ] Add abandoned-cart follow-up only after payments exist.

> **Done when:** a paid order reaches you and the customer receives confirmation without manual copy/paste.

---

## 4. Performance — P1

### Icons

- [ ] List every icon in use (currently ~20: fire, inbox, key, smoking, heart, cart, search, user, etc.).
- [ ] Replace Font Awesome with an inline SVG sprite (`<symbol>` + `<use>`).
- [ ] Remove the Font Awesome CDN link from `site/layouts/base.html`.
- [ ] Expected saving: **~300 KB**.

### Fonts

- [ ] Self-host Inter and Playfair Display as woff2 in `site/assets/fonts/`.
- [ ] Add `@font-face` with `font-display: swap`.
- [ ] Preload the two above-the-fold font files.
- [ ] Remove the Google Fonts `<link>`.
- [ ] Subset to Latin if the foundry allows it.

### CSS

- [ ] Bundle the 45 `@import`s into one CSS file at build time.
- [ ] Remove unused design-system component/pattern files.
- [ ] Purge selectors not present in the HTML/JS.
- [ ] Minify the bundle.
- [ ] Keep only the token/reset/utilities/theme layers actually used by legacy pages.
- [ ] Target: **< 50 KB** CSS, one request.

### Delivery

- [ ] Hash asset filenames (`site.<hash>.css`, `site.<hash>.js`) and cache for 1 year.
- [ ] Preload the hero image/font.
- [ ] Add an image optimization step (AVIF/WebP + responsive sizes).
- [ ] Add a CSP after self-hosting; keep `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- [ ] Add a Lighthouse CI budget to catch regressions.

> **Done when:** initial transfer < 150 KB, LCP < 1 s on a fast connection, LCP < 2.5 s on throttled mobile, CLS < 0.1.

---

## 5. SEO & content — P2

- [ ] Add Organization/LocalBusiness JSON-LD to the homepage (name, logo, URL, Instagram, contact).
- [ ] Add Product/Offer schema on product detail pages.
- [ ] Add BreadcrumbList schema.
- [ ] Add FAQPage schema to the FAQ page.
- [ ] Add per-page/per-product OG images.
- [ ] Create/claim Google Business Profile if you offer pickup or local delivery.
- [ ] Verify Search Console and submit the sitemap.
- [ ] Add unique category and product copy (see §1).
- [ ] Add a care guide and 2–3 journal posts — only if you can publish consistently.
- [ ] Add internal links from guides to products.
- [ ] Keep name/address/phone consistent everywhere (NAP).
- [ ] Review `robots.txt`, canonical URLs and `noindex` after the domain change.
- [ ] Consider `hreflang`/multi-currency only if international demand appears.

> **Done when:** Rich Results test passes for Organization, Product and FAQ; sitemap is submitted; 10+ indexable content pages exist.

---

## 6. Measurement — P1

- [ ] Choose analytics: Plausible/Fathom (no cookie banner) or GA4 (consent required).
- [ ] Add the script and verify it loads once.
- [ ] Track these events in `site.js`:
  - [ ] `add_to_cart` (id, name, value)
  - [ ] `begin_checkout` (value, items)
  - [ ] `order_request` (value, items)
  - [ ] `whatsapp_click`
  - [ ] `newsletter_signup`
  - [ ] `search` (term)
  - [ ] `view_item` (product pages)
  - [ ] `filter` (category/sort)
- [ ] Create UTM conventions for Instagram bio links.
- [ ] Build a one-page dashboard: sessions → product views → carts → orders → revenue.
- [ ] Review monthly; keep/change one thing at a time.

> **Done when:** you can answer “which product, page and channel drive orders?” without guessing.

---

## 7. Accessibility & UX — P2

- [ ] Add a focus trap and focus return to the search overlay and mobile drawer.
- [ ] Add `aria-current="page"` to the active main-nav link (category nav already has it).
- [ ] Add `aria-live="polite"` to filtered search results and cart-count updates.
- [ ] Add inline form errors with `aria-describedby` (native validation alone is not enough).
- [ ] Set form inputs to **16px** on mobile (currently 15px triggers iOS zoom).
- [ ] Increase the wishlist button and small controls to **44px** tap targets.
- [ ] Use `env(safe-area-inset-bottom)` for the WhatsApp float.
- [ ] Ensure the WhatsApp float never covers a primary CTA.
- [ ] Keyboard-test the full request flow (tab, enter, escape, focus visible).
- [ ] Screen-reader test (VoiceOver/NVDA).
- [ ] Run axe/Lighthouse accessibility and fix criticals.
- [ ] Test 360 px, 390 px, iPad, iOS Safari and Android Chrome.
- [ ] Add a visible “Skip to content” link (already present — verify).

> **Done when:** a keyboard-only user can browse, add to cart and submit an order request.

---

## 8. Operations & maintenance — P3

- [ ] Add `package.json` scripts: `build`, `preview`, `package`, `check`.
- [ ] Add CI: `node build.mjs` + link check + Lighthouse CI on every push.
- [ ] Add asset versioning/hashing (see §4).
- [ ] If drops are frequent, add a Git-based CMS (Decap) or Airtable → JSON sync.
- [ ] Back up `site/data/*.json` before each drop.
- [ ] Add uptime monitoring (Netlify notifications or UptimeRobot).
- [ ] Review form spam monthly.
- [ ] Review privacy policy against actual tools (NDPR/NDPA).
- [ ] Quarterly content/photo refresh; remove sold pieces or move to archive.
- [ ] Keep `dist/` and `litty-netlify-site.zip` fresh after every change.

> **Done when:** a non-developer can update products safely, and a broken deploy is caught before customers see it.

---

## 9. Deliberately deferred

- [ ] Customer accounts/login — wait until repeat-purchase data justifies it.
- [ ] PWA/offline mode.
- [ ] Multi-currency.
- [ ] Heavy scroll animations.
- [ ] A blog without a publishing cadence.
- [ ] Chatbot (WhatsApp is better).
- [ ] Loyalty program.
- [ ] Review schema before genuine reviews exist.
- [ ] Live Instagram API embed (use a curated static grid first).

---

## 10. Deploy smoke test — repeat every release

- [ ] `node build.mjs` passes with no broken links or unresolved tokens.
- [ ] `/`, `/products/`, one category, `/about/`, `/contact/`, `/cart/`, `/checkout/`, `/wishlist/`, `/account/`, `/track-order/`, `/faq/`, `/policies/` return 200.
- [ ] `/404.html` and an unknown URL return the styled 404.
- [ ] Old URLs redirect (`/home`, `/products.html`).
- [ ] Desktop nav dropdown works; mobile drawer opens/closes; Escape works.
- [ ] Search returns filtered results; `Clear` restores the catalogue.
- [ ] Add to cart, increase, decrease, remove; totals and badge update.
- [ ] Checkout with items submits; empty checkout shows the empty state.
- [ ] Wishlist save/remove persists after reload.
- [ ] All four forms submit and arrive in the Netlify inbox.
- [ ] No console errors; no failed network requests.
- [ ] OG image, favicon, sitemap and robots load.
- [ ] Test one real iOS and one Android device.

> **Done when:** every box is checked on the **deployed** URL, not just localhost.

---

## 11. Suggested sequence

### Week 1 — make it launchable

- P0 placeholders, domain, forms, legal, analytics.
- Photos for the top 8 pieces + image fields.
- Fix “Secure checkout” copy and add lead time/returns.
- Remove Font Awesome, self-host fonts.

### Week 2 — make it sell

- Product detail pages + unique copy + Product schema.
- Testimonials, artist story, Instagram grid.
- Bundle/purge CSS; image pipeline; Lighthouse budget.
- Email-list integration.

### Weeks 3–4 — reduce friction

- Paystack/Flutterwave payments or payment links.
- Custom-order and wholesale pages.
- Checkout field reduction + pickup/delivery estimate.
- Accessibility polish (focus, errors, tap targets).

### Month 2 — grow

- SEO content, Google Business Profile, journal/care guides.
- Conversion experiments (photos, ordering, bundles).
- CI, CMS option, quarterly maintenance rhythm.

---

## 12. Commands

```bash
# Rebuild + validate links
node build.mjs

# Preview with pretty URLs
python3 -m http.server 8899 --directory dist

# Refresh the Netlify upload zip
cd dist && zip -r -X ../litty-netlify-site.zip . && cd ..

# Find leftover placeholders
grep -RIn "info@litty.com\|(123) 456-7890\|123 Clay Street\|litty.netlify.app" site dist
```

---

*Owned by:* ________ · *Last reviewed:* 28 Oct 2026 · *Next review:* ________
