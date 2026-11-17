# NeuroWire AI and automated newsroom setup

## What the automatic feed does

The scheduled feed checks selected official company and public-agency RSS sources. It stores only a headline, publisher name, publication date, category and a direct HTTPS link to the original publisher. It does not copy the RSS article text or publisher images into automated headline records.

The homepage can still show fresh headline cards if the database is temporarily empty, because it merges the live public headline feed with saved newsroom records. Headline cards link directly to the source. Headline-only records are not included in the article sitemap and their internal article routes are marked noindex.

Fox News remains a category in the website, but it is a direct link to Fox News' official website rather than an automated Fox RSS republication feed.

## Gemini configuration

Add these server-side environment variables in the deployment provider:

- `GEMINI_API_KEY`: private API key created through Google AI Studio. Never expose it in browser code and never use a `NEXT_PUBLIC_` prefix.
- `GEMINI_MODEL`: optional model override. The default is `gemini-3.8-flash`.

The same key is used by two separate features:
1. Optional headline classification using only the headline and publisher name. If it is not configured or returns an uncertain result, the feed keeps its configured category.
2. An Admin-only draft endpoint. It accepts editor-provided notes or source material the editor is authorised to use, requires at least 900 characters, and asks Gemini for a structured briefing with short evidence excerpts. Every excerpt is matched against the submitted material before the draft is returned.

## Human review and publishing

The AI endpoint only returns a draft. It does not write to the database and it does not publish. The signed-in Admin must review and edit the final content, then explicitly submit it through the existing protected Admin publishing route.

Do not paste an entire copyrighted article into the draft tool unless NeuroWire has permission to use it. Prefer original notes, multiple properly attributed facts, and short source evidence that the editor is allowed to use.

## Fallback behaviour

The automatic headline feed continues to work without a Gemini key. If AI classification is unavailable, source-configured categories are used. If AI drafting is unavailable or its evidence checks fail, no draft is returned; the Admin can edit their own original notes or try again later.

## Existing service settings

The publishing route continues to use the existing server environment values `CRON_SECRET`, `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) and `SUPABASE_SERVICE_ROLE_KEY`. This work does not change Supabase settings, schema, policies, migrations or production data.
