# 站内分析方法论

## 与 workflow 的分工

- **计算配方**：`../workflows/`（与 Admin 看板对齐）
- **本文件**：站内报告**怎么写**、SEO/内容工作流

## 站内报告结构（六段）

1. **总览**：询盘、双口径访问、转化、健康度
2. **流量获取**：渠道、环比、异常归因
3. **SEO**：GSC、品牌 vs 非品牌、audit
4. **AI 可见性**：`ai-referrals`（站内可分析引荐）
5. **内容转化**：内容×询盘、漏斗、触点
6. **数据健康**（异常时）：覆盖率、对账、sync

每结论：**数据 + 解读 + 建议**；建议落到 URL + CMS id。

## SEO 数据工作流

- `gsc-queries` 品牌/非品牌；高展示低 CTR → 改 title/meta
- 排名 4–10 → 加强内链与内容
- `gsc-pages` 找强弱落地页
- `audit run` / `sitemap` / `links`

## GEO（站内 AI 引荐）

- `aopiya analytics ai-referrals`

## 多语言

- `leads stats` `byLocale`；路径语种见 `metrics.md`
- 高流量低询盘语种 → 译稿与 CTA

## 全站内容分析

1. `content list` 全量 published
2. `content-performance`、`gsc-pages`、`leads stats`
3. `audit` + 线上 URL 对照（`site-pages.md`）

## 页面级审计

**主流程**：`../workflows/page-audit.md`（数据定优先级 → CMS + 线上对照 → 报告）

**检查项**：`page-audit-checklist.md`（按 `page_type`、P0–P3、埋点对照）

**批量**：`site-pages.md`「全站内容分析工作流」→ Top N 问题页走 `page-audit.md`
