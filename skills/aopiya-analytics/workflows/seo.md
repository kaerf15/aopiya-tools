# Workflow：SEO Tab

**业务问题**：Google 搜索带来多少点击？品牌词 vs 新客发现词？有哪些词机会？

对应看板：Admin → 分析 → **SEO**。叙事层：**L3 搜索发现**（见 `../references/narrative-layers.md`）。

## 数据积木

```bash
DAYS=28  # 仅 7 / 28 / 90

aopiya analytics meta --days $DAYS
aopiya analytics search-trend --days $DAYS
aopiya analytics search-brand-split --days $DAYS
aopiya analytics search-keyword-breakdown --days $DAYS
aopiya analytics search-keyword-trend --days $DAYS
aopiya analytics gsc-queries --limit 100 --days $DAYS
aopiya analytics gsc-pages --limit 25 --days $DAYS
aopiya audit run          # 技术 SEO 专项，可选
```

## 口径要点

- **仅 GSC**：不代表全站访问；滞后 2–3 天，近几天为空正常。
- **品牌词**：AOPIYA、奥比亚、Susen、Chrisbella、Bagco → `brand`。
- **非品牌**：`handbag manufacturer`、`oem bags` 等 → 看新客发现；见 `../references/metrics.md`。

## 计算步骤

### 窗口汇总

1. **趋势汇总**：`search-trend.totals` + `rows` 日序列（点击/展示/CTR/排名）。
2. **品牌占比（窗口）**：`search-brand-split.brandClickShare`；`nonBrandTop`。
3. **词类型分布（窗口）**：`search-keyword-breakdown.types`。
4. **词表机会**：`gsc-queries` 高展示零点击；高展示差排名。
5. **落地页（窗口）**：`gsc-pages` Top。

### 按日叙事

6. **搜索点击日趋势**：`search-trend.rows` — 主折线 clicks（可叠加 impressions）。
7. **品牌 vs 非品牌日趋势**：`search-brand-split.daily` — `brand` / `nonBrand`（或 `brandClicks` / `nonBrandClicks`）双系列。
8. **词类型日堆叠**：`search-keyword-trend.rows` 按 date 各 type clicks。

## 输出模板

```markdown
## SEO（近 {N} 天 · GSC）

### 读数口径
- 同步窗：GSC {meta.syncWindows.gscQueries}；`periodLinkage.relation` = {narrower|wider|aligned}
- 【随所选周期】= `search-trend.totals/rows`、品牌/词类型日趋势；【同步窗 Top】= 词表、环形图分布、落地页排名

### 按日叙事【随所选周期】
- 搜索点击：{升/降}；品牌占比日趋势：{简述}
- 词类型：{category/oem 等是否抬头}

### 搜索总览【随所选周期】
| 点击 | 展示 | CTR | 均排名 |
|------|------|-----|--------|
| {clicks} | {impressions} | {ctr} | {position} |

### 品牌 vs 非品牌【同步窗 Top】
- 品牌点击占比：{x}%
- Top 非品牌词：...

### 词类型（点击）【同步窗 Top】
...

### 机会词（高展示低点击 Top5）【同步窗 Top】
| 查询词 | 展示 | 排名 |
|--------|------|------|
...

### 落地页表现【同步窗 Top】
...

### 建议（URL + 改 title/meta/内链）
1. ...
```

## 灵活偏离

- 自然月 SEO：`search-trend --days 90` 筛月聚合 clicks/impressions。
- 单词追踪：`gsc-queries` 筛 `query`；或 sync 后重拉。
- 落地页深挖：高展示低点击 URL → `page-audit.md`。
