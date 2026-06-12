# Workflow：获客 Tab

**业务问题**：访客从哪来？哪些市场/语种/设备值得投入？

对应看板：Admin → 分析 → **获客**。

## 数据积木

```bash
DAYS=28

aopiya analytics channel-performance --days $DAYS
aopiya analytics geo-countries --limit 20
aopiya analytics geo-devices
aopiya analytics geo-new-vs-returning
aopiya analytics ai-referrals
aopiya analytics vercel-baseline --days $DAYS
aopiya leads stats --from <周期起 ISO>
```

## 计算步骤

1. **渠道 × 转化**：`channel-performance.items` 每行含 `channel, sessions, leads, lead_cvr, leadSource`；询盘优先 GA4 渠道转化，无则用 UTM 推断渠道。
2. **自然搜索量**：`channel-performance` 中 channel 匹配 `/organic/i` 的 sessions。
3. **国家 → 战略市场**（看板分组，分析时可复用）：
   - 西非：Nigeria, Ghana, Senegal, Ivory Coast, Côte d'Ivoire, Benin, Togo, Mali
   - 东非：Kenya, Tanzania, Uganda, Ethiopia, Rwanda
   - 中东：UAE, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain
   - 东南亚：Singapore, Malaysia, Indonesia, Thailand, Vietnam, Philippines
   - 其余 →「其他」
4. **设备 / 新老客**：`geo-devices.items`、`geo-new-vs-returning.items`。
5. **AI 引荐**：`ai-referrals`（可分析口径，非「AI 提及品牌」）。
6. **全量语种 PV**：`vercel-baseline.locales`；**询盘语种**：`leads stats.byLocale`。

## 输出模板

```markdown
## 获客（近 {N} 天）

### 渠道表现
| 渠道 | 可分析访问 | 询盘 | 转化率 |
|------|------------|------|--------|
...

### 目标市场（可分析·国家聚合）
| 市场 | Sessions |
|------|----------|
...

### 全量 vs 询盘·语种
| 语种 | 全量 PV | 询盘 |
|------|---------|------|
...

### AI 引荐
- 合计 sessions：{n}；Top 来源：{source}

### 建议
1. {高流量低询盘语种 → 检查 CTA/译稿}
2. {Organic 下滑 → 转 SEO workflow}
```

## 灵活偏离

- 单渠道深挖：`channel-performance` 筛一行 + `leads list --source` 模糊匹配落地页。
- 全量引荐来源：用 `vercel-baseline.referrers`，与 GA4 渠道**不可直接对比数值**。
