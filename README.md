# AOPIYA Tools

www.aopiya.com：`aopiya` CLI + 三个 Skill（内容 / 站内分析 / 市场情报）。

`pnpm aopiya:install -- --project <项目根>` 安装 CLI 与 Skills；若项目根**已有** `AGENTS.md`，调度正文写入 `AGENTS.aopiya-tools.md`（不覆盖仓库自有规则）。

| 组件 | 路径 |
|------|------|
| CLI | `~/.local/bin/aopiya` |
| Skills | `<项目根>/.agents/skills/aopiya-*`（install **复制**，非软链接） |
| 调度正文 | 项目根 `AGENTS.md` 或 `AGENTS.aopiya-tools.md` |

## 安装

```bash
git clone https://github.com/kaerf15/aopiya-tools.git ~/aopiya-tools
cd ~/aopiya-tools && pnpm install
pnpm aopiya:install -- --project <项目根>
aopiya health
```

更新 Skill 后重跑 `aopiya:install` 即可。

## Agent 调度

跨 Skill 任务看项目根调度文件；各 Skill 细节见 `.agents/skills/aopiya-*/SKILL.md`。

| Skill | 入口 |
|-------|------|
| 内容 CMS | `.agents/skills/aopiya-content/SKILL.md` |
| 站内分析 | `.agents/skills/aopiya-analytics/SKILL.md` |
| 舆情竞品 | `.agents/skills/aopiya-market-intelligence/SKILL.md` |

### 路由

| 意图 | Skill |
|------|-------|
| 发/改/译内容、媒体 | content |
| 流量、询盘、SEO、看板、单页审计 | analytics |
| 舆情、竞品 | market-intelligence |
| 站内 + 站外综合 | 下文 |
| 分析后要改站 | 下文 |

### 综合分析

| 阶段 | 做什么 |
|------|--------|
| A 站内 | 跑 `aopiya-analytics` 的 `weekly-report.md` 或 `monthly-report.md`，整理**经营数据摘要**（询盘、GSC、渠道、内容表现等） |
| B 站外 | 跑 `aopiya-market-intelligence` 的 `sentiment-competitor.md` |
| C 合稿 | 将 A 摘要作为「用户提供的经营数据」输入 `comprehensive-report.md` |

A、B 可并行；C 需 A 摘要 + B 简报。

### 分析 → 改站

1. `aopiya-analytics/workflows/page-audit.md` → 输出改稿清单（`type`、`id`、`locale`、字段）
2. `aopiya-content`：`content update` + `publish` 按清单执行

## Skill 仓库路径

| 用途 | 文件 |
|------|------|
| 内容 | `skills/aopiya-content/SKILL.md` |
| 站内分析 | `skills/aopiya-analytics/SKILL.md` |
| 舆情竞品 | `skills/aopiya-market-intelligence/SKILL.md` |
| API | `GET https://www.aopiya.com/api/openapi` |
