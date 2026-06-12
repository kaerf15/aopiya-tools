# Workflow：内容 Tab

**业务问题**：哪些页面/内容带来浏览、深度阅读和询盘？CTA/卡片/滚动表现如何？

对应看板：Admin → 分析 → **内容**。叙事层：**L2 可分析 + L4 埋点 + L0 成果**（见 `../references/narrative-layers.md`）。

## 数据积木

```bash
DAYS=28  # 仅 7 / 28 / 90
PAGE_TYPE=all   # 或 article | product | commercial | brand | ...

aopiya analytics meta --days $DAYS
aopiya analytics pages --days $DAYS --limit 50
aopiya analytics content-performance --days $DAYS --limit 30
aopiya analytics page-types --days $DAYS
aopiya analytics funnel --days $DAYS
aopiya analytics tracking-events --days $DAYS --limit 50
aopiya analytics touchpoints --days $DAYS --limit 20
aopiya analytics scroll-engagement --days $DAYS --limit 15
aopiya analytics scroll-depth --days $DAYS --limit 100
aopiya analytics vercel-baseline --days $DAYS
```

`content-performance` = 看板快捷套餐（GA4 页面 × GSC 点击 × 询盘 bySourcePage join）。

## 计算步骤

### 窗口汇总

1. **页面 Top（可分析）**：`pages.items` 按 views/sessions 排序。
2. **内容×转化表**：`content-performance.items` — `page_path, page_type, sessions, views, leads, lead_cvr, gsc_clicks`。
3. **页面类型分布**：`page-types.rows`。
4. **漏斗步骤（窗口）**：`funnel.steps`。
5. **触点窗口 Top**：`touchpoints.items`。
6. **滚动深度 KPI**：`scroll-engagement` — 75% 到达率 = 滚到 75% 事件 ÷ 页面浏览。
7. **卡片点击窗口**：`tracking-events` 筛 `select_item` / `article_card_click` / `video_card_click`，或 `content_card_clicks` 快照。
8. **全量页面 Top**：`vercel-baseline.items` Top10。

### 按日叙事（L4 埋点）

9. **卡片点击日合计**：`tracking-events.daily` 中按日 sum `select_item` + `article_card_click` + `video_card_click`。
10. **表单日趋势（L0）**：`funnel.daily` 中 `form_start`、`form_submit` 按日折线。
11. **CTA 日趋势**：`tracking-events.daily` 中 `cta_click` 按日。
12. **滚动深度日趋势（可选）**：`scroll-depth.daily` 按档位/路径下钻；或 `scroll-engagement.daily` 看 75% KPI。

## 输出模板

```markdown
## 内容（近 {N} 天）

### 读数口径
- 同步窗：GA4 {meta.syncWindows.ga4}；`periodLinkage.relation` = {narrower|wider|aligned}
- 【随所选周期】= 埋点日趋势、内容表「询盘」列；【同步窗 Top】= 页面/漏斗/触点/滚动排名；【累计】= `vercel-baseline.items` 路径 Top

### 按日叙事（埋点互动）【随所选周期】
- 卡片点击：{升/降}；表单开始→提交：{比率趋势}；CTA：{n}/日 均值

### 高表现内容【同步窗 Top + 周期询盘】
| 类型 | 路径 | 浏览 | 询盘【周期】 | GSC点击 | 转化率 |
|------|------|------|--------------|---------|--------|
...

### 页面类型分布【同步窗 Top】
...

### 触点 Top【同步窗 Top】
| 事件 | 次数 |
|------|------|
...

### 全量 PV Top 路径【累计】
...

### 建议（落到 URL + slug）
1. {高浏览低询盘页 → CTA/表单}
2. {高 GSC 低转化 → 落地页优化}
```

## 灵活偏离

| 需求 | 做法 |
|------|------|
| 只审计博客 | `--page-type article` + `content list article` |
| 自算 lead_cvr | `leads list` 按 `sourcePage` 分组 ÷ `pages` sessions |
| 无卡片点击 | 检查 Cookie 同意与 GA4 sync；用 `tracking-events` 确认 `daily` 是否为空 |

全站内容枚举见 `../references/site-pages.md`。高浏览低询盘 URL → `page-audit.md`。
