---
name: aopiya-analytics
description: >-
  AOPIYA 独立站（www.aopiya.com）数据分析：通过 aopiya CLI 读取 GA4/GSC/Vercel/询盘数据，
  做流量、漏斗、SEO/GEO、内容转化分析并输出优化建议；含品牌舆情与竞品分析工作流。
  触发词：分析流量、询盘统计、转化分析、SEO 分析、GEO 分析、AI 可见性、内容表现、
  环比、月报、周报、舆情、竞品分析、traffic、funnel、content-performance。
---

# AOPIYA 独立站数据分析

通过 **`aopiya` CLI** 读取 [www.aopiya.com](https://www.aopiya.com) 独立站的运营数据，做流量、询盘、SEO/GEO、内容转化等分析。

> **唯一数据入口**：只用 `aopiya` 命令。
> CLI 返回的指标与独立站 Admin 仪表板（`/admin`）同口径，可互相印证。

内容增删改发布见可选配套 Skill：`aopiya-content`。

## 参考文档（本 Skill 目录，按需读）

| 文档 | 何时读 |
|------|--------|
| `references/metrics.md` | **动手分析前必读**：指标口径、漏斗步骤、多语言路径、各命令返回结构 |
| `references/site-pages.md` | **全站内容/页面分析前必读**：全部前台路由、CMS 类型映射、枚举 URL、解析线上页面 |
| `references/methodology.md` | 写报告、做 SEO/GEO、页面审计、舆情竞品时读：报告结构、工作流、业务背景 |

## 前置

假定 `aopiya` CLI 已配置并就绪；`aopiya health` 返回 JSON 即可动手。

输出均为 JSON（`leads export` 为 CSV）；错误也输出 JSON 到 stderr，退出码 1。
拿到原始数据后自行聚合、切片——**度量定义以 `references/metrics.md` 为准**。

## 数据来源

CLI 汇总四类后台已同步的数据（与 Admin 仪表板同口径）：

| 数据 | 管什么 | 常用命令 |
|------|--------|----------|
| **Vercel** | **全量**页面访问（不依赖 Cookie） | `analytics traffic`、`traffic-compare`、`traffic-wow` |
| **GA4** | **可分析**访问与行为（渠道、漏斗、深度浏览、AI 引荐等） | `analytics channels`、`funnel`、`content-performance` 等；经 `analytics sync` 写入快照后读取 |
| **GSC** | Google 搜索点击/展示/排名（滞后 2–3 天） | `analytics gsc-queries`、`gsc-pages` |
| **询盘库** | 联系表单入库记录；**有效询盘是周会主指标** | `leads list` / `stats` / `export` |

站点有**全量（Vercel）与可分析（GA4）双口径**，不可混用相减；跨口径转化率等仅作趋势参考。漏斗终点以询盘库为准。口径细则、漏斗步骤、返回字段见 `references/metrics.md`。

## 命令速查

| 场景 | 命令 |
|------|------|
| 探活 | `aopiya health` |
| 近 28 天流量日序列 | `aopiya analytics traffic [--days 28]` |
| 与上次 sync 环比 | `aopiya analytics traffic-compare [--offset 1]` |
| 历史 sync 快照（趋势/月分析） | `aopiya analytics snapshots [--metric traffic] [--source ga4] [--limit 30] [--no-payload]` |
| 渠道 / 渠道×转化 | `aopiya analytics channels` / `aopiya analytics channel-performance` |
| 询盘漏斗 | `aopiya analytics funnel` |
| 页面 Top | `aopiya analytics pages [--page-type article] [--limit 20]` |
| 页面类型分布 | `aopiya analytics page-types` |
| 内容×转化 | `aopiya analytics content-performance [--limit 30]` |
| 内容带动询盘占比 | `aopiya analytics content-lead-share` |
| 深度浏览占比 | `aopiya analytics high-intent` |
| 触点（CTA/WhatsApp/卡片点击） | `aopiya analytics touchpoints` |
| 滚动深度 | `aopiya analytics scroll-engagement` |
| AI 引荐 | `aopiya analytics ai-referrals` |
| GSC 搜索词 / 落地页 | `aopiya analytics gsc-queries` / `aopiya analytics gsc-pages` |
| 访问周环比 | `aopiya analytics traffic-wow` |
| GA4 vs 询盘对账 | `aopiya analytics reconcile` |
| 拉取 Google 数据 | `aopiya analytics sync [--days 28]`（勿高频，见下节） |
| 询盘明细 / 单条 / 聚合 / CSV | `aopiya leads list [--from ISO] [--to ISO]` / `aopiya leads get <id>` / `aopiya leads stats` / `aopiya leads export` |
| SEO 全量诊断 | `aopiya audit run [-o report.json]` / `aopiya audit runs` / `aopiya audit get <id>` |
| sitemap / 死链专项 | `aopiya audit sitemap` / `aopiya audit links` |

## Google 数据同步

`aopiya analytics sync` 从 GA4 + GSC 拉取数据写入快照（等同 Admin「Google 数据同步」；需具备 `analytics:sync` 权限）。

**先查新鲜度，过期再 sync**：

```bash
# 1. 看最新快照时间（createdAt）
aopiya analytics snapshots --metric traffic --source ga4 --limit 1 --no-payload
# 2. 距上次 sync 超过 24 小时再触发（生产环境通常每日自动 sync 一次）
aopiya analytics sync --days 28
```

- 返回 `mode: mock`：当前环境未配 Google 服务账号，数据不可用于真实分析。
- GSC 滞后 2–3 天，同步后最近几天搜索数据为空属正常，勿重复 sync。
- 每次 sync 追加新快照；频繁触发耗 Google 配额且污染历史序列。

## 典型工作流

```bash
# 周报：趋势 + 环比 + 漏斗 + 内容归因
aopiya analytics traffic --days 28
aopiya analytics traffic-compare --offset 1
aopiya analytics funnel
aopiya analytics content-performance --limit 30

# 月度/历史：读多次快照自行聚合（每条含 periodStart/End 与按日 payload）
aopiya analytics snapshots --metric traffic --source ga4 --limit 12

# 自然月询盘
aopiya leads stats --from 2026-05-01T00:00:00.000Z --to 2026-06-01T00:00:00.000Z

# 同步后复盘
aopiya analytics sync --days 28
aopiya analytics reconcile
```

报告结构、SEO/GEO、舆情竞品方法论见 `references/methodology.md`。

## 全站内容与页面分析

除 aggregate 指标外，分析任务常需覆盖**独立站全部已发布内容**（静态页、商品、文章、品牌、FAQ、视频等）。

1. **列全量内容**：`aopiya content list <type> --status published`（按 locale 分别拉）
2. **叠表现数据**：`content-performance`、`gsc-pages`、`leads stats` 排出优先审计页
3. **对照线上实态**：抓取 `https://www.aopiya.com<路径>` 页面，核对 title、H1、CTA、Schema 等与 CMS 是否一致
4. **输出可执行结论**：每条落到 URL + CMS id + 数据证据 + CMS/前端问题 + 改法

前台有哪些页面、如何枚举 URL、如何解析前端，见 `references/site-pages.md`。

## 权限

分析凭证需具备：`analytics:read`、`analytics:sync`、`leads:read`、`audit:read`、`audit:run`、`content:read`（查内容详情辅助归因）。**不含** `content:write` / `content:publish`。

## 禁止

- 高频 `analytics sync`（Google 同步有配额）
- 混用双口径做减法或占比（覆盖率指标除外，见 `metrics.md`）

## 可选配套

- `aopiya-content`：把分析结论落地为 CMS 改动（改 SEO 字段、发布/更新商品/文章/译稿等）
- `seo-geo-page-audit`：单页深度 SEO/GEO 审计（配合 `site-pages.md` 逐页检查）
