# Workflow：总览 Tab

**业务问题**：本期站点健康吗？询盘、访问、转化、环比如何？有无预警？

对应看板：Admin → 分析 → **总览**。

## 数据积木

```bash
DAYS=28  # 可改 7 / 14 / 28 / 90

aopiya analytics meta --days $DAYS
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

1. **可分析访问**：`traffic.data` 内 `sessions` / `users` 按日求和。
2. **全量访问**：`vercel-baseline.pageviewsTotal`（窗口内 `daily` 之和）；无数据则标注 Drain 未接通。
3. **有效询盘**：`funnel.steps` 中 `step=generate_lead` 的 `count`（来自询盘库，非 GA4 事件）。
4. **询盘转化率（估算）**：`leadsN / sessionsTotal * 100`（分子全量询盘、分母可分析 sessions）。
5. **渠道结构**：`channels.rows` 按 sessions 降序；Top6 占比。
6. **双口径趋势图**：按 date 外连接 `traffic.data` 与 `vercel-baseline.daily`（同图两系列，不相减）。
7. **深度浏览**：`high-intent.rate`（高意向 view_* 事件 ÷ users 总和，近似 KPI）。
8. **内容带动询盘**：`content-lead-share` 返回的占比。
9. **覆盖率**：`coverage.coverageRatio`（仅日期重叠窗）。
10. **预警**（复现看板 AlertsBar 逻辑）：
    - `traffic-wow.wow.sessions` ≤ -30% → 危险；≥ +30% → 利好；
    - 有 sessions 但 `leads stats.total=0` → 警告；
    - `reconcile.ok=false` 且 `dataMode=live` → 对账差异；
    - 覆盖率 <35% 且全量 PV>50 → 提示 Cookie 覆盖偏低。

## 输出模板

```markdown
## 总览（近 {N} 天）

**一句话**：{健康/需关注/异常} — {主因}

### 业务成果
| 指标 | 数值 | 口径 |
|------|------|------|
| 有效询盘 | {n} | 全量·库 |
| 询盘转化（估算） | {x}% | 询盘÷可分析访问 |
| 可分析访问 | {n} sessions | GA4 |
| 全量 PV | {n} | Vercel |

### 趋势与环比
- 可分析访问：近7天 {a} vs 前7天 {b}（{wow}%）
- 近{N} vs 前{N}：`traffic-compare` 摘要

### 渠道 Top3
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
| 仅关心询盘 | 可跳过渠道，保留 `funnel` + `leads stats` |
| 双口径趋势自定义窗 | `vercel-baseline` + `traffic` 同 `_building-blocks` 切 date |
