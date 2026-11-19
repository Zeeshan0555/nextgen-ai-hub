# NeuroWire 21-Publication Vision — Existing Project Improvement Guide
Status: active guide for improving the existing NeuroWire project. This is NOT a replacement roadmap or a new project.
Last consolidated: 19 November 2026.

## Core direction
Use the 21-publication vision to improve NeuroWire's existing code, features, workflows, reader experience and quality. Keep the existing roadmap, categories, publishing lanes, useful features and project structure where possible. Make changes incrementally and verify them. No needless rewrites or redesigns.

NeuroWire should be advanced behind the scenes, but easy and familiar to readers. Premium and professional, clear and uncluttered. Use simple, natural human English throughout: headlines, summaries, navigation, labels, buttons, explanations, controls and documentation. Avoid jargon, scientific-sounding terms and strange language. Robotics is entirely out of scope: no robotics coverage, categories, features, roadmap items or content.

## 21 publications informing the vision
Reuters; Bloomberg; Financial Times; Wall Street Journal; New York Times; BBC News; Associated Press; The Guardian; The Economist; CNBC; Axios; Semafor; The Information; TechCrunch; The Verge; WIRED; Ars Technica; MIT Technology Review; CoinDesk; Cointelegraph; Investing.com.

Research should be evidence-based. Record the specific page/feature observed, date checked, strengths, limitations, and relevant idea; distinguish direct inspection from search-indexed or inaccessible pages. Never claim a site or feature was fully inspected if access was limited. Do not merely copy features: choose what is useful for NeuroWire readers.

## Research observations and inspiration (not feature promises)
- Reuters: live coverage and update trails, author profiles, source/correction and reporting standards.
- Bloomberg: live business coverage, audio, briefings and newsletters.
- Financial Times: live coverage, editor picks, top stories and deeper reads.
- WSJ: separate audio/video and reading formats.
- New York Times: saved articles, sharing, recently viewed and audio/video formats.
- BBC: topic sections, live coverage, multimedia and newsletters.
- AP: topic sections, fact-checking, photo stories and reader-selected alerts.
- Guardian: editions, topic navigation, News/Opinion distinctions and visual stories.
- Economist: daily/weekly formats, narrated articles, podcasts, video and newsletters.
- CNBC: personalized topics, saved stories, alerts, live audio and reading accessibility.
- Axios: concise structure, context and distinct story sections such as why it matters and what is known.
- Semafor: topic/region navigation, briefings and separation of news from analysis.
- The Information: original technology-business reporting, charts, company research tools (advanced research features are not automatically suitable).
- TechCrunch: search, topics, latest headlines, writer/time details, newsletters and media.
- The Verge: latest/following views, topic pages, search and appearance settings.
- WIRED: picks, topic sections, newsletters, podcasts, video and live coverage.
- Ars Technica: layout choices, reading controls and reduced-distraction article view.
- MIT Technology Review: concise daily briefing on technology news.
- CoinDesk: topics, research, data resources and newsletters.
- Cointelegraph: live news, clear writer/editor details, key points and content labels.
- Investing.com: topic sections and event calendars (market-heavy widgets are not automatically appropriate).

This consolidated review was a mixed-access check on 19 Nov 2026: direct homepage/page inspection was possible for 16 publications; direct access to NYT, BBC, Economist, CNBC and MIT Technology Review homepages was restricted, so official feature/help/search-indexed material was used for those. Some article pages were also sampled. This is not a claim of exhaustive testing of every page or feature.

## Keep existing product scope and foundations
- Preserve the existing six categories: AI, Crypto, Policy, Technology, Fox News and Leadership.
- Preserve the existing publishing lanes, automatic news publishing, Author Articles, mixed/latest feed, existing useful reader features, admin/auth routes and SEO/sitemap behavior.
- Keep the existing roadmap. Improvements should be fitted into it rather than replacing it.
- No production deployment, main-branch merge or destructive rewrite without explicit authorization.
- Do not change Supabase settings, configuration, databases, schema, tables, policies, migrations, authentication configuration or production data unless separately approved.
- Do not remove working features simply because they are difficult.
- No asset-specific trading signals, predictions, buy/sell suggestions, trading plans or trading/price widgets in this scope; business news is educational context.

## Reader experience: practical improvements
### Homepage and discovery
- Clear priority for important stories, latest news, trending coverage and useful analysis; avoid clutter and excessive decoration.
- Strong topic/category navigation and usable layouts on mobile and desktop.
- Search with practical spelling tolerance where feasible, filters for date/category/source and an obvious reset.
- Related coverage and topic pages that help readers follow stories over time.

### Article reading
- Comfortable, readable typography, spacing, contrast and headings.
- Clear title, summary, body, date, writer when available, original source link, relevant background and related stories.
- Story updates/timeline when useful; clearly distinguish what is confirmed, developing or uncertain using rules, not invented labels.
- Reduce distracting elements; no autoplay, intrusive popups or motion that interferes.
- Support light/dark/system appearance and useful text-size controls if practical.
- Accessible keyboard navigation, visible focus, screen-reader labels, image descriptions and reduced-motion behavior.
- Consider listen/audio reading only if it can be implemented reliably and accessibly.

### Reader's own space
Evaluate and implement useful, secure, sustainable reader tools where they fit existing architecture: saved/bookmarked stories, followed topics, recently read items, optional alerts and personal preferences. Do not promise features dependent on unapproved backend work, expensive services or insecure storage. Respect privacy and clear opt-in.

### Context, trust and transparency
- Show sources, dates and authors where available.
- Explain AI use honestly; never claim human review if it did not occur.
- Corrections should be visible with date/reason.
- Evidence/source links for important claims where practical.
- Avoid treating copies of one original report as independent confirmations.
- Clearly label sponsored content, commissioned content and analysis.
- Headlines should accurately match stories; explain uncertainty and limitations.
- Publisher details, contact and editorial/source/correction/AI-use policies should be easy to find.
- Context and related stories should help readers understand what happened and what changed without jargon.

### Briefings and distribution
Evaluate daily/weekly briefings, newsletters, sharing and notifications only when useful, reliable, affordable, privacy-respecting and supported by clear opt-in/unsubscribe. Accurate social previews and SEO should be maintained.

## Admin Dashboard and Author system — implement, do not ask the user to build
The assistant/development work is responsible for programming, reviewing and testing the Admin and Author experiences and their workflows. The user will create/set up the actual accounts and credentials later; do not ask the user to program these systems, and do not create accounts or credentials on their behalf.

### Admin experience
Audit existing routes and implement/refine a clear, secure, practical admin dashboard that preserves existing functionality. Evaluate and cover:
- Overview with meaningful status and activity, not decorative metrics.
- News/article management: list, search, filters, preview, edit, publish/unpublish, schedule if supported, archive and safe deletion with confirmation.
- Automated publishing oversight: status, errors, duplicate handling, source details and safe retry controls where present/needed.
- Source management and quality/accuracy checks; avoid unsupported trust scores.
- Categories and topic management within the existing six categories.
- Author/content management and clear workflow status.
- Corrections, sponsored-content labels and editorial disclosures.
- Manage settings only within approved scope; Supabase and production configuration remain off limits without approval.
- Accessible, mobile-usable controls; role boundaries; secure validation; audit/activity records where appropriate.
- Confirm important/destructive actions and provide understandable error/empty/loading states.

### Author experience
Audit existing routes and implement/refine a dedicated, clear Author workflow. Evaluate and cover:
- Author dashboard with drafts, submitted, published and revision-needed statuses.
- Create/edit article, autosave where safe, preview, clear writing/editor controls and image description field.
- Category assignment limited to existing categories, tags if supported, headline, summary, body and sources.
- Save draft, submit for review, view feedback, resubmit and see publication status; publishing permissions should match existing role design.
- Helpful word/readability guidance without needless jargon.
- Responsive and accessible forms, validation and recovery from errors.
- Clear ownership and role boundaries; no exposing admin-only functions to Authors.
- Do not create the user's accounts; build and test the software workflow.

Admin and Author must be treated as first-class project work, not overlooked benchmark extras. Preserve existing routes/behavior where possible and verify the role flows using safe test fixtures or available tests, without changing live accounts/data.

## Quality, implementation and checkpoints
- Inspect the current project before modifying; understand existing routes, features and tests.
- Fix root causes; avoid unverified or superficial changes.
- Keep simple natural English, no robotics and no needless jargon.
- Verify every change with available tests, typecheck, lint/build and/or manual review as applicable; record exactly what was and was not run.
- Do not invent test results or claim complete audits without evidence.
- Check security, privacy, accessibility, responsiveness, performance, SEO and reliability proportionately.
- At approved milestones create a full-project checkpoint ZIP with progress report and internal CHECKSUMS.sha256 manifest, verify the manifest, save to the ChatGPT Library at /NeuroWire/Checkpoints/, preserve earlier checkpoints and provide a link only after confirming the file exists.
- Work toward the user's requested two-day target, but do not falsely claim continuous background work or promise perfection.
