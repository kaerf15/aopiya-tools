# 分析方法论：叙事逻辑、SEO & GEO、舆情与竞品

## 分析报告结构

输出报告按以下六段组织，结论先行：

1. **总览**：本期询盘、访问（双口径并列）、转化趋势 → 一句话健康度判断
2. **流量获取**：渠道结构、环比变化、异常渠道归因
3. **SEO**：GSC 点击/展示/排名、品牌词 vs 非品牌词、audit 诊断项
4. **AI 可见性（GEO）**：AI 引荐量与来源产品、被引页面
5. **内容转化**：内容×询盘归因、深度浏览、触点表现；按需附**全站内容审计**（locale 覆盖、CMS vs 线上页面差异、问题页清单，流程见 `site-pages.md`）
6. **数据健康**：双口径覆盖率、对账差异、sync 状态（异常时才展开）

每个结论给**数据 + 解读 + 建议动作**三段；优化建议落到具体 URL + CMS id，需要改 CMS 时用 `aopiya-content` Skill 执行。

## SEO 数据工作流

- GSC 词分品牌/非品牌看新客获取：`aopiya analytics gsc-queries`
- 高展示低 CTR 的词 → 改对应页 title/description
- 排名 4–10 的词 → 对应内容加强（内链、扩写、补 FAQ）
- 落地页维度：`aopiya analytics gsc-pages` 找搜索表现最好/最差的页面
- 技术项：`aopiya audit run`（全量诊断）、`aopiya audit sitemap`（收录覆盖）、`aopiya audit links`（死链）

## GEO（AI 搜索可见性）工作流

- `aopiya analytics ai-referrals` 看 AI 引荐趋势与被引页面
- 被 AI 引用多的内容结构（FAQ、清单、数据点）值得复制到新内容
- 在 ChatGPT / Perplexity 直接问采购问题（如 "best handbag manufacturer in China"），记录本站是否被引用、引用哪页

## 多语言分析工作流

- 分语种看询盘：`aopiya leads stats` 的 `byLocale`
- 分语种看流量：页面路径按语种前缀归并（规则见 metrics.md）
- 找出「流量高但询盘低」的语种 → 检查译稿质量与 CTA 本地化

## 全站内容分析工作流

适用于「审计独立站全部内容」而不只看 Top 页面：

1. `aopiya content list <type> --status published` 拉全量（`page` / `product` / `article` / `brand` / `video` / `faq_item`），按 locale 分别统计
2. `aopiya analytics content-performance`、`gsc-pages`、`leads stats` 叠表现，排出优先页
3. `aopiya audit sitemap` + `audit run` 查收录与技术项
4. 对优先页：`aopiya content get` 对照 CMS，再打开线上 URL 解析前端实态（见 `site-pages.md`）
5. 输出问题清单：缺译 locale、SEO 字段问题、高流量低转化、GSC 高展示低 CTR 等

## 页面级审计清单（逐项检查目标页）

1. **Title/Meta**：title ≤60 字符含核心词与品牌、description ≤160 字符含 CTA；每页唯一。
2. **结构**：唯一 H1 含核心词；H2/H3 层级清晰；FAQ/步骤/对比用列表与表格（利于 AI 引用）。
3. **Schema**：Organization / Product / Article / FAQPage 结构化数据完整且与可见内容一致。
4. **转化**：首屏有明确 CTA；询盘表单可达性 ≤2 次点击；WhatsApp/邮件触点可用。
5. **多语言技术项**：hreflang 成对、canonical 正确、译稿无机翻痕迹。
6. **AI 可见性**：页面有可独立引用的事实句（数据、年限、产能、认证）；关键问答有直接答案段。

## 品牌舆情与竞品分析（基本版）

依赖 Agent 自带网络检索，输出简报即可，后续迭代深度：

1. **舆情**：检索 `AOPIYA / SUSEN / CHRISBELLA / BAGCO + reviews|scam|complaints`（en + 重点市场语种）；来源优先级：B2B 平台（Alibaba / Made-in-China）> 社媒（TikTok / Instagram / YouTube）> 论坛。输出：正负面提及、来源、是否需要回应。
2. **竞品**：对标中国箱包 B2B 制造商（如检索 `handbag manufacturer china OEM` 首页结果）；对比维度：产品线、MOQ 政策、内容策略（博客频率/主题）、多语言覆盖、AI 可见性（在 ChatGPT/Perplexity 问采购问题看谁被引用）。输出：差距清单 + 可执行动作。
3. 结论与站内数据交叉验证（如竞品强势词 ↔ 我方 GSC 排名：`aopiya analytics gsc-queries`）。

## 背景知识：业务与品牌

- 公司：广州奥比亚皮具（Guangzhou Aopiya Leather Industrial），1999 年起做包袋设计制造，B2B 模式（无线上零售）。
- 三品牌分层：**SUSEN**（高端，中东/非洲/东南亚）、**CHRISBELLA**（中端时尚，百货/连锁）、**BAGCO**（性价比，量贩/电商）。
- 三种合作模式（询盘表单的 interest 字段）：`agency`（品牌代理）、`wholesale`（批发现货）、`oem`（OEM/ODM 贴牌）。
- 询盘是网站唯一转化目标；所有分析最终服务于「哪些流量/内容带来合格 B2B 询盘」。
