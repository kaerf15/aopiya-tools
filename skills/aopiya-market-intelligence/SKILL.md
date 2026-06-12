---
name: aopiya-market-intelligence
description: >-
  AOPIYA（奥比亚）品牌舆情监控与箱包 B2B 竞品分析：Web Search + 网页解析。
  触发词：舆情、品牌声誉、差评、投诉、竞品分析、竞争对手、市场情报、品牌监控、
  声誉风险、Alibaba 评价、sentiment、competitor。
---

# AOPIYA 市场情报（舆情 + 竞品）

监测 **AOPIYA / SUSEN / CHRISBELLA / BAGCO** 对外声誉与箱包 B2B 竞品动态：**Web Search + 网页抓取/解析**，每条结论带 URL。

## 分析模式

| 用户意图 | 怎么做 |
|----------|--------|
| 只要舆情 / 竞品简报 | `workflows/sentiment-competitor.md` |
| 用户提供经营数据时的交叉合稿 | `workflows/comprehensive-report.md` |
| 了解监测主体与业务背景 | `references/brand-context.md` |

## 目录结构

```
aopiya-market-intelligence/
├── SKILL.md
├── workflows/           # 外调配方 + 综合报告编排
└── references/          # 品牌与业务背景
```

## 参考文档

| 文档 | 何时读 |
|------|--------|
| `workflows/README.md` | 决策树 |
| `workflows/sentiment-competitor.md` | **舆情/竞品**主 workflow |
| `workflows/comprehensive-report.md` | 舆情与用户提供的经营数据交叉验证 |
| `references/brand-context.md` | 公司、三品牌、目标市场、合作模式 |

## 前置

- 需要网络检索与网页访问；无法逐页核实的标注「检索摘要」。

## 禁止

- 编造来源或 URL
- 未核实负面直接标 P0
- 把外网提及数写成站内 PV/询盘
