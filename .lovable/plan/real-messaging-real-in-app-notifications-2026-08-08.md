# Real messaging + real in-app notifications

Today the Notifications page is a mock: its inbox array is empty and hardcoded, and all preference toggles, quiet hours and "send test" buttons only change local state. The `notifications` table already exists (with read-own / update-own / delete-own rules and no insert path), but nothing writes to it and nothing reads from it. Messaging is already real (live chat, images by URL) but has no unread counts, no read receipts and no typing indicator.

This plan makes everything that is free actually work, and honestly marks the paid channels as unavailable.

## What you'll get

**In-app notifications (real)**
- A live inbox on `/notifications` reading your own notifications from the database, updating instantly when a new one arrives.
- Unread count badge in the header of Notifications, Messages, and both dashboards, linking to the inbox.
- Mark one / mark all as read, delete, filter by category, "unread only" — all persisted.
- Notifications are created automatically by the backend when:
  - a booking is created, accepted, declined, completed or cancelled (both sides notified)
  - a payment is confirmed, escrow is held, or a payout/release happens
  - a new chat message arrives while you're not in that conversation
  - a review is left on your work
- Each notification deep-links to the right page (booking, wallet, conversation, review).

**Delivery preferences (real, persisted)**
- Your per-category channel toggles, quiet hours and digest choice are saved to your account instead of resetting on reload.
- In-app stays the only channel that actually delivers right now. Email, SMS and Push rows are shown but clearly marked "Not available yet" and disabled, with a short note on what each needs (an email sending service, an SMS provider, and web-push keys). The fake "send test" buttons are removed for those channels.

**Messaging upgrades (all free)**
- Unread message count per conversation in the sidebar, and a total badge in the header.
- Read receipts: sent / delivered / read ticks, based on a per-participant "last read" marker.
- Typing indicator using realtime broadcast (nothing stored).
- Real image sending: pick a file from your device and it uploads, replacing the current "paste an image URL" box.

## Out of scope (not free)

Email, SMS and web push are not built. They need a paid or key-based provider; the UI will say so rather than pretending.

## Technical notes

1. **Migration**
   - `notification_preferences` table keyed by user id: JSON channel matrix, quiet-hours on/from/to, digest; RLS scoped to `auth.uid()`, plus GRANTs.
   - Add `last_read_at` to `conversation_participants` (owner-updatable) for read receipts and unread counts.
   - `SECURITY DEFINER` trigger functions inserting into `notifications`: on `messages` insert (notify other participants), on `bookings` insert/status change, on `wallet_transactions` insert. Insert stays trigger-only — no client insert policy.
   - Add `notifications` and `conversation_participants` to the `supabase_realtime` publication.
   - Storage bucket `chat-images` (public read, authenticated write to own folder) for message image uploads.
2. **Frontend**
   - New `src/hooks/useNotifications.ts`: query + realtime subscription + mark-read/delete mutations, teardown on unmount.
   - New `src/components/NotificationBell.tsx` used in page headers.
   - Rewrite `/notifications` inbox and settings sections against real data; disable non-in-app channels.
   - `src/routes/messages.tsx`: unread badges, `last_read_at` updates on conversation open, ticks, typing broadcast channel, file upload to storage.
