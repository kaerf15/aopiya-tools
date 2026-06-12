# Workflow：GEO Tab

**业务问题**：用户从哪些 AI 产品点进网站？（「AI 是否提及品牌」另途）

对应看板：Admin → 分析 → **GEO**。

## 数据积木

```bash
aopiya analytics ai-referrals
```

## 计算步骤

1. **AI 引荐 sessions 合计**：`ai-referrals.sessionsTotal`。
2. **按来源拆分**：`ai-referrals.items` — `source`（如 chatgpt.com、perplexity.ai）、`sessions`、`users`。
3. **与「AI 提及率」区分**：当前**仅 GA4 引荐流量**；看板「AI 提及监控」待第三方 GEO API，Agent 可用网络检索补充定性（见 `../references/methodology.md` GEO 节）。

## 输出模板

```markdown
## GEO / AI 可见性

### AI 引荐流量（可分析口径）
- 总 sessions：{n}
- 来源数：{k}

| 来源 | Sessions | Users |
|------|----------|-------|
...

### 说明
- 以上为「从 AI 产品跳转进站」，不等于 AI 回答中提及 AOPIYA。
- 可选：在 ChatGPT/Perplexity 手动问采购问题，记录是否引用本站（定性）。

### 建议
1. 被引多的页面结构（FAQ、清单）可复制到新内容。
2. ...
```

## 灵活偏离

- 结合 `content.md`：AI 引荐高的落地页是哪些（需 GA4 landing_pages 快照或 `pages`）。
- 舆情/竞品：用 `../references/methodology.md` 网络检索工作流，非本 Tab 数据。
