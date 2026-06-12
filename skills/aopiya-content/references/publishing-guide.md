# 内容发布指南：类型、多语言、媒体、返回结构

## 内容类型与模板

| type | 用途 | templateId |
|------|------|-----------|
| `product` | 商品（SUSEN / CHRISBELLA / BAGCO） | `product` |
| `article` | 博客文章（/news 下展示） | `article` |
| `video` | 视频（/news#video） | — |
| `faq_item` | FAQ 条目 | — |
| `brand` | 品牌页 | `brand` |
| `page` | 营销页（home/about/solutions…，慎改） | 对应页面 |
| `site_settings` | 全站设置（慎改） | — |

新建 body 结构：

```json
{
  "slug": "kebab-case-slug",
  "locale": "en",
  "templateId": "product",
  "data": { "...结构用 aopiya content schema <type> 查询..." },
  "seo": { "title": "≤60字符", "description": "≤160字符", "noindex": false }
}
```

- 内容状态机：draft → review → published → archived；新建一律落为 **draft**。
- `update` 是 PATCH 语义，只传要改的字段。
- 不确定 `data` 结构时**先跑 `aopiya content schema <type>`**（返回该类型的 JSON Schema），或 `aopiya content get` 一条同类已发布内容做参照。

## 多语言发布流程（必读）

站点 9 语种：`en`（默认，URL 无前缀）+ `fr ar es pt id it th vi`（URL 带前缀，如 `/fr/products/x`）。

1. **先建英文版**：`locale: "en"`，确定 slug。
2. **再按 locale 建译稿行**：同 type + 同 slug + 不同 locale，各为独立内容行；译文由 Agent 翻译好后直接写入。
3. 各 locale 独立 publish；slug 全语种保持一致（URL 仅前缀不同）。
4. **站点不自动机翻**；各 locale 译文由 Agent 写好再发布，质量自行保证。
5. SEO 字段（title/description）也要本地化，不要留英文。

翻译质量要求：B2B 商务语气；品牌名（AOPIYA、SUSEN、CHRISBELLA、BAGCO）和产品系列名不翻译；阿拉伯语（ar）注意 RTL 语序自然。

## 媒体（图片）

- 全站图片走 Vercel Blob；`aopiya media upload <file>` 上传后返回 URL/逻辑路径，把**逻辑路径**写入 `data`（如 `/assets/products/xxx.webp`、`/media/xxx`），前台自动解析为 CDN URL。
- 商品图放 `/assets/products/*`，博客图放 `/assets/news/*`。
- 上传前压缩为 webp（≤200KB 级别），文件名用语义化 kebab-case（含品牌与品类关键词，利于 SEO）。

## 返回结构

- `get / create / update / publish / unpublish` 返回内容行：
  `{ id, type, slug, locale, status, templateId, data, seo, createdAt, updatedAt, publishedAt }`
- `list` 返回 `{ count, items: [内容行] }`
- `delete` 返回 `{ id, type, slug, deleted: true }`
- `bulk` 返回 `{ count, results: [{ type, id, slug, published, error? }] }`
- 时间均为 ISO 8601 UTC 字符串。

## SEO 写作要点（发布前自检）

- title ≤60 字符、含核心词与品牌；description ≤160 字符、含行动引导；每页唯一。
- 正文唯一 H1；FAQ/步骤/对比尽量用列表与表格（利于 AI 搜索引用）。
- 商品/文章内嵌入站内链接（相关商品、相关文章、/contact CTA）。
- 图片 alt 写清品牌 + 品类 + 特征（如 "SUSEN genuine leather tote bag black"）。
