# Workflow：获客 Tab

**业务问题**：访客从哪来？哪些市场/语种/设备值得投入？

对应看板：Admin → 分析 → **获客**。叙事层：**L2 可分析 + L1 全量**（见 `../references/narrative-layers.md`）。

## 数据积木

```bash
DAYS=28  # 仅 7 / 28 / 90

aopiya analytics meta --days $DAYS
aopiya analytics channel-performance --days $DAYS
aopiya analytics geo-countries --limit 20 --days $DAYS
aopiya analytics geo-devices --days $DAYS
aopiya analytics geo-new-vs-returning --days $DAYS
aopiya analytics ai-referrals --days $DAYS
aopiya analytics vercel-baseline --days $DAYS
aopiya leads stats --from <周期起 ISO>
```

## 计算步骤

### 窗口汇总

1. **渠道 × 转化**：`channel-performance.items` 每行含 `channel, sessions, leads, lead_cvr, leadSource`。
2. **自然搜索量**：`channel-performance` 中 channel 匹配 `/organic/i` 的 sessions。
3. **国家 → 战略市场**（看板分组）：
   - 西非：Nigeria, Ghana, Senegal, Ivory Coast, Côte d'Ivoire, Benin, Togo, Mali
   - 东非：Kenya, Tanzania, Uganda, Ethiopia, Rwanda
   - 中东：UAE, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain
   - 东南亚：Singapore, Malaysia, Indonesia, Thailand, Vietnam, Philippines
   - 其余 →「其他」
4. **设备 / 新老客**：`geo-devices.items`、`geo-new-vs-returning.items`（窗口）。
5. **AI 引荐窗口 Top**：`ai-referrals.items`（可分析口径）。
6. **全量语种 PV**：`vercel-baseline.locales`；**询盘语种**：`leads stats.byLocale`。

### 按日叙事

7. **渠道 sessions 日趋势（L2）**：`channel-performance.daily.sessions` — 取 Top5 channel，按 `date` 透视（与看板 `channelSessionsDailyPivot` 同逻辑）。
8. **AI 引荐合计日趋势（L2）**：`ai-referrals.daily` — 按日 sum `sessions`（全来源合计折线）。
9. **全量 PV 日趋势（L1，可选）**：`vercel-baseline.daily` — 与渠道对比时**禁止相减**，仅并列叙述。

## 输出模板

```markdown
## 获客（近 {N} 天）

### 读数口径
- 同步窗：GA4 {meta.syncWindows.ga4}；`periodLinkage.relation` = {narrower|wider|aligned}
- 【随所选周期】= 日趋势、询盘语种；【同步窗 Top】= 渠道/国家/设备/AI 来源排名；【累计】= `vercel-baseline.locales` 全量 PV 语种

### 按日叙事【随所选周期】
- Top 渠道 sessions：{Organic/Direct/…} {升/降}；AI 引荐合计 {n} sessions/期
- 与上期对比：{简述}

### 渠道表现【同步窗 Top】
| 渠道 | 可分析访问 | 询盘 | 转化率 | 备注 |
|------|------------|------|--------|------|
| … | … | … | … | GA4 渠道询盘为同步窗；UTM/库询盘随周期 |

### 目标市场【同步窗 Top】
| 市场 | Sessions |
|------|----------|
...

### 语种【随所选周期 + 累计】
| 语种 | 询盘【周期】 | 全量 PV【累计】 |
|------|--------------|-----------------|
...

### AI 引荐【同步窗 Top】
- 合计 sessions：{n}；Top 来源：{source}（日折线见【随所选周期】`ai-referrals.daily`）

### 建议
1. {高流量低询盘语种 → 检查 CTA/译稿}
2. {Organic 下滑 → 转 SEO workflow}
```

## 灵活偏离

- 单渠道深挖：`channel-performance` 筛一行 + `leads list --source` 模糊匹配落地页。
- 全量引荐来源：用 `vercel-baseline.referrers`，与 GA4 渠道**不可直接对比数值**。
- 渠道日下钻：`channels --days N` 的 `daily` 含更多 channel 行。
