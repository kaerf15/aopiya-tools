---
name: aopiya-content
description: >-
  AOPIYA 独立站（www.aopiya.com）内容管理：通过 aopiya CLI 完成商品、文章、视频、FAQ 等
  创建、修改、翻译、发布、下架与媒体上传。
  触发词：发布商品、上新、写文章、发博客、上视频、改内容、内容翻译、下架、删除内容、
  上传图片、media upload、content create/publish。
---

# AOPIYA 独立站内容管理

通过 **`aopiya` CLI** 管理 [www.aopiya.com](https://www.aopiya.com) 独立站的 CMS 内容：商品、文章、视频、FAQ、媒体等。

> **唯一操作入口**：只用 `aopiya` 命令。

## 参考文档（本 Skill 目录，按需读）

| 文档 | 何时读 |
|------|--------|
| `references/publishing-guide.md` | **创建/翻译/发布前必读**：内容类型与 body 结构、多语言流程、媒体规范、SEO 要点 |

## 前置

假定 `aopiya` CLI 已配置并就绪；`aopiya health` 返回 JSON 即可动手。

所有输出均为 JSON；错误输出 `{ error, status?, hint? }` 到 stderr，退出码 1。

## 命令速查

| 场景 | 命令 |
|------|------|
| 列内容 | `aopiya content list <type> [--status published] [--locale fr]` |
| 看详情 | `aopiya content get <type> <id>` |
| 看 data 字段结构 | `aopiya content schema <type>` |
| 新建（默认 draft） | `aopiya content create <type> --file body.json` |
| 局部更新 | `aopiya content update <type> <id> --file patch.json` |
| 发布 / 下架 | `aopiya content publish <type> <id>` / `aopiya content unpublish <type> <id>` |
| 删除（不可恢复） | `aopiya content delete <type> <id>` |
| 批量 upsert | `aopiya content bulk --file items.json` |
| 媒体列表 / 上传 / 登记外链 | `aopiya media list` / `aopiya media upload <本地文件>` / `aopiya media register <filename> <url>` |

`--file` 也可换成 `--data '<json>'` 或 stdin 管道。

内容类型：`product`、`article`、`video`、`faq_item`、`brand`、`page`（慎改）、`site_settings`（慎改）。

## 典型工作流

### 上新商品（含多语言）

```bash
aopiya content schema product                 # 1. 看结构
aopiya media upload ./susen-tote-01.webp      # 2. 传图
aopiya content create product --file en.json  # 3. 英文 draft
aopiya content publish product <id>           # 4. 校对后发布
# 5. 逐 locale 翻译并 create + publish（slug 不变，locale 改）
```

### 发布博客文章

```bash
aopiya content list article --status published   # 参考已有结构
aopiya content create article --file article-en.json
aopiya content publish article <id>
```

### 批量多语言发布

```bash
# items.json: { "items": [ { "type": "article", "body": {...locale: fr...}, "publish": true }, ... ] }
aopiya content bulk --file items.json
```

多语言流程、body 结构、媒体规范见 `references/publishing-guide.md`。

**时间字段**：`createdAt` / `updatedAt` / `publishedAt` 均为北京时间 ISO（`+08:00`），与 Admin 看板一致。

## 权限

| 操作 | 所需 scope |
|------|-----------|
| list / get | `content:read` |
| schema | 无需 auth（公开） |
| create / update / delete / bulk | `content:write` |
| publish / unpublish | `content:publish` |
| media list / upload / register | `media:read` / `media:write` |

返回 403 时说明当前凭证权限不足，需使用具备内容写权限的完整凭证。

## 禁止

- 未经用户确认就 `content delete` 或改动 `page` / `site_settings`
- 跳过 draft 直接构造 published；发布保持显式 `publish` 命令
