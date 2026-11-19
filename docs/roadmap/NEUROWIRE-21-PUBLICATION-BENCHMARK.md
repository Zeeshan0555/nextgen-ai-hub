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
- Market sentiment panel: aggregate source-based sentiment, show sampling/time window and methodology, caveats, stale-data status and source links; avoid presenting sentiment as a price forecast or buy/sell recommendation.
- Sentiment inputs can include article tone and publicly available aggregate indicators, subject to lawful access and reliability; disclose source coverage/bias and missing data.
- Sector Pulse and company/topic story clusters.
- Economic calendar with event time, source, prior/forecast/actual only when reliable and licensed/accessible.
- Market-data widgets (assets, indices, currencies, commodities) only when sourced, time-stamped and permitted; explicit unavailable/stale state.
- Sentiment history and comparisons only where data coverage supports it; distinguish observation from inference.

## Implementation guardrails
- Benchmark first, map existing components/features, prioritize opportunities, then implement incremental features.
- Preserve existing functionality/categories and avoid unnecessary rewrites.
- Do not touch Supabase setup/config/schema/database/policies/migrations without explicit approval.
- No main-branch merge or production deploy without explicit permission.
- CI checks, tests and actual feature verification are required before claiming completion. This project currently has typecheck/build scripts; do not claim tests exist unless added.
- Create complete checkpoints with progress report and internal checksum manifest; preserve earlier checkpoints.
