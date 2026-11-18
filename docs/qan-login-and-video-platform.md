# FOX QAN authentication and international video platform reference

## QAN login reference vs production

QAN/QANML syntax in this repository is a design convention, not a verified runtime contract. Treat snippets as pseudocode until a parser/runtime exists. Keep the demo/reference separate from the production authentication implementation.

### Corrected login flow

- Registration collects user ID, display name, password, and password confirmation.
- Login collects user ID and password only. Display name is registration/profile data, not a login credential.
- QAN pages call server endpoints; they never read credentials from a client-side database.
- The server validates inputs, stores a modern password hash (for example Argon2id), issues a server-managed session, and returns only safe profile fields.
- Use HTTPS, CSRF protections, login rate limits, generic failure messages, unique user IDs, and secure `HttpOnly; Secure; SameSite` session cookies. Rotate session IDs after authentication and invalidate sessions at logout.
- Do not use Foxcrypt or another custom scheme as a replacement for a reviewed password-hashing implementation. Do not store plaintext passwords or return password hashes to a client.

Suggested API contract (implementation is intentionally not stubbed into this frontend-only repository):

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Validate and create an account; hash password server-side |
| POST | `/api/auth/login` | Verify credentials and set a secure session cookie |
| GET | `/api/auth/session` | Return `{ authenticated, user: { id, username } }` |
| POST | `/api/auth/logout` | Invalidate the current session |

On page load, show a loading state while checking `/api/auth/session`; render the application only for an authenticated session. Otherwise navigate to the login page. Never use a browser-only `signIn` function or hardcoded credentials as production authentication.

## Video platform prototype

Visit `/video` for the FOX OS frontend prototype, “Nami Video.” It demonstrates a global discovery list, Japanese/English/Spanish/Korean interface labels, searchable demo videos, selectable videos, toggleable on-screen comments, and a local comment form.

The upload control only previews a file selected by the current user in the current browser using an object URL. It does not send, publish, or retain the file. The list and comments are sample data stored in component memory. No backend, streaming, account, CDN, moderation, or public publishing service is implemented.

Before production, design and implement separately:

1. User accounts and authorization with server-side sessions.
2. Resumable, size/type-limited uploads to private object storage, malware scanning, transcoding, and a CDN; use short-lived authorized playback URLs.
3. Captions, language metadata, localization, accessible controls, and user-selectable comment language/translation.
4. Comment moderation, report/block flows, rate limits, spam prevention, child safety policies, copyright notice/takedown, appeals, and clear community rules.
5. Privacy controls, retention limits, consent, data export/deletion, and regional legal review before serving each market.
6. Security review, abuse monitoring, backups, observability, and operational response procedures.

## Grok handoff message

Copy this brief into Grok when you are ready; this repository change does not send messages to Grok automatically:

> Review the FOX OS Nami Video prototype at `/video` and its design notes in `docs/qan-login-and-video-platform.md`. Propose an incremental, production-oriented architecture for an international user-generated video service. Keep authentication server-side; never invent custom password crypto or expose secrets. Cover resumable uploads, private object storage, transcoding/CDN, captions/localization, comment moderation and reporting, copyright workflows, accessibility, privacy/data deletion, child-safety and regional legal review, abuse prevention, observability, testing, and staged rollout. First provide a threat model and architecture proposal; do not claim the demo already uploads or streams video. Make changes only after the repository owner approves a specific implementation plan.
