export type AopiyaClientOptions = {
  baseUrl?: string;
  apiKey?: string;
  /** 单次请求超时毫秒，默认 120000；也可用 AOPIYA_API_TIMEOUT_MS 覆盖 */
  timeoutMs?: number;
};

export class AopiyaApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "AopiyaApiError";
    this.status = status;
    this.body = body;
  }
}

export class AopiyaClient {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly timeoutMs: number;

  constructor(options: AopiyaClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? process.env.AOPIYA_API_BASE ?? "https://www.aopiya.com/api/v1").replace(
      /\/$/,
      "",
    );
    this.apiKey = options.apiKey ?? process.env.AOPIYA_API_KEY ?? "";
    const envTimeout = Number(process.env.AOPIYA_API_TIMEOUT_MS);
    this.timeoutMs =
      options.timeoutMs ?? (Number.isFinite(envTimeout) && envTimeout > 0 ? envTimeout : 120_000);
  }

  async request<T = unknown>(path: string, init?: RequestInit & { auth?: boolean }): Promise<T> {
    const auth = init?.auth !== false;
    const headers: Record<string, string> = {
      ...(init?.headers as Record<string, string>),
    };
    if (auth && this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }
    const isFormData =
      typeof FormData !== "undefined" && init?.body instanceof FormData;
    if (init?.body && !headers["Content-Type"] && !isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
      signal: init?.signal ?? AbortSignal.timeout(this.timeoutMs),
    });

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      const errMsg =
        typeof data === "object" && data && "error" in data
          ? String((data as { error: unknown }).error)
          : res.statusText;
      throw new AopiyaApiError(errMsg, res.status, data);
    }

    return data as T;
  }

  async requestText(path: string, init?: RequestInit): Promise<string> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...(init?.headers as Record<string, string>),
      },
      signal: init?.signal ?? AbortSignal.timeout(this.timeoutMs),
    });
    const text = await res.text();
    if (!res.ok) throw new AopiyaApiError(text || res.statusText, res.status, text);
    return text;
  }

  health() {
    return this.request("/health", { auth: false });
  }

  contentList(type: string, query?: { status?: string; locale?: string }) {
    const q = new URLSearchParams();
    if (query?.status) q.set("status", query.status);
    if (query?.locale) q.set("locale", query.locale);
    const suffix = q.toString() ? `?${q}` : "";
    return this.request(`/content/${type}${suffix}`);
  }

  contentGet(type: string, id: string) {
    return this.request(`/content/${type}/${id}`);
  }

  /** 新建内容行；同 slug 已有语种时继承其 status / publishedAt */
  contentCreate(type: string, body: unknown) {
    return this.request(`/content/${type}`, { method: "POST", body: JSON.stringify(body) });
  }

  /** 局部更新（可只 PATCH 某 locale 的 data/seo 译文字段）；body 含 status 时同步该 slug 全部语种 */
  contentPatch(type: string, id: string, body: unknown) {
    return this.request(`/content/${type}/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  }

  /** 发布：同一 slug 的全部语种行同步为 published（id 通常传英文行） */
  contentPublish(type: string, id: string) {
    return this.request(`/content/${type}/${id}/publish`, { method: "POST" });
  }

  /** 下线：同一 slug 的全部语种行同步为 draft */
  contentUnpublish(type: string, id: string) {
    return this.request(`/content/${type}/${id}/unpublish`, { method: "POST" });
  }

  /** 删除：同一 slug 的全部语种行（id 通常传英文行，不可恢复） */
  contentDelete(type: string, id: string) {
    return this.request(`/content/${type}/${id}`, { method: "DELETE" });
  }

  /** 批量 upsert；publish:true 时对该条 slug 全部已有语种同步 published */
  contentBulk(items: { type: string; body: unknown; publish?: boolean }[]) {
    return this.request("/content/bulk", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  }

  contentSchema(type: string) {
    return this.request(`/content/schema/${type}`, { auth: false });
  }

  leadsList(query?: { sourcePage?: string; from?: string; to?: string }) {
    const q = new URLSearchParams();
    if (query?.sourcePage) q.set("sourcePage", query.sourcePage);
    if (query?.from) q.set("from", query.from);
    if (query?.to) q.set("to", query.to);
    const suffix = q.toString() ? `?${q}` : "";
    return this.request(`/leads${suffix}`);
  }

  leadsExport(query?: { sourcePage?: string; from?: string; to?: string }) {
    const q = new URLSearchParams();
    if (query?.sourcePage) q.set("sourcePage", query.sourcePage);
    if (query?.from) q.set("from", query.from);
    if (query?.to) q.set("to", query.to);
    const suffix = q.toString() ? `?${q}` : "";
    return this.requestText(`/leads/export${suffix}`);
  }

  leadsStats(query?: { from?: string; to?: string }) {
    const q = new URLSearchParams();
    if (query?.from) q.set("from", query.from);
    if (query?.to) q.set("to", query.to);
    const suffix = q.toString() ? `?${q}` : "";
    return this.request(`/leads/stats${suffix}`);
  }

  leadsStatsDaily(periodDays = 28) {
    return this.request(`/leads/stats/daily?periodDays=${periodDays}`);
  }

  leadGet(id: string) {
    return this.request(`/leads/${id}`);
  }

  submitLead(body: unknown) {
    return this.request("/leads", { method: "POST", body: JSON.stringify(body), auth: false });
  }

  analyticsTraffic(periodDays = 28) {
    return this.request(`/analytics/traffic?periodDays=${periodDays}`);
  }

  analyticsChannels(periodDays = 28) {
    return this.request(`/analytics/channels?periodDays=${periodDays}`);
  }

  analyticsFunnel(periodDays = 28) {
    return this.request(`/analytics/funnel?periodDays=${periodDays}`);
  }

  analyticsPages(periodDays = 28, query?: { pageType?: string; limit?: number }) {
    const q = new URLSearchParams({ periodDays: String(periodDays) });
    if (query?.pageType) q.set("pageType", query.pageType);
    if (query?.limit) q.set("limit", String(query.limit));
    return this.request(`/analytics/pages?${q}`);
  }

  analyticsContentPerformance(
    periodDays = 28,
    limit = 20,
    query?: { pageType?: string },
  ) {
    const q = new URLSearchParams({
      periodDays: String(periodDays),
      limit: String(limit),
    });
    if (query?.pageType) q.set("pageType", query.pageType);
    return this.request(`/analytics/content-performance?${q}`);
  }

  analyticsTrafficWow(periodDays = 28) {
    return this.request(`/analytics/traffic/wow?periodDays=${periodDays}`);
  }

  analyticsHighIntent(periodDays = 28) {
    return this.request(`/analytics/high-intent?periodDays=${periodDays}`);
  }

  analyticsPageTypes(periodDays = 28) {
    return this.request(`/analytics/page-types?periodDays=${periodDays}`);
  }

  analyticsChannelPerformance(periodDays = 28) {
    return this.request(`/analytics/channels/performance?periodDays=${periodDays}`);
  }

  analyticsTouchpoints(limit = 20, periodDays = 28) {
    return this.request(
      `/analytics/touchpoints?limit=${limit}&periodDays=${periodDays}`,
    );
  }

  analyticsScrollEngagement(limit = 15, periodDays = 28) {
    return this.request(
      `/analytics/scroll-engagement?limit=${limit}&periodDays=${periodDays}`,
    );
  }

  analyticsAiReferrals(periodDays = 28) {
    return this.request(`/analytics/ai-referrals?periodDays=${periodDays}`);
  }

  analyticsContentLeadShare(periodDays = 28) {
    return this.request(`/analytics/content-lead-share?periodDays=${periodDays}`);
  }

  analyticsReconcile(periodDays = 28) {
    return this.request(`/analytics/reconcile?periodDays=${periodDays}`);
  }

  analyticsSync(periodDays = 28) {
    return this.request(`/analytics/sync?periodDays=${periodDays}`, { method: "POST" });
  }

  analyticsSnapshotsList(query?: {
    source?: string;
    metric?: string;
    limit?: number;
    includePayload?: boolean;
  }) {
    const q = new URLSearchParams();
    if (query?.source) q.set("source", query.source);
    if (query?.metric) q.set("metric", query.metric);
    if (query?.limit) q.set("limit", String(query.limit));
    if (query?.includePayload === false) q.set("includePayload", "false");
    const suffix = q.toString() ? `?${q}` : "";
    return this.request(`/analytics/snapshots${suffix}`);
  }

  /** 近 N 天 vs 前 N 天（同一日序列内环比） */
  analyticsTrafficCompare(periodDays = 28) {
    return this.request(`/analytics/traffic/compare?periodDays=${periodDays}`);
  }

  searchQueries(limit = 20, periodDays = 28) {
    return this.request(
      `/analytics/search/queries?limit=${limit}&periodDays=${periodDays}`,
    );
  }

  searchPages(limit = 20, periodDays = 28) {
    return this.request(
      `/analytics/search/pages?limit=${limit}&periodDays=${periodDays}`,
    );
  }

  analyticsSearchTrend(periodDays = 28) {
    return this.request(`/analytics/search/trend?periodDays=${periodDays}`);
  }

  analyticsSearchBrandSplit(periodDays = 28) {
    return this.request(`/analytics/search/brand-split?periodDays=${periodDays}`);
  }

  analyticsSearchKeywordBreakdown(periodDays = 28) {
    return this.request(
      `/analytics/search/keyword-breakdown?periodDays=${periodDays}`,
    );
  }

  analyticsSearchKeywordTrend(periodDays = 28) {
    return this.request(`/analytics/search/keyword-trend?periodDays=${periodDays}`);
  }

  analyticsGeoCountries(limit = 20, periodDays = 28) {
    return this.request(
      `/analytics/geo/countries?limit=${limit}&periodDays=${periodDays}`,
    );
  }

  analyticsGeoDevices(periodDays = 28) {
    return this.request(`/analytics/geo/devices?periodDays=${periodDays}`);
  }

  analyticsGeoNewVsReturning(periodDays = 28) {
    return this.request(
      `/analytics/geo/new-vs-returning?periodDays=${periodDays}`,
    );
  }

  analyticsVercelBaseline(periodDays = 28) {
    return this.request(`/analytics/vercel/baseline?periodDays=${periodDays}`);
  }

  analyticsCoverage(periodDays = 28) {
    return this.request(`/analytics/coverage?periodDays=${periodDays}`);
  }

  analyticsMeta(periodDays = 28) {
    return this.request(`/analytics/meta?periodDays=${periodDays}`);
  }

  auditRun() {
    return this.request("/audit/run", { method: "POST" });
  }

  auditRuns(limit = 20) {
    return this.request(`/audit/runs?limit=${limit}`);
  }

  auditRunGet(id: string) {
    return this.request(`/audit/runs/${id}`);
  }

  auditSitemap() {
    return this.request("/audit/sitemap");
  }

  auditLinks() {
    return this.request("/audit/links");
  }

  mediaList(limit = 100) {
    return this.request(`/media?limit=${limit}`);
  }

  mediaRegisterUrl(body: {
    filename: string;
    url: string;
    mimeType?: string;
    sizeBytes?: number;
  }) {
    return this.request("/media", { method: "POST", body: JSON.stringify(body) });
  }

  async mediaUploadFile(filePath: string) {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const buffer = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mimeByExt: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
    };
    const mimeType = mimeByExt[ext] ?? "application/octet-stream";
    const form = new FormData();
    form.append("file", new Blob([buffer], { type: mimeType }), filename);
    return this.request("/media", { method: "POST", body: form });
  }
}
