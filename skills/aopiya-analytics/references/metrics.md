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

- `aopiya analytics traffic` 读**最新一条**快照；`aopiya analytics snapshots` 是历次 sync 追加的历史记录，供趋势分析。
- 每次 sync 是**滚动 28 天窗口**，不是自然月；自然月分析用 `aopiya leads list --from --to` 或按日 payload 自行聚合。
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

## 返回结构速览（关键字段）

| 命令 | 返回 JSON 结构 |
|------|----------------|
| `aopiya analytics traffic` | `{ periodDays, snapshotId, period: {start, end}, statsStartDate, data: [{date, sessions, users}] }` |
| `aopiya analytics snapshots` | `{ count, items: [{id, source, metric, periodStart, periodEnd, createdAt, dataMode, payload: {rows: [...]}}] }` |
| `aopiya analytics channels` | `{ periodDays, snapshotId, rows: [...] }` |
| `aopiya analytics funnel` | `{ periodDays, dataMode, steps: [{step, count, rateFromPrev}], note? }` |
| `aopiya analytics pages` | `{ items: [{pagePath, views, sessions, users}] }` |
| `aopiya analytics content-performance` | `{ items: [{content_id, content_slug, page_path, page_type, sessions, views, users, leads, lead_cvr, gsc_clicks, gsc_impressions}] }` |
| `aopiya analytics gsc-queries` | `{ snapshotId, items: [{query, clicks, impressions, ctr, position}] }` |
| `aopiya analytics gsc-pages` | `{ snapshotId, items: [{page, clicks, impressions, ...}] }` |
| `aopiya leads list` | `{ count, items: [{id, name, country, company, phone, email, message, sourcePage, locale, utmSource, utmMedium, utmCampaign, createdAt}] }` |
| `aopiya leads stats` | `{ total, bySourcePage: {路径: 数量}, byLocale: {语种: 数量}, from?, to? }` |

时间均为 ISO 8601 UTC 字符串；`sourcePage` / `page_path` 为站内路径（带语种前缀，归并规则见上节）。
其余命令结构自描述，跑一次看输出即可；语义不明的字段对照本表理解。
