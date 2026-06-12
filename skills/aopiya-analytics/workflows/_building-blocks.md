# 分析积木与灵活切片

## 三种取数方式

| 方式 | 何时用 | 示例 |
|------|--------|------|
| **快捷套餐** | 与看板某板块完全一致 | `aopiya analytics funnel --days 28` |
| **积木 endpoint** | 单指标、可调 `periodDays` / `limit` | `aopiya analytics traffic --days 90` |
| **快照 payload** | 无专用命令、需原始行自算 | `aopiya analytics snapshots --metric traffic --source ga4 --limit 1` |

口径宪法：`../references/metrics.md`。payload 字段目录：`../references/snapshot-metrics.md`。

## 时间窗

- **滚动 N 天**：多数命令 `--days N`（默认 28）。基于「今天往前 N 天」切日序列。
- **近 7 vs 前 7 环比**：`aopiya analytics traffic-wow`（固定 7 天窗）。
- **近 N vs 前 N 环比**：`aopiya analytics traffic-compare --days N`。
- **自然月**：
  1. `aopiya analytics traffic --days 90`（或 `search-trend --days 90`）拿日序列；
  2. 在内存中筛 `date` 落在 `YYYY-MM-01` ~ 月末；
  3. 询盘用 `aopiya leads stats --from <月首 ISO> --to <下月首 ISO>`。

## 双口径铁律

- **全量** = Vercel（`vercel-baseline`）；**可分析** = GA4（`traffic`、`channels` 等）。
- **禁止**用全量减可分析、或混口径算占比（**例外**：`coverage` 覆盖率，仅在日期重叠窗内）。
- **有效询盘**以 `leads` 库为准；GA4 `generate_lead` 仅对账。

## 窗口聚合的限制

`channels`、`pages`、`gsc-queries` 等是 **上次 sync 拉的固定 N 天窗**，API 不能改成 60 天窗。
要更长窗口：先 `aopiya analytics sync --days 60`（勿高频），再读命令。

## 新鲜度检查（任何分析前建议执行）

```bash
aopiya analytics meta --days 28
aopiya analytics snapshots --no-payload --limit 30
```

- `createdAt` 距今 >24h 且要做 SEO/渠道结论 → 考虑 `aopiya analytics sync --days 28`。
- `dataMode: mock` → 停止产出真实结论。

## 灵活切片示例

### 仅看法语流量

```bash
# 全量：vercel-baseline 的 locales 数组筛 locale=fr
aopiya analytics vercel-baseline --days 28

# 可分析：pages 或 snapshots ga4:pages 的 rows，保留路径前缀 /fr/
aopiya analytics pages --days 28 --limit 100
```

路径语种规则见 `../references/metrics.md`（`en` 无前缀，其余 `/fr` 等）。

### 仅看某渠道

```bash
aopiya analytics channels --days 28
# 在返回 rows 中筛 channel 含 Organic / Paid / Direct 等
```

### 内容路径询盘

```bash
aopiya leads stats --from <ISO> --to <ISO>
# bySourcePage 中路径含 /news/、/products/ 等自行归类
```

### 从快照自算（无专用 CLI 时）

```bash
aopiya analytics snapshots --source ga4 --metric landing_pages --limit 1
# 解析 items[0].payload.rows
```

## 偏离标准 workflow 时

允许：

- 改 `periodDays`、`limit`、语种/路径过滤、自然月聚合、多指标交叉表。

不允许（除非用户明确要求且注明「非看板口径」）：

- 混用双口径相减；
- 用 GA4 询盘事件替代 leads 库作主指标；
- 把 GSC 点击当「全站访问」。
