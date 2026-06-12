# Workflow：单页 SEO / GEO / 转化审计

**数据定优先级 → 打开 URL → 对照 CMS → 输出可执行改法**。

检查项详见 `../references/page-audit-checklist.md`；路由与 CMS 映射见 `../references/site-pages.md`。

## 何时跑

| 触发 | 示例 |
|------|------|
| 用户指定 URL | 「审计 /products/xxx」 |
| SEO 工作流后续 | 高展示低点击词对应落地页（`seo.md`） |
| 内容工作流后续 | 高浏览低询盘（`content.md`） |
| 全站内容审计 | `site-pages.md` 优先页清单逐条 |

## 输入

| 项 | 必需 | 来源 |
|----|------|------|
| 页面 URL 或逻辑路径 | 是 | 用户或数据表 |
| `page_type` | 推荐 | 路径推断（`metrics.md`） |
| 目标词/意图 | 可选 | 用户或 GSC `query` |
| 表现数据 | 推荐 | 下方 CLI |

## 步骤 1：拉数据（定优先级）

单页或批量前排优先序：

```bash
# 单页：GSC 落地与词
aopiya analytics gsc-pages --limit 50
aopiya analytics gsc-queries --limit 100

# 单页：可分析行为 + 询盘
aopiya analytics pages --days 28 --limit 50
aopiya analytics content-performance --days 28 --limit 30
aopiya leads stats --from <28天前 ISO>

# 可选：AI 引荐、技术项
aopiya analytics ai-referrals
aopiya audit sitemap
```

**优先审计**（任一条命中即可）：

- GSC：高 `impressions` 低 `clicks` 或 `position` 4–15
- GA4：高 `sessions`/`views` 低 `leads` 或低 `lead_cvr`
- 询盘：`bySourcePage` 有量或应承接却无量的路径
- 用户点名或新发布/大改版页

## 步骤 2：CMS 基准

```bash
# 按语种找 id（第二参数是 id，不是 slug）
aopiya content list <type> --status published --locale <en|fr|...>
aopiya content get <type> <id>
```

记录：`id`、`slug`、`seo` 字段、`data` 正文要点。无 CMS 条目的静态页仍抓线上核对。

## 步骤 3：抓取线上页面

`https://www.aopiya.com<路径>`（非 `en` 加语种前缀，见 `site-pages.md`）。

核对：`title`、meta description、H1/H2、CTA、JSON-LD、hreflang、首屏移动端（如能截图）。

## 步骤 4：按清单打分

打开 `page-audit-checklist.md`，按 `page_type` 勾 SEO、GEO、转化、埋点；标 P0–P3。

将 **步骤 1 数据**写入解读，例如：

- 「GSC 展示 1200、CTR 0.8%」→ 优先改 title/meta  
- 「_sessions 800、询盘 0_」→ 优先改 CTA/表单/信任信号  

## 步骤 5：输出报告

```markdown
# 页面审计报告

- **URL**：
- **page_type**：
- **CMS**：`{type}` / `{slug}` / `id={id}` / locale=
- **目标词**：（来自 GSC 或用户）
- **数据摘要**：GSC clicks/impressions/position；sessions/views；leads；ai-referrals（如有）
- **检查时间**：

## 总体评价（2–4 句）

## 优先级问题

| 优先级 | 问题 | 影响 | 建议 |
|--------|------|------|------|
| P0/P1/… | | SEO/GEO/转化/埋点 | 具体改法 |

## SEO

## GEO / AI 摘录

## 布局与转化

## 埋点与数据

## 建议修改示例

（Title / Meta / H1 / FAQ 片段 / CTA 文案 — 仅在有把握时给）

## 后续动作

- [ ] 输出改稿清单（`type`、`id`、`locale`、字段、建议值）
- [ ] 内链自 {某页} 链入
- [ ] 复测 GSC/转化（周期后）
```

## 批量审计

1. `aopiya content list <type> --status published` + `content-performance` / `gsc-pages` 交集取 Top N  
2. 每条重复步骤 2–5，输出**问题清单表**（URL、CMS id、P0/P1 数、一条主建议）  
3. 全站技术项一次 `audit run`，不单页重复  

## 灵活偏离

- **只有 URL、无数据**：仍做步骤 3–4，数据摘要写「未拉取」，建议标「待数据验证」  
- **只审 SEO**：只做 SEO + GEO 节，跳过埋点细项  
- **多 locale**：每个 locale 一条报告或合并表（缺译 locale 标 P1）
