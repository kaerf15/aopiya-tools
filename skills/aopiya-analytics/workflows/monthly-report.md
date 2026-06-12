# Workflow：月报（自然月）

**周期**：指定自然月 `YYYY-MM`（如 2026-05）。

## 时间边界

```text
FROM = YYYY-MM-01T00:00:00.000Z
TO   = 下月 01T00:00:00.000Z   # 不含下月首日
```

询盘（精确）：

```bash
aopiya leads stats --from $FROM --to $TO
aopiya leads list --from $FROM --to $TO   # 明细附录
```

流量/搜索（日序列聚合）：

```bash
# 拉足够长的日序列（覆盖目标月 + 环比上月）
aopiya analytics traffic --days 90
aopiya analytics search-trend --days 90
aopiya analytics vercel-baseline --days 90
```

在 Agent 内：

1. 筛 `data` / `daily` / `rows` 中 `date` ∈ [月首, 月末] 得 **本月**；
2. 筛上月同长度日期得 **环比**；
3. 禁止用 `--days 28` 代替自然月（除非用户接受滚动窗）。

## 推荐命令包

```bash
MONTH_FROM=2026-05-01T00:00:00.000Z
MONTH_TO=2026-06-01T00:00:00.000Z

aopiya leads stats --from $MONTH_FROM --to $MONTH_TO
aopiya analytics traffic --days 90          # → 聚合五月 sessions/users
aopiya analytics search-trend --days 90     # → 聚合五月 GSC
aopiya analytics vercel-baseline --days 90  # → 聚合五月全量 PV
aopiya analytics funnel --days 28           # 注：漏斗窗口仍为 sync 窗，月报中注明
aopiya analytics content-performance --days 28 --limit 30
aopiya analytics search-brand-split
aopiya analytics channel-performance --days 28
```

**说明**：窗口聚合指标（channels、content-performance）绑定最近 sync 的 N 天窗；月报正文应标注「渠道/页面 Top 为 sync 滚动窗，非严格自然月」，或月初执行一次 `sync --days 60` 扩大窗。

## 输出模板

```markdown
# AOPIYA 独立站月报（{YYYY-MM}）

## 核心 KPI
| 指标 | 本月 | 上月环比 | 口径 |
|------|------|----------|------|
| 有效询盘 | | | leads 库 |
| 可分析访问 | | | GA4 日序列聚合 |
| 全量 PV | | | Vercel daily 聚合 |
| GSC 点击 | | | GSC 日序列聚合 |

## 获客结构
{channel-performance 摘要 + byLocale 询盘}

## SEO
{search-trend 月合计 + brand-split + 机会词 Top5}

## 内容与转化
{content-performance Top10 + 内容带动询盘占比}

## 洞察与下月计划
1. ...
2. ...
```

## 灵活偏离

- **滚动 30 天近似月报**：用户明确接受时可用 `--days 30`，须在报告中声明非自然月。
- **导出存档**：`aopiya leads export --from ... --to ...` 附 CSV。
