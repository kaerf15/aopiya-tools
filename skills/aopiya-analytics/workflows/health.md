# Workflow：数据健康 Tab

**业务问题**：数据可信吗？新鲜吗？双口径是否可比？配置是否齐全？

对应看板：Admin → 分析 → **数据健康**。叙事层：**L5 数据可信 + L1 全量**（见 `../references/narrative-layers.md`）。

## 数据积木

```bash
DAYS=28

aopiya analytics stats-check --days $DAYS
aopiya analytics meta --days $DAYS
aopiya analytics snapshots --no-payload --limit 40
aopiya analytics vercel-baseline --days $DAYS
aopiya analytics coverage --days $DAYS
aopiya analytics reconcile --days $DAYS
aopiya leads stats-daily --days $DAYS
aopiya analytics tracking-events --days $DAYS --limit 50
aopiya health
```

## 计算步骤

### 状态与配置

0. **统计起点**：`stats-check.ok === true` 且 `statsStartDate === 2026-06-13`；否则先联系运维修正环境变量并清库（见 `metrics.md` 测试询盘清理）。
1. **模式与展示窗**：`meta.dataMode`、`displayPeriod`、`ga4`/`gscSearchTrend` 库内日序列。
2. **配置清单**：`meta.configured` — GA4、GSC、gtag、Vercel Drain。
3. **指标状态表**：`snapshots.items` — `merge`、`rowCount`、`createdAt`；核对 `*_daily` 是否存在。
4. **覆盖率（窗口）**：`coverage.coverageRatio`（重叠日期窗）。

### 按日叙事（L5）

5. **询盘对账日趋势**：外连接 `reconcile.daily`（GA4 generate_lead）与 `leads stats-daily.daily`（询盘库）— 双线应贴合；决策以库为准。
6. **Cookie 同意日趋势**：`tracking-events` 中 `cookie_consent_choice` 的 `daily` 按日 count（或专用 cookie 聚合）。
7. **全量 PV 日趋势（L1）**：`vercel-baseline.daily` — 验证 Drain 连续入库。

## 输出模板

```markdown
## 数据健康

### 读数口径
- 同步窗：GA4 {meta.syncWindows.ga4}；GSC {meta.syncWindows.gscQueries}；`periodLinkage` 见 meta
- 【随所选周期】= 对账/Cookie/全量 PV 日趋势、覆盖重叠窗；【同步窗 Top】= —；【累计】= Vercel 路径/引荐 Top、快照状态表

### 配置
| 项 | 状态 |
|----|------|
| GA4 API | {ok} |
| GSC API | {ok} |
| 前端 gtag | {ok} |
| Vercel Drain | {有/无 live 数据} |

### 新鲜度
- GA4 traffic 最近更新：{createdAt}（北京时间 `+08:00`，展示可用 SDK `formatBeijingDateTime`）
- GSC search_trend：{createdAt}
- 展示窗【随所选周期】：近 {N} 天 {displayPeriod.start}~{end}
- 同步窗 Top 窗：GA4 {syncWindows.ga4}；GSC {syncWindows.gscQueries}
- `*_daily` 日点数：{列举关键 metric rowCount}

### 按日叙事【随所选周期】
- 对账：GA4 vs 库 {一致/差异日列表}
- Cookie 同意：{趋势}
- 全量 PV：{连续/断档}

### 双口径覆盖【随所选周期·重叠窗】
- 全量 PV：{n}；可分析 sessions：{n}；覆盖率：{x}%

### Vercel Top【累计】
- 路径/引荐 Top 为接通 Drain 以来累计，不随 {N} 重算

### 行动项
- {需 sync / 需配 Drain / 无需操作}
```

## 灵活偏离

- 单指标深挖：`snapshots --metric X --source Y --limit 1` 看完整 payload。
- 升级前若 snapshots 同指标存在多条状态：联系站点运维做一次性状态合并，再 `aopiya analytics sync`。
