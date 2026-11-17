# NeuroWire admin access

The admin controls now use a signed, HTTP-only session cookie. The old `?admin=true` URL switch and browser-storage flag are not accepted as proof of access.

Before using admin sign-in on a deployment, configure these server-only environment variables:

- `NEUROWIRE_ADMIN_PASSWORD`: a long, unique admin password.
- `NEUROWIRE_ADMIN_SESSION_SECRET`: a random secret with at least 32 characters.

Do not add either value to source files, commit them to GitHub, or use a `NEXT_PUBLIC_` prefix. Keep the signing secret private. Changing the signing secret invalidates existing sessions.

The session cookie is HTTP-only, uses SameSite=Strict, is Secure in production, and expires after 12 hours. Sign out clears the browser cookie. The protected Admin Dashboard also provides a sign-out control.

Manual article publishing is routed through the protected server endpoint and uses the existing server-side Supabase client helper. No Supabase project settings, credentials, schema, or database configuration were changed in this branch.

## Current limits

- This is a single-admin password gate, not a multi-author account and approval system.
- Login attempt rate limiting and central session revocation still need a deployment-level solution before treating this as a complete production identity system.
- The project branch has not been deployed. Its environment variables have not been configured or tested here.
- Supabase Row Level Security policies were not inspected or changed. Until those policies are verified separately, do not assume this route prevents every possible direct write using a public database key.
