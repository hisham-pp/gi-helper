# Feedback

Visitors send feedback, bug reports, ideas and other messages from
`/feedback`, with an optional name and up to 3 screenshots. Only the
**feedback** kind is listed on that page; everything is read in the private
inbox at `/feedback/inbox`, which only seeded accounts can open.

- Pages: `src/app/(site)/feedback/page.tsx`, `src/app/(site)/feedback/inbox/page.tsx`
- UI: `src/components/feedback/` (`FeedbackBoard`, `SendFeedbackModal`, `FeedbackInbox`, `InboxLogin`)
- API: `src/app/api/feedback/` (list and send, images, session, inbox)
- Server: `src/lib/feedback/server.ts`; shared types and limits in `types.ts`
- Database: `supabase/migrations/*_feedback.sql` (Supabase project `gi-helper`)
- Tests: `tests/feedback.test.ts`

## How it fits together

| Piece | Where | Notes |
|-------|-------|-------|
| Tables | `feedback_private.entries`, `images`, `admins`, `sessions` | A schema the Supabase API doesn't expose; RLS on with no policies. |
| API surface | `public.feedback_*` functions | `security definer`, `search_path = ''`. Each validates its input, so calling them directly with the key is no shortcut. Only `anon` may execute them. |
| App access | `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` | Server-only env vars; the route handlers call the functions over `/rest/v1/rpc`. No service-role key needed. |
| Bad words | `src/lib/feedback/profanity.ts` | The `bad-words` package. The form warns while typing; the server masks names and messages (`****`) before saving. `ALLOWED` lists words it shouldn't mask (e.g. "god"). |
| Images | `compress-image.ts`, `images.ts` | The browser shrinks each image to at most 1600 px and re-encodes it as WebP (JPEG on Safari), which strips EXIF. Server and database both check magic bytes: PNG, JPEG or WebP only, 1.5 MB each. Stored as `bytea`. |
| Image access | `/api/feedback/images/[id]` | Images on visible feedback are public (10-minute cache); the rest need an inbox session. |
| Spam | `feedback_submit` | 5 messages per sender per 10 minutes, 30 a minute overall. Senders are told apart by a salted hash of their IP (`FEEDBACK_HASH_SALT`); the IP itself isn't stored. A hidden `website` field catches simple bots. |

## Inbox accounts

There's no sign-up and no Supabase Auth: accounts are rows in
`feedback_private.admins` with a bcrypt hash. Signing in calls
`feedback_admin_login`, which checks the password with pgcrypto and returns a
random token; the browser keeps it in the `gi_feedback_session` cookie
(httpOnly, SameSite=Lax, 7 days) and the database keeps only its SHA-256.
Five wrong passwords lock the account for 15 minutes.

Add an account or reset a password:

```bash
pnpm feedback:admin <username>
```

It asks for the password (12+ characters) and prints a statement like
`select feedback_private.set_admin('name', '$2b$10$...');`. Run that in the
Supabase SQL editor. Only the hash leaves your machine, and a new password
signs the account out everywhere. `--generate` makes a random password and
saves it to `tmp/feedback-admin-<username>.txt` (gitignored) instead.

Remove an account:

```sql
delete from feedback_private.admins where username = 'name';
```

## In the inbox

- Filter by kind (all, feedback, bugs, ideas, other) and status (new, resolved).
- **Mark resolved** / **Reopen**.
- **Hide from page** takes public feedback off `/feedback` without deleting it.
- **Delete** removes the message and its images for good.
