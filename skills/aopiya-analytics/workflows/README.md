# 看板分析工作流（Workflow 附件）

与 Admin `/admin` 分析仪表板 **六 Tab 一一对应** 的可复用配方；口径以 `../references/metrics.md` 为准。

## 怎么用

1. **标准报告**（周报/月报/单 Tab 复盘）→ 打开对应 workflow，按步骤拉数、填输出模板。
2. **探索性问题**（自定义时间窗、单语种、交叉维度）→ 先读 `_building-blocks.md`，用「积木命令」或 `snapshots` 自算；**口径仍以 `../references/metrics.md` 为准**。
3. **赶时间**→ 派生 endpoint（如 `funnel`、`content-performance`）= 看板快捷套餐，与 workflow 结果应一致。

## 决策树

```
用户要什么？
├─ 站内标准报告 → weekly-report.md / monthly-report.md
├─ 对齐看板某一 Tab → overview | acquisition | content | seo | geo | health
├─ 只要一个 KPI → references/metrics.md + 命令速查（SKILL.md）
├─ 自定义切片/自然月 → _building-blocks.md + references/snapshot-metrics.md
└─ 单页 SEO/GEO/转化审计 → page-audit.md + references/page-audit-checklist.md
```

## 文件索引

| 文件 | 对应看板 Tab | 回答的业务问题 |
|------|----------------|----------------|
| `_building-blocks.md` | — | 积木命令、时间窗、snapshots 自算、偏离模板规则 |
| `overview.md` | 总览 | 本期健康吗？询盘、双口径访问、转化、环比、预警 |
| `acquisition.md` | 获客 | 从哪来？渠道、市场、设备、语种、AI 引荐 |
| `content.md` | 内容 | 哪些页/内容带来深度浏览与询盘？触点表现？ |
| `seo.md` | SEO | 搜索点击趋势、品牌 vs 非品牌、词机会、落地页 |
| `geo.md` | GEO | AI 引荐从哪些产品来？（提及率监测待接入） |
| `health.md` | 数据健康 | 数据新鲜吗？双口径覆盖、对账、指标状态 |
| `weekly-report.md` | 全 Tab | 一周运营简报（站内 CLI） |
| `monthly-report.md` | 全 Tab | 自然月报告（站内 CLI） |
| `page-audit.md` | SEO / 内容 | 单页 SEO/GEO/转化审计（数据定优先级） |

## 与 references/ 的关系

| 目录 | 职责 |
|------|------|
| `workflows/`（本目录） | 看板**计算配方**、命令清单、报告输出模板 |
| `references/metrics.md` | 口径宪法 |
| `references/narrative-layers.md` | L0→L5 业务叙事 + **读数三层**（随所选周期 / 同步窗 Top / 累计）与各 Tab 日趋势字段 |
| `references/methodology.md` | 报告**叙事结构**、SEO/GEO/舆情方法论 |
| `references/page-audit-checklist.md` | 单页检查清单（按 page_type） |
| `references/snapshot-metrics.md` | 快照 payload 字段目录 |

写报告时：workflow 负责「算什么」，methodology 负责「怎么写」。
