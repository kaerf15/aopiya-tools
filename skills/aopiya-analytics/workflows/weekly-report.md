# Workflow：周报（编排全 Tab）

**周期**：默认近 **7 天**或近 **28 天**（与团队周会一致即可）。

## 执行顺序

```bash
# 0. 健康与新鲜度
aopiya analytics meta --days 28
aopiya analytics snapshots --metric traffic --source ga4 --limit 1 --no-payload

# 1. 总览 → overview.md
aopiya analytics traffic --days 28
aopiya analytics traffic-wow
aopiya analytics funnel --days 28
aopiya analytics coverage --days 28
aopiya leads stats --from <28天前 ISO>

# 2. 获客 → acquisition.md（摘 Top3 渠道 + 市场）
aopiya analytics channel-performance --days 28

# 3. SEO → seo.md（趋势 + 品牌占比一句）
aopiya analytics search-trend --days 28
aopiya analytics search-brand-split

# 4. 内容 → content.md（Top5 内容×询盘）
aopiya analytics content-performance --days 28 --limit 10

# 5. GEO → geo.md（有则写）
aopiya analytics ai-referrals

# 6. 有异常再展开 health.md
aopiya analytics reconcile --days 28
```

若 `createdAt` 过期：先 `aopiya analytics sync --days 28`，再继续（勿高频）。

## 输出模板（methodology 六段压缩版）

```markdown
# AOPIYA 独立站周报（{date_range}）

## 1. 总览
{overview 模板摘要 + 一句话健康度}

## 2. 流量获取
{渠道 Top + 环比 + 市场/语种 1 条洞察}

## 3. SEO
{GSC 点击/展示趋势 + 品牌占比 + 1 个机会词}

## 4. AI 可见性
{ai-referrals 或「暂无」}

## 5. 内容转化
{content-performance Top + 1 条可执行优化 URL}

## 6. 数据健康（仅异常）
{覆盖率低 / 对账差 / 未 sync 时写；否则省略}

---
**下周优先动作**（≤3 条，带 URL 或 CMS slug）
1. ...
```

## 灵活偏离

- **短周**：所有 `--days 28` 改 `7`；`traffic-wow` 仍为 7vs7。
- **只要业务段**：保留 §1§5，其余缩为 bullet。
- **深度版**：各段链接到对应 Tab workflow 全文，不重复计算。
- **要舆情/竞品或内外综合**：本文件只覆盖站内；可将各节要点整理为「经营数据摘要」供后续交叉验证使用。
