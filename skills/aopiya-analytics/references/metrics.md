# 指标口径与返回结构（分析前必读）

本表是 CLI 与 Admin 仪表板（`/admin`）共用的口径基准。

## 双口径体系

| 口径 | 来源 | 说明 |
|------|------|------|
| **全量** | Vercel Web Analytics Drain | 每次打开页面都计，不依赖 Cookie；自 2026-06-10 接通起算，`/admin` 不计入 |
| **可分析** | GA4 | 仅同意分析 Cookie 的访客；渠道、漏斗、行为分析用此口径 |
| **估算** | 跨口径相除 | 如询盘转化率 = 有效询盘(全量) ÷ 可分析访问，偏保守，看趋势不看绝对值 |
| **GSC** | Google Search Console | 仅 Google 搜索结果中的表现，滞后 2–3 天 |

## 核心指标

| 指标 | 口径 | 定义 |
|------|------|------|
| 有效询盘 | 全量 | 每条表单均入库，不受 Cookie 影响；**周会主指标、对账以此为准** |
| 网站访问（全量/可分析） | 见上 | 两口径并列呈现，不可混用相减 |
| 询盘转化（估算） | 估算 | 分子全量分母可分析；只看趋势 |
| 深度浏览占比 | 可分析 | 看过产品/商业/品牌/文章页的访客占比 |
| 内容带动询盘 | 全量 | 来源页落在内容路径的询盘 ÷ 全部询盘 |
| 可分析覆盖占比 | 估算 | 可分析访问 ÷ 全量访问，仅在两口径日期重叠窗口内计算 |
| 搜索点击/展示/CTR/平均排名 | GSC | 仅 Google 搜索结果 |
| AI 引荐访问 | 可分析 | 从 ChatGPT / Perplexity 等 AI 产品点入 |

漏斗步骤：可分析访问 → 深度浏览 → 表单开始 → 表单提交 → **有效询盘（以询盘库为准，GA4 `generate_lead` 仅对账）** → 感谢页确认。

## 数据注意

- **时间**：库内与 API 的 `createdAt`、`syncedAt`、`updatedAt` 等均为 **北京时间 ISO 8601**（后缀 `+08:00`）；日维度 `date` / `periodStart` 为北京日历日。CLI 直接输出 API JSON，展示可用 `@aopiya/sdk` 的 `formatBeijingDateTime`。
- **测试数据**：删测试询盘后若漏斗仍残留感谢页（`confirm_lead` > 询盘库当日条数），在站点仓库执行 `pnpm clean-orphan-funnel -- --apply`（按日对账扣减，勿手改 payload）。

- 每个 `source + metric` **仅一条当前状态**（覆盖写入，无历史审计快照）；`aopiya analytics snapshots` 列出这些状态行。
- **日序列（traffic、search_trend 等）**：每次 sync 拉滚动窗，按 `date` 覆盖合并，长期积累。
- **日 × 维度（`*_daily`）**：channels/pages/queries 等除窗口 Top 外，另有按日分桶快照（`overwrite_by_date_bucket`）；API 在 `daily` 字段返回。
- **窗口聚合（channels、pages、queries Top 等）**：每次 sync 整窗重拉，覆盖写入该指标状态；与日序列并存，用途不同。
- **Vercel Drain**：`pageviews` 按日累加全站 PV；`dimensions_daily` 按日累加路径/引荐/国家/语种分桶。
- **全量埋点**：`tracking_events` / `tracking_events_daily` 覆盖全部 `trackEvent`（`page_view`、`scroll_depth`、漏斗、触点、卡片等）；`scroll_depth_daily` 为 25/50/75/90 全档位 × 路径。
- 展示默认看最近 28 天；自然月分析用 `aopiya leads list --from --to` 或按日 payload 自行聚合。
- SEO 品牌词：AOPIYA（奥比亚）、Susen、Chrisbella、Bagco；`handbag manufacturer`、`oem bags` 等品类词归**非品牌**，用于看新客发现能力。
- 未配 Google 凭证的环境 `aopiya analytics sync` 返回 `mode: mock`，数据不可用于真实分析。

## 站点结构（多语言路径）

9 语种：`en` 默认**无前缀**，其余带前缀 `/fr /ar /es /pt /id /it /th /vi`（如 `/fr/products/x`）。分析按路径切语种时按此规则归并。

**完整页面目录**（全部路由、CMS 映射、枚举与前端解析方法）见 `site-pages.md`。此处仅列 `page_type` 速查：

| 路径 | page_type |
|------|-----------|
| `/` | home |
| `/solutions` | solution |
| `/about` | about |
| `/contact` | contact |
| `/products`、`/products/[slug]` | product |
| `/brands`、`/brands/[slug]` | brand |
| `/news`、`/news/[slug]` | article |
| `/faq`、`/thanks`、法务页 | other |

## 分析周期

看板与 CLI 仅 **7 / 28 / 90** 三档（周报 / 月报 / 季度）。`periodDays` / `--days` 其它值归并到 28。`meta` 响应含 `periodPreset`（label、shortLabel、scene、compareNote）。

## 读数三层（与看板徽章 / `meta.periodLinkage` 对齐）

| 层级 | `periodDays` 裁剪？ | API / CLI 典型字段 |
|------|---------------------|-------------------|
| **随所选周期** | ✅ | `traffic.data`、`*.daily`、`search-trend.totals/rows`、`vercel-baseline.daily`/`pageviewsTotal`、`funnel.daily`、`leads stats --from`、`leads stats-daily` |
| **同步窗 Top** | ❌（仅 daily 变） | `channels.rows`、`pages.items`、`search/queries.items`、`funnel.steps`（中间步）、`channel-performance.items.sessions` |
| **累计** | ❌ | `vercel-baseline.items/referrers/countries`、`uniqueDevices`、`leads stats`（无 from/to） |

读排名前执行 `aopiya analytics meta --days N`，对照 `syncWindows.ga4` / `syncWindows.gscQueries` 的 `periodStart~periodEnd` 与 `spanDays`；`periodLinkage.relation` 为 `narrower`（90 天常见）或 `wider`（7 天常见）时勿把窗口 Top 与周期日合计直接对比。

## 叙事分层（L0→L5）

看板与 Agent 报告采用 **「窗口 Top + 日趋势」** 双层叙事；层级定义、各 Tab 对应字段见 `narrative-layers.md`。写报告顺序：先 L0 询盘 → L1/L2 访问 → 按问题选 L3/L4 → 末 L5 可信度。

## 看板工作流附件

与 Admin 六 Tab 对齐的分析配方见 `../workflows/README.md`。派生命令与本表同口径；灵活切片见 `../workflows/_building-blocks.md`。

## 返回结构速览（关键字段）

| 命令 | 返回 JSON 结构 |
|------|----------------|
| `aopiya analytics traffic` | `{ periodDays, snapshotId, period: {start,end} 展示窗, storedPeriod: {start,end} 库内日序列, statsStartDate, data: [{date, sessions, users}] }` |
| `aopiya analytics search-trend` | `{ periodDays, snapshotId, period, storedPeriod, totals: {clicks, impressions, ctr, position}, rows: [{date, clicks, impressions, ctr, position}] }` |
| `aopiya analytics snapshots` | `{ count, items: [{id, source, metric, periodStart, periodEnd, createdAt, dataMode, merge?, granularity?, rowCount?, payload}] }`（每指标一条当前状态，非历史列表） |
| `aopiya analytics channels` | `{ periodDays, snapshotId, rows[], daily[{date, items[{channel, sessions}]}] }` |
| `aopiya analytics funnel` | `{ periodDays, dataMode, steps[], daily[{date, events}], note? }` |
| `aopiya analytics pages` | `{ periodDays, snapshotId, period, pageType?, dataMode, items[], daily[{date, items}] }` |
| `aopiya analytics channel-performance` | `{ periodDays, dataMode, sessionsTotal, items[], daily: { sessions[], conversions[] } }` |
| `aopiya analytics tracking-events` | `{ periodDays, snapshotId, items[{event, count}], daily[{date, items}] }` |
| `aopiya analytics scroll-depth` | `{ periodDays, items[{percent, pagePath, count}], daily[{date, items}] }` |
| `aopiya analytics scroll-engagement` | `{ items[], daily（75% KPI）, scrollDepthDaily（全档位）, engagementDaily }` |
| `aopiya analytics content-performance` | `{ items: [{content_id, content_slug, page_path, page_type, sessions, views, users, leads, lead_cvr, gsc_clicks, gsc_impressions}] }` |
| `aopiya analytics gsc-queries` | `{ snapshotId, items[], daily[{date, items[{query, clicks, ...}]}] }` |
| `aopiya analytics gsc-pages` | `{ snapshotId, items[], daily[{date, items[{page, clicks, ...}]}] }` |
| `aopiya analytics search-trend` | 同 `getSearchTrend`：`totals` + `rows[{date, clicks, impressions, ctr, position}]` |
| `aopiya analytics search-brand-split` | `{ brand, nonBrand, brandClickShare, nonBrandTop[], daily[{date, brand, nonBrand}] }` |
| `aopiya analytics reconcile` | `{ periodDays, ga4GenerateLead, dbLeads, delta, ok, dataMode, daily[{date, items:[{count}]}], note }` — `daily` 为日分桶，按日 sum `items[].count` |
| `aopiya analytics vercel-baseline` | `{ pageviewsTotal, uniqueDevices, daily[], dimensionsDaily[{date, paths, referrers, countries, locales}], items[], referrers[], countries[], locales[] }` |
| `aopiya analytics coverage` | `{ vercelPageviews, ga4Sessions, overlapDays, ga4SessionsOverlap, vercelPageviewsOverlap, coverageRatio, vercelLastIngest }` |
| `aopiya analytics meta` | `{ periodDays, periodPreset, displayPeriod, syncWindows{ga4,gscQueries}, periodLinkage, statsStartDate, dataMode, isLive, storage, ga4?, gscQueries?, gscSearchTrend?, configured, hint, syncedAt }` |
| `aopiya leads stats-daily` | `{ periodDays, period, total, daily[{date, count}] }` |
| `aopiya leads list` | `{ count, items: [{id, name, country, company, phone, email, message, sourcePage, locale, utmSource, utmMedium, utmCampaign, createdAt}] }` |
| `aopiya leads stats` | `{ total, bySourcePage: {路径: 数量}, byLocale: {语种: 数量}, from?, to? }` |
| `aopiya leads stats-daily` | `{ periodDays, period, total, daily[{date, count}] }` — L0 询盘日趋势（询盘库全量） |

时间均为 ISO 8601 **北京时间**（`+08:00`）；`sourcePage` / `page_path` 为站内路径（带语种前缀，归并规则见上节）。
其余命令结构自描述，跑一次看输出即可；语义不明的字段对照本表理解。
