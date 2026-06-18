#!/usr/bin/env node
import { AopiyaApiError, AopiyaClient, DEFAULT_ANALYTICS_STATS_START_DATE, datesBeforeStatsStart } from "@aopiya/sdk";
import { Command } from "commander";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { warnPreStatsDates } from "./stats-warn.js";

const pkg = createRequire(import.meta.url)("../package.json") as { version: string };

const client = new AopiyaClient();

function printJson(data: unknown) {
  console.log(JSON.stringify(data, null, 2));
}

/** 从 --file / --data / stdin 读取 JSON body */
function readJsonInput(opts: { file?: string; data?: string }): unknown {
  let raw: string;
  if (opts.file) {
    raw = readFileSync(opts.file, "utf8");
  } else if (opts.data) {
    raw = opts.data;
  } else {
    raw = readFileSync(0, "utf8"); // stdin
  }
  try {
    return JSON.parse(raw);
  } catch {
    console.error("无法解析 JSON 输入（--file / --data / stdin）");
    process.exit(1);
  }
}

const program = new Command();
program
  .name("aopiya")
  .description("AOPIYA API CLI — Agent / 脚本调用 /api/v1")
  .version(pkg.version);

program.command("health").description("API 探活").action(async () => {
  printJson(await client.health());
});

const content = program.command("content").description("CMS 内容");

content
  .command("list")
  .argument("<type>", "article | product | video | …")
  .option("--status <status>", "draft | review | published | archived")
  .option("--locale <locale>", "en | fr | ar | es | pt | id | it | th | vi")
  .description("列出内容（可按状态/语种过滤；同 slug 各语种 status 一致）")
  .action(async (type, opts) => {
    printJson(await client.contentList(type, { status: opts.status, locale: opts.locale }));
  });

content
  .command("get")
  .argument("<type>")
  .argument("<id>")
  .description("查看内容详情")
  .action(async (type, id) => {
    printJson(await client.contentGet(type, id));
  });

content
  .command("schema")
  .argument("<type>")
  .description("查看该内容类型的 JSON Schema（data 字段结构）")
  .action(async (type) => {
    printJson(await client.contentSchema(type));
  });

content
  .command("create")
  .argument("<type>")
  .option("--file <path>", "JSON body 文件（{ slug, locale, templateId?, data, seo }）")
  .option("--data <json>", "JSON body 字符串")
  .description("创建内容（默认 draft；同 slug 已有语种时继承其状态；未给 --file/--data 时读 stdin）")
  .action(async (type, opts) => {
    printJson(await client.contentCreate(type, readJsonInput(opts)));
  });

content
  .command("update")
  .argument("<type>")
  .argument("<id>")
  .option("--file <path>", "JSON patch 文件（slug/templateId/data/seo/status 任意子集）")
  .option("--data <json>", "JSON patch 字符串")
  .description("局部更新（可只 PATCH 某语种 data/seo 译文字段；含 status 时同步全 slug 语种）")
  .action(async (type, id, opts) => {
    printJson(await client.contentPatch(type, id, readJsonInput(opts)));
  });

content
  .command("publish")
  .argument("<type>")
  .argument("<id>")
  .description("发布上线（同一 slug 全部语种同步为 published，id 通常用英文行）")
  .action(async (type, id) => {
    printJson(await client.contentPublish(type, id));
  });

content
  .command("unpublish")
  .argument("<type>")
  .argument("<id>")
  .description("下架为 draft（同一 slug 全部语种同步）")
  .action(async (type, id) => {
    printJson(await client.contentUnpublish(type, id));
  });

content
  .command("delete")
  .argument("<type>")
  .argument("<id>")
  .description("删除内容（同一 slug 全部语种，不可恢复）")
  .action(async (type, id) => {
    printJson(await client.contentDelete(type, id));
  });

content
  .command("bulk")
  .option("--file <path>", "JSON 文件：{ items: [{ type, body, publish? }] } 或数组")
  .option("--data <json>", "JSON 字符串")
  .description("批量 upsert（publish:true 对该 slug 全语种生效；未给 --file/--data 时读 stdin）")
  .action(async (opts) => {
    const input = readJsonInput(opts) as
      | { items: { type: string; body: unknown; publish?: boolean }[] }
      | { type: string; body: unknown; publish?: boolean }[];
    const items = Array.isArray(input) ? input : input.items;
    printJson(await client.contentBulk(items));
  });

const analytics = program.command("analytics").description("GA4/GSC 快照与分析");

analytics
  .command("traffic")
  .option("--days <n>", "period days", "28")
  .description("近 N 天可分析访问日序列（不含统计起点前的测试期；见 statsStartDate）")
  .action(async (opts) => {
    const data = (await client.analyticsTraffic(Number(opts.days))) as {
      statsStartDate?: string;
      data?: { date: string }[];
    };
    warnPreStatsDates("traffic", data.data, data.statsStartDate);
    printJson(data);
  });

analytics
  .command("stats-check")
  .option("--days <n>", "period days", "28")
  .description("校验 meta.statsStartDate 与 traffic 日序列是否含测试期日期")
  .action(async (opts) => {
    const days = Number(opts.days);
    const [meta, traffic] = await Promise.all([
      client.analyticsMeta(days),
      client.analyticsTraffic(days),
    ]);
    const m = meta as { statsStartDate?: string };
    const t = traffic as { statsStartDate?: string; data?: { date: string }[] };
    const start = m.statsStartDate ?? t.statsStartDate ?? DEFAULT_ANALYTICS_STATS_START_DATE;
    const preStats = datesBeforeStatsStart(t.data ?? [], start);
    printJson({
      ok:
        start === DEFAULT_ANALYTICS_STATS_START_DATE &&
        preStats.length === 0,
      expectedStatsStartDate: DEFAULT_ANALYTICS_STATS_START_DATE,
      statsStartDate: start,
      preStatsDatesInTraffic: preStats,
      trafficPeriod: (t as { period?: { start: string; end: string } }).period,
    });
  });

analytics
  .command("traffic-compare")
  .option("--days <n>", "对比窗口天数（近 N 天 vs 前 N 天）", "28")
  .description("traffic 日序列环比")
  .action(async (opts) => {
    printJson(await client.analyticsTrafficCompare(Number(opts.days)));
  });

analytics
  .command("snapshots")
  .description("各指标当前分析状态（每 source+metric 一条）")
  .option("--source <source>", "ga4 | gsc | vercel")
  .option("--metric <metric>", "traffic | pages | funnel_events | queries | …")
  .option("--limit <n>", "max rows", "20")
  .option("--no-payload", "仅元数据，不含 payload")
  .action(async (opts) => {
    printJson(
      await client.analyticsSnapshotsList({
        source: opts.source,
        metric: opts.metric,
        limit: Number(opts.limit),
        includePayload: !opts.noPayload,
      }),
    );
  });

analytics
  .command("channels")
  .option("--days <n>", "period days", "28")
  .description("渠道分布（可分析口径）")
  .action(async (opts) => {
    printJson(await client.analyticsChannels(Number(opts.days)));
  });

analytics
  .command("funnel")
  .option("--days <n>", "period days", "28")
  .description("询盘漏斗")
  .action(async (opts) => {
    printJson(await client.analyticsFunnel(Number(opts.days)));
  });

analytics
  .command("pages")
  .option("--days <n>", "period days", "28")
  .option("--page-type <type>", "article | product | commercial | geo | …")
  .option("--limit <n>", "max rows", "20")
  .description("页面访问 Top")
  .action(async (opts) => {
    printJson(
      await client.analyticsPages(Number(opts.days), {
        pageType: opts.pageType,
        limit: opts.limit ? Number(opts.limit) : undefined,
      }),
    );
  });

analytics
  .command("content-performance")
  .option("--days <n>", "period days", "28")
  .option("--limit <n>", "max rows", "20")
  .option("--page-type <type>", "article | commercial | geo | …")
  .description("内容 × 转化归因")
  .action(async (opts) => {
    printJson(
      await client.analyticsContentPerformance(Number(opts.days), Number(opts.limit), {
        pageType: opts.pageType,
      }),
    );
  });

analytics
  .command("traffic-wow")
  .option("--days <n>", "period days", "28")
  .description("访问周环比")
  .action(async (opts) => {
    printJson(await client.analyticsTrafficWow(Number(opts.days)));
  });

analytics
  .command("channel-performance")
  .option("--days <n>", "period days", "28")
  .description("渠道 × 转化表现")
  .action(async (opts) => {
    printJson(await client.analyticsChannelPerformance(Number(opts.days)));
  });

analytics
  .command("high-intent")
  .option("--days <n>", "period days", "28")
  .description("深度浏览占比（看过产品/商业/品牌/文章页的访客占比）")
  .action(async (opts) => {
    printJson(await client.analyticsHighIntent(Number(opts.days)));
  });

analytics
  .command("page-types")
  .option("--days <n>", "period days", "28")
  .description("按页面类型聚合的访问分布")
  .action(async (opts) => {
    printJson(await client.analyticsPageTypes(Number(opts.days)));
  });

analytics
  .command("content-lead-share")
  .option("--days <n>", "period days", "28")
  .description("内容带动询盘占比")
  .action(async (opts) => {
    printJson(await client.analyticsContentLeadShare(Number(opts.days)));
  });

analytics
  .command("touchpoints")
  .option("--days <n>", "period days", "28")
  .option("--limit <n>", "max rows", "20")
  .description("触点点击（CTA / WhatsApp / 卡片等）")
  .action(async (opts) => {
    printJson(
      await client.analyticsTouchpoints(Number(opts.limit), Number(opts.days)),
    );
  });

analytics
  .command("tracking-events")
  .option("--days <n>", "period days", "28")
  .option("--limit <n>", "max rows", "50")
  .description("全量 trackEvent 埋点（含 page_view / scroll_depth / 漏斗 / 触点；rows + daily）")
  .action(async (opts) => {
    printJson(
      await client.analyticsTrackingEvents(Number(opts.days), Number(opts.limit)),
    );
  });

analytics
  .command("scroll-depth")
  .option("--days <n>", "period days", "28")
  .option("--limit <n>", "max rows", "100")
  .description("scroll_depth 原始档位（25/50/75/90 × 路径；rows + daily）")
  .action(async (opts) => {
    printJson(await client.analyticsScrollDepth(Number(opts.days), Number(opts.limit)));
  });

analytics
  .command("scroll-engagement")
  .option("--days <n>", "period days", "28")
  .option("--limit <n>", "max rows", "15")
  .description("页面滚动深度")
  .action(async (opts) => {
    printJson(
      await client.analyticsScrollEngagement(Number(opts.limit), Number(opts.days)),
    );
  });

analytics
  .command("ai-referrals")
  .option("--days <n>", "period days", "28")
  .description("AI 产品引荐访问（ChatGPT / Perplexity 等）")
  .action(async (opts) => {
    printJson(await client.analyticsAiReferrals(Number(opts.days)));
  });

analytics
  .command("gsc-queries")
  .option("--days <n>", "period days", "28")
  .option("--limit <n>", "max rows", "20")
  .description("GSC 搜索词表现（items=同步窗 Top；daily 随 --days）")
  .action(async (opts) => {
    printJson(await client.searchQueries(Number(opts.limit), Number(opts.days)));
  });

analytics
  .command("gsc-pages")
  .option("--days <n>", "period days", "28")
  .option("--limit <n>", "max rows", "20")
  .description("GSC 落地页表现（items=同步窗 Top；daily 随 --days）")
  .action(async (opts) => {
    printJson(await client.searchPages(Number(opts.limit), Number(opts.days)));
  });

analytics
  .command("search-trend")
  .option("--days <n>", "period days", "28")
  .description("GSC 搜索点击/展示日趋势")
  .action(async (opts) => {
    const data = (await client.analyticsSearchTrend(Number(opts.days))) as {
      rows?: { date: string }[];
    };
    warnPreStatsDates("search-trend", data.rows);
    printJson(data);
  });

analytics
  .command("search-brand-split")
  .option("--days <n>", "period days", "28")
  .description("GSC 品牌词 vs 非品牌词（窗口汇总 + daily 随 --days）")
  .action(async (opts) => {
    printJson(await client.analyticsSearchBrandSplit(Number(opts.days)));
  });

analytics
  .command("search-keyword-breakdown")
  .option("--days <n>", "period days", "28")
  .description("GSC 搜索词类型分布（窗口汇总 + daily 随 --days）")
  .action(async (opts) => {
    printJson(await client.analyticsSearchKeywordBreakdown(Number(opts.days)));
  });

analytics
  .command("search-keyword-trend")
  .option("--days <n>", "period days", "28")
  .description("GSC 按词类型的日趋势")
  .action(async (opts) => {
    printJson(await client.analyticsSearchKeywordTrend(Number(opts.days)));
  });

analytics
  .command("geo-countries")
  .option("--days <n>", "period days", "28")
  .option("--limit <n>", "max rows", "20")
  .description("GA4 国家分布（items=同步窗 Top；daily 随 --days）")
  .action(async (opts) => {
    printJson(
      await client.analyticsGeoCountries(Number(opts.limit), Number(opts.days)),
    );
  });

analytics
  .command("geo-devices")
  .option("--days <n>", "period days", "28")
  .description("GA4 设备分布（同步窗 Top）")
  .action(async (opts) => {
    printJson(await client.analyticsGeoDevices(Number(opts.days)));
  });

analytics
  .command("geo-new-vs-returning")
  .option("--days <n>", "period days", "28")
  .description("GA4 新老访客（同步窗 Top）")
  .action(async (opts) => {
    printJson(await client.analyticsGeoNewVsReturning(Number(opts.days)));
  });

analytics
  .command("vercel-baseline")
  .option("--days <n>", "period days", "28")
  .description("Vercel 全量 PV、日趋势、Top 路径/来源/国家/语种")
  .action(async (opts) => {
    const data = (await client.analyticsVercelBaseline(Number(opts.days))) as {
      daily?: { date: string }[];
    };
    warnPreStatsDates("vercel-baseline", data.daily);
    printJson(data);
  });

analytics
  .command("coverage")
  .option("--days <n>", "period days", "28")
  .description("全量 vs 可分析覆盖占比（日期重叠窗口）")
  .action(async (opts) => {
    printJson(await client.analyticsCoverage(Number(opts.days)));
  });

analytics
  .command("meta")
  .option("--days <n>", "period days", "28")
  .description("看板元信息：statsStartDate、syncWindows、periodLinkage、数据模式与新鲜度")
  .action(async (opts) => {
    const data = (await client.analyticsMeta(Number(opts.days))) as {
      statsStartDate?: string;
    };
    if (data.statsStartDate && data.statsStartDate !== DEFAULT_ANALYTICS_STATS_START_DATE) {
      console.error(
        JSON.stringify(
          {
            warning: `statsStartDate=${data.statsStartDate}，预期 ${DEFAULT_ANALYTICS_STATS_START_DATE}`,
            hint: "在 Vercel 设置 ANALYTICS_STATS_START_DATE=2026-06-13 并重新部署",
          },
          null,
          2,
        ),
      );
    }
    printJson(data);
  });

analytics
  .command("reconcile")
  .option("--days <n>", "period days", "28")
  .description("GA4 事件 vs 询盘库对账")
  .action(async (opts) => {
    printJson(await client.analyticsReconcile(Number(opts.days)));
  });

analytics
  .command("sync")
  .option("--days <n>", "period days", "28")
  .description("拉取 GA4/GSC 写入 analytics_snapshots")
  .action(async (opts) => {
    printJson(await client.analyticsSync(Number(opts.days)));
  });

const leads = program.command("leads").description("询盘");

leads
  .command("list")
  .option("--source <page>", "source_page 模糊匹配")
  .option("--from <iso>", "created_at 起（ISO，不早于统计起点）")
  .option("--to <iso>", "created_at 止（ISO）")
  .description("询盘明细（不含统计起点 2026-06-13 前的记录）")
  .action(async (opts) => {
    printJson(
      await client.leadsList({
        sourcePage: opts.source,
        from: opts.from,
        to: opts.to,
      }),
    );
  });

leads
  .command("get")
  .argument("<id>", "lead id")
  .description("询盘单条详情")
  .action(async (id) => {
    printJson(await client.leadGet(id));
  });

leads
  .command("stats")
  .option("--from <iso>")
  .option("--to <iso>")
  .description("询盘聚合统计（--from/--to 周期；无则全历史累计）")
  .action(async (opts) => {
    printJson(await client.leadsStats({ from: opts.from, to: opts.to }));
  });

leads
  .command("stats-daily")
  .option("--days <n>", "period days", "28")
  .description("有效询盘按日（随所选周期；列表不含统计起点前测试询盘）")
  .action(async (opts) => {
    const data = (await client.leadsStatsDaily(Number(opts.days))) as {
      daily?: { date: string }[];
    };
    warnPreStatsDates("leads stats-daily", data.daily);
    printJson(data);
  });

leads
  .command("export")
  .option("--source <page>")
  .option("--from <iso>")
  .option("--to <iso>")
  .description("导出询盘 CSV（输出到 stdout）")
  .action(async (opts) => {
    console.log(
      await client.leadsExport({
        sourcePage: opts.source,
        from: opts.from,
        to: opts.to,
      }),
    );
  });

const audit = program.command("audit").description("站点 SEO/健康诊断");

audit
  .command("run")
  .option("-o, --output <file>", "写入 JSON 报告")
  .description("执行站点诊断（耗时较长）")
  .action(async (opts) => {
    const report = await client.auditRun();
    if (opts.output) {
      writeFileSync(opts.output, JSON.stringify(report, null, 2));
      console.error(`Wrote ${opts.output}`);
    } else {
      printJson(report);
    }
  });

audit
  .command("runs")
  .option("--limit <n>", "max rows", "20")
  .description("诊断历史列表")
  .action(async (opts) => {
    printJson(await client.auditRuns(Number(opts.limit)));
  });

audit
  .command("get")
  .argument("<id>", "audit run id")
  .description("查看单次诊断报告")
  .action(async (id) => {
    printJson(await client.auditRunGet(id));
  });

audit
  .command("sitemap")
  .description("sitemap 覆盖与一致性检查")
  .action(async () => {
    printJson(await client.auditSitemap());
  });

audit
  .command("links")
  .description("站内链接健康检查（死链等）")
  .action(async () => {
    printJson(await client.auditLinks());
  });

const media = program.command("media").description("媒体库");

media
  .command("list")
  .option("--limit <n>", "max items", "100")
  .description("媒体库列表")
  .action(async (opts) => {
    printJson(await client.mediaList(Number(opts.limit)));
  });

media
  .command("upload")
  .argument("<file>", "本地文件路径")
  .description("上传图片到媒体库（Vercel Blob）")
  .action(async (file) => {
    printJson(await client.mediaUploadFile(file));
  });

media
  .command("register")
  .argument("<filename>")
  .argument("<url>")
  .description("登记外部 URL")
  .action(async (filename, url) => {
    printJson(await client.mediaRegisterUrl({ filename, url }));
  });

program.parseAsync().catch((err: unknown) => {
  // 统一错误出口：stderr 输出结构化 JSON，退出码 1，便于 Agent / 脚本解析
  if (err instanceof AopiyaApiError) {
    console.error(JSON.stringify({ error: err.message, status: err.status, body: err.body }, null, 2));
  } else if (err instanceof Error) {
    const cause = err.cause instanceof Error ? err.cause.message : undefined;
    const isTimeout = err.name === "TimeoutError" || err.name === "AbortError";
    console.error(
      JSON.stringify(
        {
          error: isTimeout ? `请求超时（可用 AOPIYA_API_TIMEOUT_MS 调大）` : err.message,
          ...(cause ? { cause } : {}),
          hint: "检查 AOPIYA_API_BASE / AOPIYA_API_KEY 与网络连通性",
        },
        null,
        2,
      ),
    );
  } else {
    console.error(JSON.stringify({ error: String(err) }));
  }
  process.exit(1);
});
