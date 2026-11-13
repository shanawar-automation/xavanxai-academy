# XavanXAI — what was fixed & improved

## Setup
1. Keep your own `.env` (see `.env.example`; set `AUTH_SECRET` with `openssl rand -base64 48`)
2. `npm install`          (now works — React 19 compatible 3D libs)
3. `npm run db:push && npm run db:seed`   (seed prints a random admin password once)
4. `npm run dev`

## Build-breaking bugs fixed
- `prisma/schema.prisma` was MISSING (only a .md copy) → created; added missing `JobPosition.type` / `summary`
- `npm install` failed: R3F v8 / drei v9 need React 18 → upgraded to R3F v9 / drei v10
- `/login` used `useSearchParams()` without Suspense → production build failed
- Middleware (Edge) imported Node `crypto` via auth.ts → split into `lib/session.ts` (edge-safe) + `lib/password.ts`
- Blog detail page lived at `/[slug]` but links pointed to `/blog/[slug]`; `/services/[slug]` didn't exist → both 404
- TS error in orchestrator (JSON typing)

## Bugs fixed
- Interview room: camera blank after entering room, timer recreated every second, streams never released, no auto-end at 0:00
- Approve/Retry logic marked retried tasks "completed" and inflated counters
- SSE stream leaked intervals on early disconnect
- Evaluate endpoint lacked ownership check
- Settings page checked wrong env var (JWT_SECRET → AUTH_SECRET); analytics role mismatch with middleware
- Footer/privacy anchors (#interview-ethics) and dead links; hard-coded "26"/"12" counts now computed
- AI assistant existed but was never mounted
- Hard-coded default admin password removed; open-redirect on login closed; rate limiting on login/register/chat/tools/booking; duplicate applications blocked; fetch timeouts
- Added `.gitignore` (your `.env` and CV vault were unprotected)

## New / improved
- **Navbar**: mega-menus (Platform / Solutions / Company), hide-on-scroll, scroll-progress line, signed-in avatar, mobile slide-over with focus trap + scroll lock, skip link, full keyboard + ARIA support
- Smoothness: page fade transitions, scroll-reveal, count-up stats, marquee, reduced-motion support, loading / error / 404 pages, favicon, SEO metadata
- Security headers (camera/mic/screen-share still allowed for the interview room)
