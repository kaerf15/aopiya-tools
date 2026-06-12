# 单页审计检查清单（AOPIYA）

配合 `../workflows/page-audit.md` 使用。先由数据排出优先 URL，再按 `page_type` 勾选。

## 优先级

| 级别 | 标准 | 示例 |
|------|------|------|
| **P0** | 无法索引或无法访问 | 404、误 `noindex`、canonical 指错、robots 拦截 |
| **P1** | 明显伤 SEO/GEO/询盘 | 无 H1、首屏无 CTA、产品页无 Product Schema、移动端 CTA 难点 |
| **P2** | 重要但不阻断 | Meta 弱、alt 缺、FAQ 不足、信任信号弱 |
| **P3** | 增强项 | 文案微调、补充案例、更多内链 |

信息不足写「无法确认」，不猜测。

## 按 page_type 的检查重点

| page_type | 路径示例 | 重点 |
|-----------|----------|------|
| `home` | `/` | Organization/WebSite Schema、价值主张、三品牌入口、主 CTA、首屏 3 秒内说清业务 |
| `solution` | `/solutions` | 方案分层、适用客户、内链到产品/联系、Service 或等效结构化内容 |
| `product` | `/products/[slug]` | Product Schema、参数/MOQ/定制说明、图集 alt、FAQ、询盘 CTA、`select_item` 卡片埋点 |
| `brand` | `/brands/[slug]` | 品牌定位、产品线、代理/批发说明、内链产品 |
| `article` | `/news/[slug]` | Article Schema、H1/H2、作者/日期、可引用事实句、内链产品/方案、`article_card_click` 来源页 |
| `about` | `/about` | 年限/产能/认证等事实、Organization 一致、信任信号 |
| `contact` | `/contact` | 表单可达、`form_start`/`form_submit`、WhatsApp/电话、询盘字段完整 |
| `other` | `/faq` | FAQPage Schema、问答可独立理解、利于 AI 摘录 |

多语言：核对 `hreflang`、canonical、各 locale 译稿与 CTA（规则见 `metrics.md`）。

## SEO

- Title：唯一、含核心词+品牌，约 ≤60 字符
- Meta description：价值主张 + 行动暗示，约 ≤160 字符
- H1 唯一；H2/H3 层级清晰
- 图片 alt 描述性
- 内链：相关产品/品牌/文章/联系/FAQ
- canonical、sitemap（`aopiya audit sitemap`）、非误 `noindex`

## GEO / AI 摘录

- 前 30% 有**直接答案**或 50–70 字摘要
- H2/H3 可用自然语言问句
- 列表/表格/步骤/FAQ；避免空泛形容词，用数字、年限、产能、认证
- FAQ 每条可独立理解
- 品牌/产品名与 Schema、正文一致
- 与 `aopiya analytics ai-referrals` 对照：被引多的页面结构可复制

## 转化（B2B 询盘）

- 主 CTA 首屏可见（`Get a Quote` / 联系类文案，非含糊 `Submit`）
- 表单 ≤2 次点击可达；浮动询盘/WhatsApp 不挡正文
- 移动端 CTA 易点（约 44×44px 触控区）
- 提交后 `/thanks` 与 `confirm_lead` 事件

## 埋点对照（本站 GA4 事件）

审计时确认页面类型对应事件是否可触发：

| 场景 | 事件名 |
|------|--------|
| 页面浏览 | `page_view` + `view_*`（按 page_type） |
| 商品卡片 | `select_item` |
| 博客/视频卡片 | `article_card_click` / `video_card_click` |
| CTA | `cta_click` |
| WhatsApp / 电话 / 邮件 | `whatsapp_click` / `phone_click` / `email_click` |
| 表单 | `form_start` → `form_submit` → `generate_lead` |
| 感谢页 | `confirm_lead` |
| 滚动 | `scroll_depth`（75% 等） |
| 语言切换 | `language_switch` |

高流量页若缺关键事件或 Cookie 同意率低，在报告中单独标注（见 `coverage`）。

## 技术项（站点级）

单页无法全判时跑：

```bash
aopiya audit run
aopiya audit sitemap
aopiya audit links
```

Core Web Vitals 无实测数据时写「未测」，不虚构 LCP/CLS。
