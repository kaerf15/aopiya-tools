import {
  DEFAULT_ANALYTICS_STATS_START_DATE,
  datesBeforeStatsStart,
} from "@aopiya/sdk";

/** 测试期日期混入日序列时写 stderr，便于 Agent / 脚本发现 */
export function warnPreStatsDates(
  label: string,
  rows: { date: string }[] | undefined,
  statsStartDate?: string,
) {
  if (!rows?.length) return;
  const start = statsStartDate ?? DEFAULT_ANALYTICS_STATS_START_DATE;
  const bad = datesBeforeStatsStart(rows, start);
  if (bad.length === 0) return;
  console.error(
    JSON.stringify(
      {
        warning: `${label} 含统计起点 ${start} 之前的日期`,
        statsStartDate: start,
        dates: bad,
        hint:
          "确认生产 ANALYTICS_STATS_START_DATE=2026-06-13；在 aopiya_web 执行 pnpm analytics:purge-pre-launch -- --apply、pnpm db:delete-test-data、pnpm clean-orphan-funnel -- --apply，再 aopiya analytics sync",
      },
      null,
      2,
    ),
  );
}
