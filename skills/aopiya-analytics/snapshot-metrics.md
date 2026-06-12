# 快照指标目录（snapshots payload）

每 `source:metric` **仅一条**当前状态。`aopiya analytics snapshots` 默认含 `payload`；加 `--no-payload` 仅元数据。

## 日序列型（可 `--days` 切窗或自聚合自然月）

| source | metric | payload 关键字段 | merge |
|--------|--------|------------------|-------|
| ga4 | traffic | `rows: [{date, sessions, users}]` | overwrite_by_date |
| gsc | search_trend | `rows: [{date, clicks, impressions, ctr, position}]` | overwrite_by_date |
| gsc | search_keyword_trend | `rows: [{date, types: {brand, category, oem, ...}}]` | overwrite_by_date |
| vercel | pageviews | `daily: [{date, pageviews}]`；另有 `rows`（路径 Top）、`referrers`、`countries`、`locales`（窗口累计） | incremental_events |
| vercel | dimensions_daily | `rows: [{date, paths[], referrers[], countries[], locales[]}]` 按日分桶 Top | incremental_dimensions |

专用 CLI：`traffic`、`search-trend`、`search-keyword-trend`、`vercel-baseline`（含 `dimensionsDaily`）。

## 日 × 维度分桶型（sync 拉滚动窗，按 date 合并 items）

后缀 `_daily`；payload 为 `rows: [{date, items: [...]}]`，merge=`overwrite_by_date_bucket`。

| source | metric | items 字段 |
|--------|--------|------------|
| ga4 | channels_daily | `{channel, sessions}` |
| ga4 | pages_daily | `{pagePath, views, sessions, users}` |
| ga4 | page_types_daily | `{page_type, views, sessions}` |
| ga4 | channel_conversions_daily | `{channel, leads}` |
| ga4 | tracking_events_daily | `{event, count}`（**全量埋点**：page_view、scroll_depth、漏斗、触点等） |
| ga4 | scroll_depth_daily | `{percent, pagePath, count}`（25/50/75/90 全档位） |
| ga4 | touchpoints_daily | `{event, count}`（触点子集，与 tracking 重叠） |
| ga4 | content_card_clicks_daily | `{event, slug, count}` |
| ga4 | page_engagement_daily | `{pagePath, avgEngagementSec, pageViews}` |
| ga4 | scroll_engagement_daily | `{pagePath, scroll75Count, pageViews, scroll75Rate}` |
| ga4 | ai_referrals_daily | `{source, sessions, users}` |
| ga4 | geo_countries_daily | `{country, sessions, users}` |
| ga4 | devices_daily | `{device, sessions, users}` |
| ga4 | landing_pages_daily | `{landingPage, sessions, users, bounceRate?}` |
| ga4 | new_vs_returning_daily | `{type, sessions, users}` |
| ga4 | lead_events_daily | `{count}`（generate_lead 日计数） |
| gsc | queries_daily | `{query, clicks, impressions, ctr, position}` |
| gsc | pages_daily | `{page, clicks, impressions, ctr}` |

对应 REST/CLI 在窗口汇总之外返回 **`daily`** 字段（同结构 `rows[{date, items}]`），由服务端按 `periodDays` 裁剪。

## 日 × 事件计数型

| source | metric | payload | merge |
|--------|--------|---------|-------|
| ga4 | funnel_events_daily | `rows: [{date, events: {form_start, form_submit, ...}}]` | overwrite_by_date（events 对象） |

`funnel`、`reconcile` 等 endpoint 的 **`daily`** 即此序列。

## 日维度扁平行（GSC 派生）

| source | metric | payload | merge |
|--------|--------|---------|-------|
| gsc | search_brand_split_daily | `rows: [{date, brand, nonBrand}]` | overwrite_by_date |
| gsc | search_keyword_breakdown_daily | `rows: [{date, types: {...}}]` | overwrite_by_date |

## 窗口聚合型（随 sync 整窗覆盖）

| source | metric | payload 关键字段 | 专用 CLI |
|--------|--------|------------------|----------|
| ga4 | channels | `rows: [{channel, sessions}]` | `channels`（+`daily`） |
| ga4 | channel_conversions | `rows: [{channel, leads}]` | （含于 `channel-performance`，+`daily.sessions/conversions`） |
| ga4 | pages | `rows: [{pagePath, views, sessions, users}]` | `pages`（+`daily`） |
| ga4 | page_types | `rows: [{page_type, views, sessions}]` | `page-types`（+`daily`） |
| ga4 | funnel_events | `events: {form_start, form_submit, view_product, ...}` | `funnel`（+`daily`） |
| ga4 | tracking_events | `rows: [{event, count}]` | `tracking-events`（+`daily`） |
| ga4 | scroll_depth | `rows: [{percent, pagePath, count}]` | `scroll-depth`（+`daily`） |
| ga4 | touchpoints | `rows: [{event, count}]` | `touchpoints`（+`daily`，触点子集） |
| ga4 | content_card_clicks | `rows: [{event, slug, count}]` | snapshots 自读（+`daily`） |
| ga4 | scroll_engagement | `rows: [{pagePath, scroll75Count, pageViews, scroll75Rate, avgEngagementSec?}]` | `scroll-engagement`（+`daily`、`engagementDaily`） |
| ga4 | page_engagement | `rows: [{pagePath, avgEngagementSec, pageViews}]` | snapshots 自读 |
| ga4 | lead_events | `{ eventName: "generate_lead", count }` | snapshots 自读；`reconcile` +`daily` |
| ga4 | ai_referrals | `rows: [{source, sessions, users}]` | `ai-referrals`（+`daily`） |
| ga4 | geo_countries | `rows: [{country, sessions, users}]` | `geo-countries`（+`daily`） |
| ga4 | devices | `rows: [{device, sessions}]` | `geo-devices`（+`daily`） |
| ga4 | new_vs_returning | `rows: [{type, sessions, users}]` | `geo-new-vs-returning`（+`daily`） |
| ga4 | landing_pages | `rows: [{pagePath, sessions}]` | snapshots（+`daily`） |
| gsc | queries | `rows: [{query, clicks, impressions, ctr, position}]` | `gsc-queries`（+`daily`） |
| gsc | pages | `rows: [{page, clicks, impressions, ...}]` | `gsc-pages`（+`daily`） |
| gsc | search_brand_split | `brand`, `nonBrand`, `nonBrandTop` | `search-brand-split`（+`daily`） |
| gsc | search_keyword_breakdown | `types: {brand, category, oem, ...}` | `search-keyword-breakdown`（+`daily`） |

## 读取示例

```bash
# 元数据
aopiya analytics snapshots --metric traffic --source ga4 --limit 1 --no-payload

# 日 × 渠道（API 已裁剪 periodDays）
aopiya analytics channels --days 28
# → rows（窗口 Top）+ daily[{date, items[{channel, sessions}]}]

# Vercel 按日维度 Top
aopiya analytics vercel-baseline --days 28
# → daily（全站 PV）+ dimensionsDaily[{date, paths, referrers, countries, locales}]

# 完整 payload 自算
aopiya analytics snapshots --source ga4 --metric channels_daily --limit 1
```

## rowCount 含义（健康 Tab 同源）

- 纯日序列：GA4/GSC 为 `rows` 天数；Vercel pageviews 为 `daily` 天数。
- 日 × 分桶（`*_daily`）：`rowCount` = 有数据的**天数**（非 items 总数）。
- 窗口型：有 `rows` 时可能为 Top 行数，**不等于**日点数。
