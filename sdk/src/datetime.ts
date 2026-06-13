/**
 * AOPIYA API 时间工具（与站点 @aopiya/schema datetime 同口径）。
 * CLI 输出 JSON 中的 createdAt 等字段已是 API 原样（+08:00）；本模块供本地格式化展示。
 */
export const SITE_TIMEZONE = "Asia/Shanghai";
export const SITE_TZ_OFFSET = "+08:00";

export function parseStoredDateTime(iso: string | null | undefined): Date | null {
  if (!iso?.trim()) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatBeijingDateTime(
  iso: string | null | undefined,
  opts?: { seconds?: boolean },
): string {
  const d = parseStoredDateTime(iso);
  if (!d) return iso?.trim() ?? "";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: SITE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: opts?.seconds ? "2-digit" : undefined,
    hour12: false,
  }).format(d);
}
