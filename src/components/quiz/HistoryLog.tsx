import { formatDateTime } from "@/lib/grading";
import type { Attempt } from "@/lib/useProgress";

/** 表示中の問題を過去に何回解いたか、その正誤と日時 */
export default function HistoryLog({ history }: { history: Attempt[] }) {
  const correctTotal = history.filter((a) => a.correct).length;

  // 新しい順に上から表示（履歴が積み重なっていくイメージ）
  const rows = history.map((a, i) => ({ a, i })).reverse();

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        この問題の解答履歴
        {history.length > 0 && `（${history.length}回中 ${correctTotal}回正解）`}
      </p>
      {history.length === 0 ? (
        <p className="text-xs text-zinc-400">まだ解答履歴はありません</p>
      ) : (
        <ul className="flex flex-col gap-1 text-xs">
          {rows.map(({ a, i }) => (
            <li key={i} className="flex items-center gap-2">
              <span
                className={
                  a.correct
                    ? "w-16 shrink-0 font-semibold text-emerald-600 dark:text-emerald-400"
                    : "w-16 shrink-0 font-semibold text-rose-600 dark:text-rose-400"
                }
              >
                {a.correct ? "✓ 正解" : "✗ 不正解"}
              </span>
              <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                {formatDateTime(a.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
