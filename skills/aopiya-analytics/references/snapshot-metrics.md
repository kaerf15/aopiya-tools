# 快照指标目录（snapshots payload）

每 `source:metric` **仅一条**当前状态。`aopiya analytics snapshots` 默认含 `payload`；加 `--no-payload` 仅元数据。

## 日序列型（可 `--days` 切窗或自聚合自然月）

| source | metric | payload 关键字段 | merge |
|--------|--------|------------------|-------|
| ga4 | traffic | `rows: [{date, sessions, users}]` | overwrite_by_date |
| gsc | search_trend | `rows: [{date, clicks, impressions, ctr, position}]` | overwrite_by_date |
| gsc | search_keyword_trend | `rows: [{date, types: {brand, category, oem, ...}}]` | overwrite_by_date |
| vercel | pageviews | `daily: [{date, pageviews}]`；另有 `rows`（路径 Top）、`referrers`、`countries`、`locales` | incremental_events |

专用 CLI：`traffic`、`search-trend`、`search-keyword-trend`、`vercel-baseline`。

## 窗口聚合型（随 sync 整窗覆盖）

| source | metric | payload 关键字段 | 专用 CLI |
|--------|--------|------------------|----------|
| ga4 | channels | `rows: [{channel, sessions}]` | `channels` |
| ga4 | channel_conversions | `rows: [{channel, leads}]` | （含于 `channel-performance`） |
| ga4 | pages | `rows: [{pagePath, views, sessions, users}]` | `pages` |
| ga4 | page_types | `rows: [{page_type, views, sessions}]` | `page-types` |
| ga4 | funnel_events | `events: {form_start, form_submit, view_product, ...}` | （含于 `funnel`） |
| ga4 | touchpoints | `rows: [{event, count}]` | `touchpoints` |
| ga4 | content_card_clicks | `rows: [{event, slug, count}]` | snapshots 自读 |
| ga4 | scroll_engagement | `rows: [{pagePath, scroll75Count, pageViews, scroll75Rate, avgEngagementSec?}]` | `scroll-engagement` |
| ga4 | page_engagement | `rows: [{pagePath, avgEngagementSec, pageViews}]` | snapshots 自读 |
| ga4 | lead_events | `{ eventName: "generate_lead", count }` | snapshots 自读 |
| ga4 | ai_referrals | `rows: [{source, sessions, users}]` | `ai-referrals` |
| ga4 | geo_countries | `rows: [{country, sessions, users}]` | `geo-countries` |
| ga4 | devices | `rows: [{device, sessions}]` | `geo-devices` |
| ga4 | new_vs_returning | `rows: [{type, sessions, users}]` | `geo-new-vs-returning` |
| ga4 | landing_pages | `rows: [{pagePath, sessions}]` | snapshots |
| gsc | queries | `rows: [{query, clicks, impressions, ctr, position}]` | `gsc-queries` |
| gsc | pages | `rows: [{page, clicks, impressions, ...}]` | `gsc-pages` |
| gsc | search_brand_split | `brand`, `nonBrand`, `nonBrandTop` | `search-brand-split` |
| gsc | search_keyword_breakdown | `types: {brand, category, oem, ...}` | `search-keyword-breakdown` |

## 读取示例

```bash
# 元数据
aopiya analytics snapshots --metric traffic --source ga4 --limit 1 --no-payload

# 完整 payload 自算
aopiya analytics snapshots --source vercel --metric pageviews --limit 1
# → items[0].payload.daily 按 date 聚合
```

## rowCount 含义（健康 Tab 同源）

- 日序列：GA4/GSC 为 `rows` 天数；Vercel 为 `daily` 天数。
- 窗口型：有 `rows` 时可能为 Top 行数，**不等于**日点数。
