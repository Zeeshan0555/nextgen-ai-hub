# NeuroWire AI Editorial Briefing Setup

The publisher feed collector continues to work without an AI key. In that state, stories can still appear in the homepage feed as clearly labelled publisher excerpts, while excerpt-only article pages are kept out of the article sitemap and marked noindex.

## Server-side environment variables

Add these in the deployment provider's server environment settings:

- `GEMINI_API_KEY`: API key from Google AI Studio. Keep it private. Never use a `NEXT_PUBLIC_` prefix.
- `GEMINI_MODEL`: Optional. Defaults to `gemini-3.8-flash`.

The key is used only in the protected scheduled publishing route. It is not sent to the browser and is never returned by the API.

The existing publishing route also relies on the already-configured `CRON_SECRET`, `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`), and `SUPABASE_SERVICE_ROLE_KEY`. This code change does not change any Supabase settings or database schema.

## What happens when the AI service is unavailable

The publisher story is still eligible for the normal homepage feed. The cron route falls back to a short, clearly labelled source excerpt and stores the original publisher URL with the article text. It does not invent a summary, author, fact-check or source.

## Evidence checks

The AI prompt is restricted to the supplied publisher text. The generated briefing must include 2–4 key points with short evidence excerpts. Each evidence excerpt is checked against the supplied text before the briefing is accepted. Failed or incomplete outputs use the source-excerpt fallback instead.

The AI-assisted briefing is still not a human fact-check or independent investigation. Editorial review and original reporting remain important before relying on the site for high-stakes news.
