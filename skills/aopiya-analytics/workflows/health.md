# Workflow：数据健康 Tab

**业务问题**：数据可信吗？新鲜吗？双口径是否可比？配置是否齐全？

对应看板：Admin → 分析 → **数据健康**。

## 数据积木

```bash
DAYS=28

aopiya analytics meta --days $DAYS
aopiya analytics snapshots --no-payload --limit 40
aopiya analytics vercel-baseline --days $DAYS
aopiya analytics coverage --days $DAYS
aopiya analytics reconcile --days $DAYS
aopiya health
```

## 计算步骤

1. **模式与展示窗**：`meta.dataMode`、`displayPeriod`、`ga4`/`gscSearchTrend` 库内日序列起止与 `rowCount`。
2. **配置清单**：`meta.configured` — GA4 Property、GSC、前端 gtag、Vercel Drain。
3. **指标状态表**：`snapshots.items` — 每行 `source, metric, merge, periodStart~End, rowCount, createdAt`。
4. **全量基线**：`vercel-baseline` — pageviewsTotal、uniqueDevices、daily 趋势。
5. **覆盖率**：`coverage` — `vercelPageviews`、`ga4Sessions`、`coverageRatio`（重叠日期窗）。
6. **对账**：`reconcile` — GA4 `generate_lead` vs 询盘库 count；`ok` 布尔与 `note`。
7. **Vercel Drain**：生产 endpoint `https://www.aopiya.com/api/v1/analytics/drains/vercel`（`health` / Admin 配置说明）。

## 输出模板

```markdown
## 数据健康

### 配置
| 项 | 状态 |
|----|------|
| GA4 API | {ok} |
| GSC API | {ok} |
| 前端 gtag | {ok} |
| Vercel Drain | {有/无 live 数据} |

### 新鲜度
- GA4 traffic 最近更新：{createdAt}
- GSC search_trend：{createdAt}
- 展示窗：近 {N} 天 {start}~{end}

### 双口径覆盖
- 全量 PV：{n}；可分析 sessions：{n}；覆盖率：{x}%

### 对账
- {ok / 差异说明}

### 行动项
- {需 sync / 需配 Drain / 无需操作}
```

## 灵活偏离

- 单指标深挖：`snapshots --metric X --source Y --limit 1` 看完整 payload。
- 升级后冗余行：在 aopiya_web 执行 `pnpm analytics:consolidate-state -- --apply`（一次性）。
