---
name: aopiya-analytics
description: >-
  AOPIYA 独立站（www.aopiya.com）站内数据分析：通过 aopiya CLI 读取 GA4/GSC/Vercel/询盘，
  做流量、漏斗、SEO、内容转化分析；与 Admin 看板同口径。
  触发词：分析流量、询盘统计、转化分析、SEO 分析、GSC、内容表现、环比、月报、周报、
  看板、数据健康、单页审计、页面审计、SEO 审计、GEO 审计、page audit、traffic、funnel、
  content-performance、leads。
---

# AOPIYA 独立站数据分析（站内）

通过 **`aopiya` CLI** 读取 [www.aopiya.com](https://www.aopiya.com) 运营数据，与 Admin 仪表板（`/admin`）**同口径**。

> **唯一数据入口**：站内指标只用 `aopiya` 命令，不直连数据库。

## 分析模式（先选路径）

| 用户意图 | 怎么做 |
|----------|--------|
| 站内周报 / 月报 | `workflows/weekly-report.md` 或 `monthly-report.md` |
| 对齐看板某一 Tab | `workflows/{overview,acquisition,content,seo,geo,health}.md` |
| 自定义时间窗 / 语种切片 | `workflows/_building-blocks.md` + `references/snapshot-metrics.md` |
| 单页 SEO / GEO / 转化审计 | `workflows/page-audit.md` + `references/page-audit-checklist.md` |
| 赶时间 | 下方「命令速查」派生 endpoint |

**口径宪法**：`references/metrics.md`

## 目录结构

```
aopiya-analytics/
├── SKILL.md
├── workflows/         # 看板配方（CLI）
└── references/        # 口径、站点、站内报告方法论
```

## 参考文档

| 文档 | 何时读 |
|------|--------|
| `references/metrics.md` | **必读**：口径、漏斗、返回结构 |
| `workflows/README.md` | 看板配方索引 |
| `workflows/_building-blocks.md` | 灵活切片、snapshots 自算 |
| `references/snapshot-metrics.md` | 快照 payload 目录 |
| `references/site-pages.md` | 全站路由与 CMS 映射 |
| `references/page-audit-checklist.md` | 单页 SEO/GEO/转化检查项 |
| `references/methodology.md` | 站内报告叙事与 SEO 工作流 |

## 前置

`aopiya health` 返回 JSON 即可。输出为 JSON（`leads export` 为 CSV）。

## 数据来源

| 数据 | 常用命令 |
|------|----------|
| **Vercel** 全量 PV | `vercel-baseline`、`traffic-compare`、`traffic-wow` |
| **GA4** 可分析行为 | `traffic`、`channels`、`funnel`、`content-performance`… |
| **GSC** 搜索 | `gsc-queries`、`search-trend`、`search-brand-split`… |
| **询盘库** | `leads list` / `stats` / `export` |

双口径不可混减；漏斗终点以询盘库为准。详见 `metrics.md`。

## 日维度（`*_daily`）

除窗口 Top（`rows` / `items`）外，多数指标另有 **按日分桶** 快照（metric 后缀 `_daily`）：

- **REST/CLI**：同一命令返回里多一个 **`daily`** 字段（`[{date, items}]` 或 `[{date, events}]`），已按 `--days` 裁剪。
- **Vercel**：`vercel-baseline` 另有 **`dimensionsDaily`**（按日的 paths/referrers/countries/locales）。
- **目录**：完整 metric 列表见 `references/snapshot-metrics.md`。
- **趋势/下钻**：优先用 `daily`，不要用窗口 Top 冒充日序列。

```bash
aopiya analytics channels --days 28    # rows + daily
aopiya analytics funnel --days 28      # steps + daily
aopiya analytics vercel-baseline --days 28  # daily + dimensionsDaily
```

## 命令速查

| 场景 | 命令 |
|------|------|
| 探活 | `aopiya health` |
| 流量日序列 | `aopiya analytics traffic [--days 28]` |
| 环比 | `aopiya analytics traffic-compare` / `traffic-wow` |
| 指标状态 / 日分桶原始 payload | `aopiya analytics snapshots [--no-payload]` |
| 渠道 / 转化 | `aopiya analytics channels` / `channel-performance` |
| **全量埋点** | `aopiya analytics tracking-events`（含 page_view、scroll_depth、漏斗、触点） |
| 滚动深度 | `aopiya analytics scroll-depth`（25/50/75/90）/ `scroll-engagement`（75% KPI） |
| 漏斗 | `aopiya analytics funnel` |
| 页面 / 内容 | `aopiya analytics pages` / `content-performance` / `page-types` |
| SEO | `aopiya analytics search-trend` / `gsc-queries` / `search-brand-split`… |
| 获客 | `aopiya analytics geo-countries` / `geo-devices` / `ai-referrals` |
| 全量 / 覆盖 | `aopiya analytics vercel-baseline` / `coverage` / `meta` |
| 对账 / 同步 | `aopiya analytics reconcile` / `sync`（勿高频） |
| 询盘 | `aopiya leads list` / `stats` / `export` |
| 审计 | `aopiya audit run` / `audit sitemap` / `audit links` |

## Google 同步

```bash
aopiya analytics snapshots --metric traffic --source ga4 --limit 1 --no-payload
# createdAt 过期再：
aopiya analytics sync --days 28
```

## 典型工作流

| 场景 | 附件 |
|------|------|
| 站内周报 | `workflows/weekly-report.md` |
| 站内月报 | `workflows/monthly-report.md` |
| 看板单 Tab | `workflows/{overview,…,health}.md` |
| 单页审计 | `workflows/page-audit.md` |
| 自定义切片 | `workflows/_building-blocks.md` |

```bash
aopiya analytics meta --days 28
aopiya analytics traffic --days 28
aopiya analytics funnel --days 28
aopiya leads stats --from <ISO>
```

## 全站内容分析

1. `aopiya content list <type> --status published`
2. `content-performance`、`gsc-pages`、`leads stats`
3. 对照线上 URL（`site-pages.md`）

## 权限

`analytics:read`、`analytics:sync`、`leads:read`、`audit:read`、`audit:run`、`content:read`

## 禁止

- 高频 `analytics sync`
- 混用双口径（覆盖率除外）
