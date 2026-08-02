# Ọjà email templates

## What's in here

- `confirm-signup.html` — the signup verification email
- `reset-password.html` — the "forgot password" email

Both are built for Supabase's built-in Auth email system: table-based
layout, all CSS inlined, 600px max width. This matters because most email
clients (Outlook, Gmail on some devices) strip `<style>` blocks and don't
support flexbox/grid — table layout with inline styles is the only
approach that renders consistently everywhere.

## How to install them (2 minutes, no code deploy needed)

1. Supabase Dashboard → **Authentication** → **Email Templates**
2. Click **"Confirm signup"** → replace the body with the full contents of
   `confirm-signup.html` → Save
3. Click **"Reset Password"** → replace the body with the full contents of
   `reset-password.html` → Save

That's it — Supabase sends these automatically already; this just changes
what they look like. No migration, no deploy.

## What this does NOT cover yet

A "welcome" email, "booking confirmed", and "escrow released" emails are
**not** Supabase Auth emails — they're custom transactional emails tied to
real app events (a booking being created, a payment being released,
etc.). Supabase's built-in email system only handles auth-related emails
(signup, password reset, magic link, email change).

To send those, the app needs an actual email-sending service wired up
(e.g. Resend, which pairs well with Supabase Edge Functions) plus new
Edge Functions that call it when a booking/payment event happens. That
needs an API key from a real email provider before it can be built —
happy to build it once that's in place.
