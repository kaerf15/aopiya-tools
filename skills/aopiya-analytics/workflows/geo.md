# Workflow：GEO Tab

**业务问题**：用户从哪些 AI 产品点进网站？（「AI 是否提及品牌」另途）

对应看板：Admin → 分析 → **GEO**。叙事层：**L2 可分析 + L4 引荐埋点**（见 `../references/narrative-layers.md`）。

## 数据积木

```bash
DAYS=28  # 仅 7 / 28 / 90

aopiya analytics meta --days $DAYS
aopiya analytics ai-referrals --days $DAYS
aopiya analytics pages --days $DAYS --limit 50   # AI 流量落地页（窗口 Top）
```

## 计算步骤

### 窗口汇总

1. **AI 引荐 sessions 合计**：`ai-referrals.sessionsTotal`。
2. **按来源拆分**：`ai-referrals.items` — `source`、`sessions`、`users`。
3. **落地页（窗口）**：结合 `pages` 或 landing 相关路径，看 AI 流量进站后落在哪些 URL。

### 按日叙事

4. **AI 引荐日趋势（主图）**：`ai-referrals.daily` — 按日 sum 全来源 `sessions`；可选拆 Top3 `source` 多系列。
5. **与全站可分析访问对比**：`traffic --days $DAYS` 的 sessions 日合计 — **仅算占比趋势**，禁止与 Vercel 全量相减。

## 输出模板

```markdown
## GEO / AI 可见性（近 {N} 天）

### 读数口径
- 同步窗：GA4 {meta.syncWindows.ga4}；`periodLinkage.relation` = {narrower|wider|aligned}
- 【随所选周期】= `ai-referrals.daily` 日趋势；【同步窗 Top】= 来源排名、着陆页 Top；【累计】= AI 提及率（待接入）

### 按日叙事【随所选周期】
- AI 引荐 sessions：{升/降}；占可分析访问约 {x}%（趋势）
- 峰值日：{date} · 主来源 {source}

### AI 引荐流量【同步窗 Top】
- 总 sessions：{n}
- 来源数：{k}

| 来源 | Sessions | Users |
|------|----------|-------|
...

### 说明
- 以上为「从 AI 产品跳转进站」，不等于 AI 回答中提及 AOPIYA。
- 「AI 提及监控」【累计·待接入】待第三方 GEO API；可手动在 ChatGPT/Perplexity 定性抽查。

### 建议
1. 被引多的页面结构（FAQ、清单）可复制到新内容。
2. ...
```

## 灵活偏离

- 单来源下钻：`ai-referrals.daily` 按 `source` 筛。
- 舆情/竞品：`../references/methodology.md` 网络检索，非本 Tab 数据。
