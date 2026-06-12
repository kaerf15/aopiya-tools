# 独立站页面目录（分析用）

本文档列出 [www.aopiya.com](https://www.aopiya.com) 独立站**全部用户可见前台页面**，供全站内容分析、页面级 SEO/GEO 审计、转化诊断时使用。

分析时通常组合三种信息源：

1. **CLI 指标**（流量、询盘、GSC）——见 `metrics.md`
2. **CLI 内容**（CMS 正文、SEO 字段）——`aopiya content list/get`
3. **线上页面**（实际 HTML 中的 title、H1、CTA、Schema）——抓取 URL 解析

## 多语言 URL 规则

| 项 | 规则 |
|------|------|
| 语种 | `en`（默认）、`fr`、`ar`、`es`、`pt`、`id`、`it`、`th`、`vi` |
| 英文 | **无前缀**，如 `/products/foo` |
| 其他语种 | **带前缀**，如 `/fr/products/foo`、`/ar/contact` |
| 归并分析 | 去掉语种前缀后按逻辑路径聚合（见 `metrics.md`） |

示例：`/products/susen-tote` 与 `/fr/products/susen-tote` 是同一商品的不同语种版本。

## page_type 与路径

埋点与分析命令中的 `page_type` 由路径推断：

| page_type | 逻辑路径 | 说明 |
|-----------|----------|------|
| `home` | `/` | 首页 |
| `solution` | `/solutions` | 三种合作模式（agency / wholesale / oem） |
| `about` | `/about` | 公司介绍 |
| `contact` | `/contact` | B2B 询盘表单主入口 |
| `product` | `/products`、`/products/[slug]` | 产品列表与详情 |
| `brand` | `/brands`、`/brands/[slug]` | 品牌索引与单品牌页 |
| `article` | `/news`、`/news/[slug]` | 博客列表与文章详情 |
| `other` | `/faq`、`/thanks`、法务页等 | FAQ、成功页、政策页 |

## 静态页面（CMS `page` 类型）

每个 slug 对应一条 `page` 内容行，各 locale 独立发布。

| 逻辑路径 | page_type | CMS slug | 用途 |
|----------|-----------|----------|------|
| `/` | home | `home` | 品牌叙事、精选内容、主 CTA |
| `/about` | about | `about` | 公司背景、愿景使命 |
| `/brands` | brand | `brands` | 三品牌索引（SUSEN / CHRISBELLA / BAGCO） |
| `/products` | product | `products` | 产品列表（支持 `?brand=&category=` 筛选） |
| `/news` | article | `news` | 博客 + 视频聚合索引 |
| `/solutions` | solution | `solutions` | Agency / Wholesale / OEM 合作说明 |
| `/faq` | other | `faq` | 常见问题（聚合 `faq_item`） |
| `/contact` | contact | `contact` | 询盘表单（依赖 `site_settings` 联系方式） |
| `/privacy-policy` | other | `privacy-policy` | 隐私政策 |
| `/terms-of-use` | other | `terms-of-use` | 使用条款 |
| `/cookie-policy` | other | `cookie-policy` | Cookie 政策 |

### 非 CMS 页面

| 逻辑路径 | page_type | 说明 |
|----------|-----------|------|
| `/thanks` | other | 询盘提交成功页；`noindex`，漏斗终点（`confirm_lead`） |

## 动态页面（按 slug 展开）

| 逻辑路径 | page_type | CMS 类型 | 说明 |
|----------|-----------|----------|------|
| `/products/[slug]` | product | `product` | 产品详情、相关产品、询盘 CTA |
| `/news/[slug]` | article | `article` | 博客文章详情 |
| `/brands/[slug]` | brand | `brand` | 单品牌落地页；slug 仅 `susen`、`chrisbella`、`bagco` |

## 无独立 URL 的内容类型

这些内容计入全站内容分析，但没有单独详情页：

| CMS 类型 | 前台展示 | 分析时注意 |
|----------|----------|------------|
| `video` | `/news` 列表 + `#video` 锚点 | 无 `/news/[slug]`，外链播放 |
| `faq_item` | 聚合在 `/faq` | 无 `/faq/[slug]` |
| `site_settings` | 注入各页（电话、邮箱、WhatsApp 等） | 非独立页面，影响全站转化触点 |
| `commercial_page` | **当前无前台路由** | schema 存在，analytics 预留 `/commercial/*` |

## 转化漏斗相关页面

| 步骤 | 页面 | 说明 |
|------|------|------|
| 深度浏览 | `/products/*`、`/brands/*`、`/solutions`、`/about`、`/news/*` | 高意向行为 |
| 表单开始 | `/contact` | 事件 `form_start` |
| 表单提交 | `/contact` | 事件 `form_submit` |
| 有效询盘 | 询盘库 | **主指标**，不受 Cookie 影响 |
| 感谢页确认 | `/thanks` | 事件 `confirm_lead` |

全站浮动联系栏（WhatsApp 等）在所有营销页可用，见 `aopiya analytics touchpoints`。

## 枚举全部可分析 URL

### 1. CMS 内容清单（正文 + SEO 字段）

```bash
# 静态页
aopiya content list page --status published
aopiya content list page --status published --locale fr

# 动态内容（逐类型拉全量）
aopiya content list product --status published
aopiya content list article --status published
aopiya content list brand --status published
aopiya content list video --status published
aopiya content list faq_item --status published

# 单条详情（含 data、seo）
aopiya content get product <id>
```

同一 slug 在不同 locale 是**独立内容行**；全站分析需按 locale 分别列出。

### 2. 收录与 sitemap 覆盖

```bash
aopiya audit sitemap    # 应在 sitemap 中的 URL 列表
aopiya audit links      # 死链检查
```

sitemap 通常包含：`page`（除 noindex）、`brand`、`product`、`article`，以及 `/brands`、`/products`、`/news`、`/faq`。**不含** `/thanks`。

### 3. 流量表现（优先分析哪些页）

```bash
aopiya analytics pages --limit 50
aopiya analytics pages --page-type product --limit 30
aopiya analytics content-performance --limit 50
aopiya analytics gsc-pages
```

把「高流量低转化」「高展示低 CTR」「有询盘但流量低」的页面列入重点审计清单。

## 解析线上页面

CLI 给指标和 CMS 原文；线上 URL 用于核对**实际渲染**是否与 CMS 一致。

每条待审 URL：

1. `aopiya content get` 取 `seo`、`data` 作基准
2. 抓取 `https://www.aopiya.com<逻辑路径>`（非英文加语种前缀）
3. 核对 `<title>`、meta description、H1、CTA、JSON-LD、hreflang
4. 与 `aopiya analytics` / GSC 数据交叉验证

检查项详见 `methodology.md`「页面级审计清单」。

## 全站内容分析工作流

适用于「审计独立站全部内容」而不仅是看 aggregate 指标：

```bash
# 1. 拉全量已发布内容
aopiya content list page --status published
aopiya content list product --status published
aopiya content list article --status published
aopiya content list brand --status published
aopiya content list video --status published
aopiya content list faq_item --status published

# 2. 叠加表现数据，排出优先级
aopiya analytics content-performance --limit 100
aopiya analytics gsc-pages
aopiya leads stats

# 3. 技术覆盖
aopiya audit sitemap
aopiya audit run -o audit.json

# 4. 对 Top N 问题页逐条：content get + 打开线上 URL 做页面审计
```

输出建议格式（每条）：

- **页面**：URL + locale + CMS id
- **数据**：sessions / leads / GSC clicks / CTR
- **CMS 问题**：title 超长、description 缺失、译稿未本地化等
- **前端问题**：H1 重复、CTA 不可见、Schema 缺失等
- **动作**：改 CMS（`aopiya-content`）/ 改 SEO 字段 / 补内链 / 新写文章

## 后台页面（不计入分析）

| 路径 | 说明 |
|------|------|
| `/admin` | 运营仪表板，访问不计入业务 analytics |
| `/admin/*` | 内容管理、询盘、Google 同步、预览等 |

分析独立站转化与内容时**忽略** `/admin` 路径。
