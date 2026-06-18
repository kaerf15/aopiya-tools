/** 看板统计起点（北京日历日）；与站点 ANALYTICS_STATS_START_DATE 默认一致 */
export const DEFAULT_ANALYTICS_STATS_START_DATE = "2026-06-13";

export function filterByStatsStartDate<T extends { date: string }>(
  rows: T[],
  statsStart = DEFAULT_ANALYTICS_STATS_START_DATE,
): T[] {
  return rows.filter((r) => r.date >= statsStart);
}

/** 返回严格早于统计起点的去重日期列表（升序） */
export function datesBeforeStatsStart<T extends { date: string }>(
  rows: T[],
  statsStart = DEFAULT_ANALYTICS_STATS_START_DATE,
): string[] {
  return [...new Set(rows.filter((r) => r.date < statsStart).map((r) => r.date))].sort();
}
