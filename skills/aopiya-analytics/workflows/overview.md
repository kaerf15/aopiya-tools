# Workflow：总览 Tab

**业务问题**：本期站点健康吗？询盘、访问、转化、环比如何？有无预警？

对应看板：Admin → 分析 → **总览**。叙事层：**L0 业务成果 → L1 全量 → L2 可分析**（见 `../references/narrative-layers.md`）。

## 数据积木

```bash
DAYS=28  # 仅 7 / 28 / 90；其它值 API 归并到 28

aopiya analytics meta --days $DAYS
aopiya leads stats-daily --days $DAYS
aopiya analytics traffic --days $DAYS
aopiya analytics vercel-baseline --days $DAYS
aopiya analytics traffic-wow --days $DAYS
aopiya analytics traffic-compare --days $DAYS
aopiya analytics funnel --days $DAYS
aopiya analytics channels --days $DAYS
aopiya analytics high-intent --days $DAYS
aopiya analytics content-lead-share --days $DAYS
aopiya analytics coverage --days $DAYS
aopiya analytics reconcile --days $DAYS
aopiya leads stats --from <周期起 ISO>
```

快捷套餐：上列派生命令；与看板计算一致。

## 计算步骤（与看板对齐）

### 窗口汇总（排名/单值）

1. **可分析访问**：`traffic.data` 内 `sessions` / `users` 按日求和得窗口合计。
2. **全量访问**：`vercel-baseline.pageviewsTotal`（窗口内 `daily` 之和）；无数据则标注 Drain 未接通。
3. **有效询盘**：`leads stats-daily.total` 或 `funnel.steps` 中 `step=generate_lead`（均来自询盘库）。
4. **询盘转化率（估算）**：`leadsN / sessionsTotal * 100`（分子全量询盘、分母可分析 sessions）。
5. **渠道结构**：`channels.rows` 按 sessions 降序；Top6 占比。
6. **深度浏览**：`high-intent.rate`（高意向 view_* 事件 ÷ users 总和，近似 KPI）。
7. **内容带动询盘**：`content-lead-share` 返回的占比。
8. **覆盖率**：`coverage.coverageRatio`（仅日期重叠窗）。

### 按日叙事（趋势，必读 `daily`）

9. **询盘日趋势（L0）**：`leads stats-daily.daily` — 按 `date` 画折线；与 `reconcile.daily`（GA4 generate_lead）对照，**决策以库为准**。
10. **双口径访问日趋势（L1+L2）**：按 date 外连接 `traffic.data` 与 `vercel-baseline.daily`（同图两系列，不相减）。
11. **漏斗日趋势（L0/L2）**：`funnel.daily` — 关注 `form_start`、`form_submit`、`generate_lead` 按日是否同向。
12. **渠道日趋势（L2）**：`channels.daily` 或 `channel-performance.daily.sessions` — Top5 渠道 sessions 堆叠/折线。
13. **环比摘要**：`traffic-compare` 近 N vs 前 N；`traffic-wow` 近7 vs 前7。

### 预警（复现看板 AlertsBar）

14. `traffic-wow.wow.sessions` ≤ -30% → 危险；≥ +30% → 利好；
15. 有 sessions 但 `leads stats.total=0` → 警告；
16. `reconcile.ok=false` 且 `dataMode=live` → 对账差异；
17. 覆盖率 <35% 且全量 PV>50 → 提示 Cookie 覆盖偏低。

## 输出模板

```markdown
## 总览（近 {N} 天）

**一句话**：{健康/需关注/异常} — {主因}

### 读数口径
- 同步窗：GA4 {meta.syncWindows.ga4}；GSC {meta.syncWindows.gscQueries}；`periodLinkage.relation` = {narrower|wider|aligned}
- 【随所选周期】= 业务 KPI、日趋势、环比；【同步窗 Top】= 渠道占比/漏斗中间步；【累计】= `uniqueDevices`、全历史询盘（无 from 时）

### 业务成果（L0）【随所选周期】
| 指标 | 数值 | 口径 |
|------|------|------|
| 有效询盘 | {n} | 全量·库 |
| 询盘转化（估算） | {x}% | 询盘÷可分析访问 |
| 可分析访问 | {n} sessions | GA4 |
| 全量 PV | {n} | Vercel·周期内 daily 合计 |

### 按日叙事【随所选周期】
- 询盘：{升/降/平稳} — 峰值日 {date}
- 双口径访问：可分析 {趋势}；全量 {趋势}；覆盖率 {x}%
- 漏斗：表单开始→提交 {转化简述}

### 趋势与环比【随所选周期】
- 可分析访问：近7天 {a} vs 前7天 {b}（{wow}%）
- 近{N} vs 前{N}：`traffic-compare` 摘要

### 渠道 Top3【同步窗 Top】
1. {channel} {sessions}
...

### 预警
- {无 / 列表}

### 建议动作（≤3 条）
1. ...
```

## 灵活偏离

| 需求 | 做法 |
|------|------|
| 自然月总览 | `traffic --days 90` 筛月 + `leads stats --from/--to` |
| 仅关心询盘 | `leads stats-daily` + `funnel`；可跳过渠道 |
| 双口径趋势自定义窗 | `vercel-baseline` + `traffic` 同 `_building-blocks` 切 date |
