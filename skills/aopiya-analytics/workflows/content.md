# Workflow：内容 Tab

**业务问题**：哪些页面/内容带来浏览、深度阅读和询盘？CTA/卡片/滚动表现如何？

对应看板：Admin → 分析 → **内容**。

## 数据积木

```bash
DAYS=28
PAGE_TYPE=all   # 或 article | product | commercial | brand | ...

aopiya analytics pages --days $DAYS --limit 50
# 按类型：加 --page-type article

aopiya analytics content-performance --days $DAYS --limit 30
aopiya analytics page-types --days $DAYS
aopiya analytics funnel --days $DAYS
aopiya analytics touchpoints --limit 20
aopiya analytics scroll-engagement --limit 15
aopiya analytics vercel-baseline --days $DAYS
aopiya analytics snapshots --source ga4 --metric content_card_clicks --limit 1
```

`content-performance` = 看板快捷套餐（GA4 页面 × GSC 点击 × 询盘 bySourcePage join）。

## 计算步骤

1. **页面 Top（可分析）**：`pages.items` 按 views/sessions 排序。
2. **内容×转化表**：`content-performance.items` 字段：`page_path, page_type, sessions, views, leads, lead_cvr, gsc_clicks`。
3. **页面类型分布**：`page-types.rows`。
4. **漏斗**（内容 Tab 内嵌）：同 `overview.md` 漏斗段。
5. **触点**：`touchpoints` — CTA、WhatsApp、表单等事件计数。
6. **滚动深度**：`scroll-engagement` — 到达率 = 滚到 75% 事件 ÷ 页面浏览（见看板说明）。
7. **卡片点击**：`snapshots --metric content_card_clicks` 的 `payload.rows`（`event, slug, count`）；与 content-performance 按 slug 对齐。
8. **全量页面 Top**：`vercel-baseline.items` Top10（路径级 PV，不依赖 Cookie）。

## 输出模板

```markdown
## 内容（近 {N} 天）

### 高表现内容（可分析×询盘）
| 类型 | 路径 | 浏览 | 询盘 | GSC点击 | 转化率 |
|------|------|------|------|---------|--------|
...

### 页面类型分布
...

### 触点 Top
| 事件 | 次数 |
|------|------|
...

### 全量 PV Top 路径（Vercel）
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
| 无卡片点击 | 检查 Cookie 同意与 GA4 sync；见 `CARD_CLICK_EMPTY` 看板提示 |

全站内容枚举见 `../references/site-pages.md`。

**高浏览低询盘 / 高 GSC 低转化** 的 URL → `page-audit.md` 做单页审计。
