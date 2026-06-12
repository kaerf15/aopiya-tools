# Workflow：SEO Tab

**业务问题**：Google 搜索带来多少点击？品牌词 vs 新客发现词？有哪些词机会？

对应看板：Admin → 分析 → **SEO**。

## 数据积木

```bash
DAYS=28

aopiya analytics search-trend --days $DAYS
aopiya analytics search-brand-split
aopiya analytics search-keyword-breakdown
aopiya analytics search-keyword-trend --days $DAYS
aopiya analytics gsc-queries --limit 100
aopiya analytics gsc-pages --limit 25
aopiya audit run          # 技术 SEO 专项，可选
```

## 口径要点

- **仅 GSC**：不代表全站访问；滞后 2–3 天，近几天为空正常。
- **品牌词**：AOPIYA、奥比亚、Susen、Chrisbella、Bagco → `brand`。
- **非品牌**：`handbag manufacturer`、`oem bags` 等 → 看新客发现；见 `../references/metrics.md`。

## 计算步骤

1. **趋势汇总**：`search-trend.totals`（clicks, impressions, ctr, avgPosition）+ `rows` 日序列。
2. **品牌占比**：`search-brand-split.brandClickShare`；`nonBrandTop` 为 TOP 非品牌词。
3. **词类型分布**：`search-keyword-breakdown.types`（brand / category / oem / …）。
4. **类型日趋势**：`search-keyword-trend.rows` 按 date 堆叠各 type 的 clicks。
5. **词表机会**：
   - **高展示零点击**：`gsc-queries` 中 `impressions≥1 && clicks=0`，按 impressions 降序；
   - **.scatter 象限**：高展示 + 差排名（position 大）→ 优化目标。
6. **落地页**：`gsc-pages` Top / 尾部页面。

## 输出模板

```markdown
## SEO（近 {N} 天 · GSC）

### 搜索总览
| 点击 | 展示 | CTR | 均排名 |
|------|------|-----|--------|
| {clicks} | {impressions} | {ctr} | {position} |

### 品牌 vs 非品牌
- 品牌点击占比：{x}%
- Top 非品牌词：...

### 词类型（点击）
...

### 机会词（高展示低点击 Top5）
| 查询词 | 展示 | 排名 |
|--------|------|------|
...

### 落地页表现
...

### 建议（URL + 改 title/meta/内链）
1. ...
```

## 灵活偏离

- 自然月 SEO：`search-trend --days 90` 筛月聚合 clicks/impressions。
- 单词追踪：`gsc-queries` 筛 `query` 含关键词；或 sync 后重拉。
- 技术项：并行 `audit sitemap` / `audit links`（见 `../references/methodology.md`）。
- **落地页深挖**：高展示低点击 / 排名 4–15 的 URL → `page-audit.md`（带 GSC 词作目标词）。
