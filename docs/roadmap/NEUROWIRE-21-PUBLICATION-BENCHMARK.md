# NeuroWire 21-Publication Benchmark & Product Requirements
Status: active guide for improving the existing NeuroWire project, not replacing its roadmap.
Scope: keep existing features and work intact; make useful, gradual improvements. No production deployment. Supabase settings, database, tables, policies, migrations and production data are out of scope unless separately approved.

## Benchmark set (21)
1. Reuters — clear reporting, topics and live coverage.
2. Bloomberg — news with business information.
3. Financial Times — analysis and business context.
4. Wall Street Journal — business reporting.
5. New York Times — storytelling and explainers.
6. BBC News — topic sections, live news and accessibility.
7. Associated Press — direct news reporting.
8. The Guardian — investigations and longer stories.
9. The Economist — short analysis and global context.
10. CNBC — business news and live coverage.
11. Axios — short, easy-to-scan news.
12. Semafor — clear separation of facts and viewpoints.
13. The Information — technology-business reporting.
14. TechCrunch — startups, technology companies and products.
15. The Verge — technology news and reader experience.
16. WIRED — technology, security and culture reporting.
17. Ars Technica — detailed technology reporting.
18. MIT Technology Review — new technology and research explained.
19. CoinDesk — crypto news and reporting.
20. Cointelegraph — crypto news and explainers.
21. Investing.com — business news, data and economic events.

## Research rule
For each publication, inspect public pages and features where possible. Record links, date checked, what was actually observed, strengths, problems and ideas that could help NeuroWire. Do not claim a feature or problem was checked if it was not. Separate shared industry issues from findings about a specific publication.

## Existing product direction (do not replace)
Improve the existing NeuroWire experience in small, verified steps. Keep its current publishing setup, categories, reader features, admin paths and other working parts.
- Keep the six current categories: AI, Crypto, Policy, Technology, Fox News and Leadership.
- Keep current publishing lanes, author and admin paths.
- Improve the homepage while keeping it clear and easy to read: lead stories, latest news, trending stories and analysis, with layouts that work on phones and desktops.
- Improve story pages: clear headline, readable body, source link, date and author when available; helpful background, related stories and what is known or still unclear.
- Improve topic pages and story groups based on real coverage.
- Improve search, filters, related stories and duplicate handling.
- Add useful charts only when data, dates, source and limits are clear.
- Keep the admin workflow useful and safe.

## Easy reading and accessibility
- Use simple, natural English in headlines, summaries, buttons, labels and explanations.
- Make reading comfortable: clear text, spacing, contrast, sensible headings and readable source details.
- Support screen readers, keyboard use and visible focus.
- Use useful image descriptions; leave decorative images out of screen-reader noise.
- Avoid pop-ups, autoplay and motion that gets in the way.
- Make layouts and controls work on small screens and desktop.

## Search, discovery and website visibility
- Make search helpful, including common spelling mistakes when practical.
- Allow useful filters such as category, date and source, with a clear reset and easy mobile use.
- Keep category navigation easy to reach without hiding page content.
- Keep page titles, descriptions, links, structured data and sitemap accurate.
- Make social previews accurate and check their fallbacks.

## Useful reader features
- Keep helpful features available without a paywall where practical: search, filters, topic pages, background, sharing and readable articles.
- Consider optional daily or weekly email updates only if they can be run reliably, with clear opt-in, unsubscribe and privacy.
- Check costs and limits before promising a free feature that depends on outside services.

## Trust and accuracy
- Show the source link, publication date and author when available.
- Explain AI use honestly; do not claim human review unless it happened.
- Keep corrections visible with their date and reason.
- Link evidence for important claims where practical.
- Link independent coverage without treating multiple copies of one report as separate confirmation.
- Use developing or confirmed labels only under clear rules.
- Keep publisher details, contact and editorial, source, correction and AI-use policies easy to find.
- Clearly mark sponsored content.
- Avoid clickbait. Headlines should match the story.
- Explain gaps and uncertainty; do not invent trust scores or verification labels.

## Business news and context (for learning, not financial advice)
- Explain business, company and industry news in plain language.
- Summaries of news tone must be based on named sources, a clear time range and a stated method, with limits explained.
- Do not create asset-specific trading signals, predictions, buy/sell suggestions or trading guides.
- Explain economic events as news, not trading instructions.
- Do not add price or trading widgets within this development scope.

## Work and verification rules
- Use research to improve the existing project; do not turn it into a new plan or redesign everything.
- Check the current code and preserve working parts before changing them.
- Do not change Supabase setup, settings, database, policies, migrations or production data without approval.
- Do not merge into main or deploy to production without approval.
- Run the checks that are available and verify changes before calling them complete. Do not claim tests exist or pass without evidence.
- At approved checkpoints, include the full project, progress report and internal checksum file; keep earlier checkpoints.