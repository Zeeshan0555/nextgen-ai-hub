# NeuroWire 21-Publication Benchmark & Product Requirements
Status: active specification; research and implementation must be evidenced, not assumed.
Scope: preserve existing project capabilities; no production deployment; Supabase configuration/database/schema/policies/migrations are out of scope unless separately authorized.

## Benchmark set (21)
1. Reuters — fast, clear reporting, topic and live coverage.
2. Bloomberg — business/market data integrated with news.
3. Financial Times — analysis, visual journalism, business context.
4. Wall Street Journal — specialist business coverage.
5. New York Times — storytelling, multimedia, explainers.
6. BBC News — topic sections, live/video formats, accessibility.
7. Associated Press — news-first reporting and multimedia.
8. The Guardian — investigations, long-form and editorial depth.
9. The Economist — concise analysis and global context.
10. CNBC — business/markets, live formats and data.
11. Axios — concise, structured news presentation.
12. Semafor — separation of facts, perspectives and analysis.
13. The Information — technology-business intelligence.
14. TechCrunch — startups, technology companies, funding and product news.
15. The Verge — visual technology/culture experience.
16. WIRED — investigative technology, science, security and culture.
17. Ars Technica — technical depth and explanatory coverage.
18. MIT Technology Review — emerging technology and research context.
19. CoinDesk — crypto news, data and research.
20. Cointelegraph — crypto/blockchain coverage and explainers.
21. Investing.com — market data, sentiment presentation, asset coverage and economic calendar.

## Research rule
For each publication, inspect publicly accessible live pages and features where possible; record URLs, date checked, observations, screenshots/notes if available, strengths, friction/limitations, and ideas transferable to NeuroWire. Do not present unobserved features or conjectured defects as verified facts. Compare shared industry risks separately from individual-site findings.

## Product target: integrated news + intelligence + context + discovery + transparency
- Rich responsive homepage: multi-column desktop, mobile-first reflow; compact and large card formats; feature/lead stories, latest, trending and analysis; avoid clutter.
- Six existing categories remain: AI, Crypto, Policy, Technology, Fox News, Leadership. Preserve existing publishing lanes and author/admin paths.
- Topic hubs and story clusters: AI models/tools, research, generative AI, agents/automation, robotics, AI business, crypto topics, policy, cybersecurity, devices/software, leadership and other topics mapped to real coverage.
- Story context: What happened; verified key details; why it matters (carefully qualified); what remains unknown; background; timeline; linked coverage and perspectives.
- Briefings/explainers/analysis: label AI assistance and editorial review accurately; source evidence must be traceable; no fabricated context, quotations, numbers, dates or certainty.
- News discovery: search, topic filters, duplicate/near-duplicate clustering and clear source attribution.
- Data visualization: charts only with reliable source, timeframe, units, methodology and caveats; no fabricated or stale data represented as live.
- Reader experience: responsive columns, accessible typography, clear navigation, compact/full reading options where feasible.
- Editorial dashboard: quality review, source checks, correction records, transparent workflow; avoid unsafe pending-author/public-table handling.

## Accessibility and calm UX
- Support screen readers: semantic structure, meaningful accessible names/labels, sensible heading hierarchy, keyboard access and visible focus.
- Clear contrast and readable font sizing, including metadata; don't rely on colour alone to convey meaning.
- Meaningful image alt text; decorative images should not add noise to screen-reader output.
- No intrusive pop-ups and no autoplay videos; respect reduced-motion preferences where feasible.
- Accessible controls, layouts and navigation across small mobile screens as well as desktop.

## Search, discovery and SEO
- Robust search with spelling-tolerant/fuzzy matching where feasible, sensible ranking, and helpful empty states.
- Search filters for category/topic, date range and source, plus clear reset and mobile usability.
- On mobile, keep category navigation easy to reach (sticky category bar when it works with viewport, keyboard and screen-reader navigation; avoid covering content).
- SEO: descriptive titles and metadata, canonical URLs, useful internal links, structured data only when accurate, sitemap/indexing hygiene, crawlable content and no misleading markup.
- Share previews: accurate Open Graph/social preview title, description and image per article/topic where appropriate; verify rendering and fallback behavior.

## Free reader features (avoid paywalling our own useful features)
- Aim to offer useful reader features free rather than imitating competitors' paid gates: search and filters, topic-following, story context, accessible reading, sharing, and briefings where sustainable.
- Optional daily or weekly email briefing/newsletter with clear opt-in, unsubscribe, frequency choice, privacy-conscious handling and no deceptive signup.
- Share-friendly article/topic previews with accurate metadata and readable shared content; avoid claiming premium content without offering it.
- Any feature that has operational/API costs or requires a third-party paid service must be evaluated for sustainable free implementation; do not promise unlimited service before verifying costs and limits.

## Trust and integrity requirements
- Source, original link, verified publication date, author/publisher details when available.
- AI-use disclosures describe actual process (drafting, summary, translation, analysis, review); never imply human review if it did not occur.
- Corrections log: timestamp, change and reason; don't silently erase corrections.
- Evidence/claim links for key factual claims where feasible.
- Multiple perspectives/independent coverage links; don't equate number of links with independent verification.
- Developing/confirmed/unconfirmed labels only with defined editorial rules.
- Publisher identity, ownership, contact, editorial policy, sourcing policy, correction policy and AI policy.
- Sponsored content clearly separate.
- Avoid clickbait and sensationalism; headlines should match reporting.
- Explain confidence, data gaps and uncertainty. No fabricated trust scores or verification badges.

## Business & Market Intelligence (educational information, not personalized investment advice)
- Business Pulse: news-driven industry/company overview.
- Business/news mood overview: summarize tone and recurring themes in general business and industry reporting for educational context only; do not produce asset-specific sentiment signals, market predictions, buy/sell prompts or trading indicators.
- Sentiment inputs must be source-based, disclose sampling/time window/methodology, caveats, source coverage/bias, gaps and stale-data status.
- Sector Pulse and company/topic story clusters for reading and research, without investment action suggestions.
- Economic events explained as general news and policy context; do not provide trade-planning cues or actionable financial guidance.
- Avoid asset price widgets or trading-oriented features in this development scope.

## Implementation guardrails
- Benchmark first, map existing components/features, prioritize opportunities, then implement incremental features.
- Preserve existing functionality/categories and avoid unnecessary rewrites.
- Do not touch Supabase setup/config/schema/database/policies/migrations without explicit approval.
- No main-branch merge or production deploy without explicit permission.
- CI checks, tests and actual feature verification are required before claiming completion. This project currently has typecheck/build scripts; do not claim tests exist unless added.
- Create complete checkpoints with progress report and internal checksum manifest; preserve earlier checkpoints.
