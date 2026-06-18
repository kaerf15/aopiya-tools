# AOPIYA Tools

www.aopiya.com：`aopiya` CLI + 三个 Skill（内容 / 站内分析 / 市场情报）。

`pnpm aopiya:install -- --project <项目根>` 安装 CLI 与 Skills；若项目根**已有** `AGENTS.md`，调度正文写入 `AGENTS.aopiya-tools.md`（不覆盖仓库自有规则）。


| 组件     | 路径                                                   |
| ------ | ---------------------------------------------------- |
| CLI    | `~/.local/bin/aopiya`                                |
| Skills | `<项目根>/.agents/skills/aopiya-*`（install **复制**，非软链接） |
| 调度正文   | 项目根 `AGENTS.md` 或 `AGENTS.aopiya-tools.md`           |


## 安装

```bash
git clone https://github.com/kaerf15/aopiya-tools.git ~/aopiya-tools
cd ~/aopiya-tools && pnpm install
pnpm aopiya:install -- --project <项目根>
aopiya health
```

更新 Skill 后重跑 `aopiya:install` 即可。

## AI 指南（复制给 Agent）

把下面整段发给 Agent，把 `[...]` 换成实际情况；访问密钥由技术同事在本机私下提供（勿写入仓库、后台或日志）。

```
请在本机完成 AOPIYA 工具傻瓜式安装，按下列步骤执行，不要跳过。

【环境】
- 系统：macOS / Linux / Windows（我的是：[填写，如 macOS + zsh]）
- 工具仓库：https://github.com/kaerf15/aopiya-tools（公开）
- 工具本机路径：[填写，默认 ~/aopiya-tools]（没有则：git clone https://github.com/kaerf15/aopiya-tools.git ~/aopiya-tools）
- Agent 工作项目路径：[填写项目根目录，Skills 将装到 <项目>/.agents/skills/]
- Key 用途：[内容+数据 用 Full / 仅分析 用 Analytics]
- Key 明文：[由管理员在本机签发后私下提供，勿写入仓库、后台或日志]

【你要做的事】
1. cd 工具仓库根目录，执行 pnpm install && pnpm aopiya:install -- --project <Agent 工作项目路径>
2. 若找不到 aopiya 命令，把 ~/.local/bin 加入 PATH 并 source shell 配置
3. 写入持久化凭证（chmod 600）：
   - macOS/Linux → ~/.config/aopiya/env.sh，并在 ~/.zshrc 或 ~/.bashrc 自动 source
   - Windows → ~/.config/aopiya/env.ps1，并写入 PowerShell $PROFILE 自动加载
   - 内容：AOPIYA_API_BASE=https://www.aopiya.com/api/v1，AOPIYA_API_KEY=管理员提供的 Key
4. 执行 aopiya health，把完整 JSON 输出贴给我；失败则自行排查到成功
5. 确认 <Agent 工作项目路径>/.agents/skills/ 下已有 aopiya-content、aopiya-analytics、aopiya-market-intelligence（应为复制目录，非软链接）
6. 确认调度正文：无 AGENTS.md 则写入项目根；已有则写入 AGENTS.aopiya-tools.md

完成后简短汇报：CLI 路径、Skills 路径、AGENTS 调度文件路径、凭证文件位置、health 是否 ok。
```

## Agent 调度

跨 Skill 任务看项目根调度文件；各 Skill 细节见 `.agents/skills/aopiya-*/SKILL.md`。


| Skill  | 入口                                                   |
| ------ | ---------------------------------------------------- |
| 内容 CMS | `.agents/skills/aopiya-content/SKILL.md`             |
| 站内分析   | `.agents/skills/aopiya-analytics/SKILL.md`           |
| 舆情竞品   | `.agents/skills/aopiya-market-intelligence/SKILL.md` |


### 路由


| 意图                | Skill               |
| ----------------- | ------------------- |
| 发/改/译内容、媒体        | content             |
| 流量、询盘、SEO、看板、单页审计 | analytics           |
| 舆情、竞品             | market-intelligence |
| 站内 + 站外综合         | 下文                  |
| 分析后要改站            | 下文                  |


### 综合分析


| 阶段   | 做什么                                                                                           |
| ---- | --------------------------------------------------------------------------------------------- |
| A 站内 | 跑 `aopiya-analytics` 的 `weekly-report.md` 或 `monthly-report.md`，整理**经营数据摘要**（询盘、GSC、渠道、内容表现等） |
| B 站外 | 跑 `aopiya-market-intelligence` 的 `sentiment-competitor.md`                                    |
| C 合稿 | 将 A 摘要作为「用户提供的经营数据」输入 `comprehensive-report.md`                                               |


A、B 可并行；C 需 A 摘要 + B 简报。

### 分析 → 改站

1. `aopiya-analytics/workflows/page-audit.md` → 输出改稿清单（`type`、`id`、`locale`、字段）
2. `aopiya-content`：`content update` + `publish` 按清单执行

## Skill 仓库路径


| 用途   | 文件                                           |
| ---- | -------------------------------------------- |
| 内容   | `skills/aopiya-content/SKILL.md`             |
| 站内分析 | `skills/aopiya-analytics/SKILL.md`           |
| 舆情竞品 | `skills/aopiya-market-intelligence/SKILL.md` |
| API  | `GET https://www.aopiya.com/api/openapi`     |


