# AOPIYA Tools

独立站（www.aopiya.com）运维工具：全局 `aopiya` CLI + 两个 Agent Skill（内容 / 数据分析）。

| 装好后在哪 | 路径 |
|-----------|------|
| CLI（全局） | `~/.local/share/aopiya-tools/` |
| 命令 | `~/.local/bin/aopiya` |
| Skills（**默认项目**） | `<项目根>/.agents/skills/aopiya-*` |
| 凭证（全局） | `~/.config/aopiya/env.sh`（Win 用 `env.ps1`） |

CLI 仅全局安装；**Skills 默认装进 Agent 工作项目的 `.agents/skills/`**（可选 `--global-skills` 装到 `~/.agents/skills/`）。

## API Key

**由管理员提供**，不向仓库或公开渠道索取。拿到 Key 后交给 Agent 写入 `~/.config/aopiya/env.*`（勿提交 Git、勿写入日志）。

| Key | 用途 |
|-----|------|
| Agent Full | 发商品 / 文章 / 视频 + 数据分析 |
| Agent Analytics | 仅数据分析 |

---

## 丢给 Agent 的提示词（复制即用）

把下面整段发给 Agent，把 `[...]` 换成你的实际情况（Key 由管理员提供后粘贴）：

```text
请在本机完成 AOPIYA 工具傻瓜式安装，按下列步骤执行，不要跳过。

【环境】
- 系统：macOS / Linux / Windows（我的是：[填写，如 macOS + zsh]）
- 工具仓库：https://github.com/kaerf15/aopiya-tools（公开）
- 工具本机路径：[填写，默认 ~/aopiya-tools]（没有则：git clone https://github.com/kaerf15/aopiya-tools.git ~/aopiya-tools）
- Agent 工作项目路径：[填写项目根目录，Skills 将装到 <项目>/.agents/skills/]
- Key 用途：[内容+数据 用 Full / 仅分析 用 Analytics]
- Key 明文：[粘贴 Key]

【你要做的事】
1. cd 工具仓库根目录，执行 pnpm install && pnpm aopiya:install -- --project <Agent 工作项目路径>
2. 若找不到 aopiya 命令，把 ~/.local/bin 加入 PATH 并 source shell 配置
3. 写入持久化凭证（chmod 600）：
   - macOS/Linux → ~/.config/aopiya/env.sh，并在 ~/.zshrc 或 ~/.bashrc 自动 source
   - Windows → ~/.config/aopiya/env.ps1，并写入 PowerShell $PROFILE 自动加载
   - 内容：AOPIYA_API_BASE=https://www.aopiya.com/api/v1，AOPIYA_API_KEY=上面的 Key
4. 执行 aopiya health，把完整 JSON 输出贴给我；失败则自行排查到成功
5. 确认 <Agent 工作项目路径>/.agents/skills/ 下已有 aopiya-content、aopiya-analytics

完成后简短汇报：CLI 路径、Skills 路径、凭证文件位置、health 是否 ok。
```

---

## Agent 执行参考（给人看）

```bash
git clone https://github.com/kaerf15/aopiya-tools.git ~/aopiya-tools
cd ~/aopiya-tools && pnpm install
pnpm aopiya:install -- --project ~/你的项目根目录
```

## Skill 与文档

| 任务 | 文件 |
|------|------|
| 内容管理 | `skills/aopiya-content/SKILL.md` |
| 数据分析 | `skills/aopiya-analytics/SKILL.md` |
| API 契约 | `GET https://www.aopiya.com/api/openapi` |
