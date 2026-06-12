# 看板叙事分层（L0→L5）

与本 Skill 各 Tab workflow、Admin 分析看板（`/admin`）各区块标题对齐。**原则：每 Tab = 窗口 Top（排名/汇总）+ 至少一组日趋势（`daily`）**。

## 看板读数三层（UI 消歧）

Admin 各 Tab 用徽章与分块标题区分，避免用户以为切 7/28/90 时所有数字都会变：

| 层级 | 徽章 | 随工具栏？ | 典型内容 |
|------|------|------------|----------|
| **所选周期** | 随所选周期 | ✅ | KPI 日合计、折线/堆叠图、`leads stats-daily`、询盘库按周期统计 |
| **同步窗 Top** | 同步窗 Top | ❌（仅日折线变） | 渠道/国家/词表/页面/漏斗窗口汇总、GSC 环形图与排名表 |
| **累计** | 累计 | ❌ | 全历史询盘、Vercel 路径/引荐累计 Top、`uniqueDevices`、快照状态表 |

写报告时：**趋势**读「随所选周期」的 `daily`；**排名/结构**读「同步窗 Top」并注明同步日期范围；**累计**单独说明与周期无关。若所选 90 天而同步窗仅 ~28 天，排名会偏低；若所选 7 天而同步窗 ~28 天，排名来自更宽窗，勿与 7 天日合计直接对比。

## 分析周期（仅三档）

| 天数 | 标签 | 场景 | 环比（`traffic-compare`） |
|------|------|------|---------------------------|
| **7** | 周报 | 周度波动、预警 | 近 7 天 vs 前 7 天 |
| **28** | 月报（默认） | 运营复盘、渠道/内容决策 | 近 28 天 vs 前 28 天 |
| **90** | 季度 | 趋势与结构变化 | 近 90 天 vs 前 90 天 |

CLI/API 的 `--days` / `periodDays` 仅接受 **7、28、90**；其它值归并到 **28**。Workflow 里 `DAYS=28` 可改为 `7` 或 `90`。

| 层 | ID | 标题 | 口径 | 日维度字段（API/CLI） |
|----|-----|------|------|----------------------|
| 业务成果 | L0 | 有效询盘与转化 | 全量·询盘库 | `leads stats-daily` → `daily[{date,count}]`；`reconcile` → `daily`；`funnel` → `daily[{date,events}]` |
| 全量访问 | L1 | Vercel 每次打开 | 全量 | `vercel-baseline` → `daily`、`dimensionsDaily` |
| 可分析行为 | L2 | GA4 同意 Cookie | 可分析 | `traffic` → `data`；`channels` / `channel-performance` → `daily`；`geo-*` → `daily` |
| 搜索发现 | L3 | Google 搜索 | GSC | `search-trend` → `rows`；`search-brand-split` → `daily`；`gsc-queries` → `daily` |
| 互动埋点 | L4 | trackEvent 全量 | 可分析 | `tracking-events` → `daily`；`touchpoints` → `daily`；`scroll-depth` → `daily` |
| 数据可信 | L5 | 新鲜度与对账 | 混合 | `reconcile` + `leads stats-daily` 双序列；`tracking-events` 中 `cookie_consent_choice` 按日；`snapshots` 状态表 |

## Tab → 叙事层 → 日趋势重点

| Tab | 主层 | 日趋势 headline（看板副标题） | Agent 优先拉数 |
|-----|------|------------------------------|----------------|
| 总览 | L0+L1+L2 | 询盘、双口径访问与漏斗按日 | `leads stats-daily`、`traffic`、`vercel-baseline`、`funnel` |
| 获客 | L2+L1 | 渠道、市场与 AI 引荐按日 | `channel-performance`（`daily.sessions`）、`ai-referrals` |
| SEO | L3 | 搜索点击、词类型与品牌/非品牌按日 | `search-trend`、`search-brand-split.daily`、`search-keyword-trend` |
| GEO | L2+L4 | AI 引荐来源按日 | `ai-referrals.daily` |
| 内容 | L2+L4+L0 | 内容浏览、埋点互动与表单按日 | `tracking-events`、`funnel`（form_*）、`scroll-engagement` |
| 健康 | L5+L1 | 对账、Cookie 同意与全量 PV 按日 | `reconcile` + `leads stats-daily`、`tracking-events`（cookie）、`vercel-baseline.daily` |

## 分析叙事顺序（写报告时）

1. **先 L0**：本期有效询盘多少？日趋势升/降？对账是否一致？
2. **再 L1/L2**：全量 vs 可分析访问是否同向？覆盖率是否解释差异？
3. **按问题选 L3/L4**：SEO 下滑看 GSC 品牌结构；转化弱看漏斗 + 埋点（表单/CTA/卡片）。
4. **末 L5**：结论可信度——快照是否新鲜、`dataMode` 是否 live。

禁止用窗口 Top 冒充日序列；趋势一律读 `daily` 或 `traffic.data` / `search-trend.rows`。

## 报告输出必含块（与看板徽章一致）

各 workflow 输出模板在 KPI 之前插入：

```markdown
### 读数口径
- 同步窗：GA4 {meta.syncWindows.ga4.periodStart}~{end}（{spanDays} 天）；GSC {…}；`periodLinkage.relation` = {narrower|wider|aligned}
- 【随所选周期】= 下文日趋势与周期 KPI；【同步窗 Top】= 排名/漏斗中间步；【累计】= 全历史询盘、Vercel 路径 Top 等
```

`relation=narrower` 时勿把同步窗排名与 90 天日合计对比；`wider` 时勿把 7 天日合计与同步窗排名对比。

## 特殊字段形状

| 字段 | 形状 | 按日聚合 |
|------|------|----------|
| `reconcile.daily` | `[{date, items:[{count}]}]`（`lead_events_daily`） | 对 `items[].count` 求和 |
| `funnel.daily` | `[{date, events:{form_start,...}}]` | 直接取 `events[key]` |
| `tracking-events.daily` | `[{date, items:[{event, count}]}]` | `sumDailyEventCounts` 或筛 event |
| `channel-performance.daily.sessions` | `[{date, items:[{channel, sessions}]}]` | `channelSessionsDailyPivot` |
