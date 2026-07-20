import type { QuestionSet } from "@/data/types";

/** 出題画面いちばん上の帯。現在位置・このセットの成績・リセット。 */
export default function QuizHeader({
  set,
  questionNo,
  total,
  stats,
  onReset,
}: {
  set: QuestionSet;
  questionNo: number;
  total: number;
  stats: { answeredCount: number; correctCount: number; accuracy: number };
  onReset: () => void;
}) {
  const { answeredCount, correctCount, accuracy } = stats;

  return (
    <header className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-semibold">
          第{questionNo}問 / 全{total}問
        </span>
        <span className="text-zinc-500 dark:text-zinc-400">
          解答済み {answeredCount}問
        </span>
        <span className="text-zinc-500 dark:text-zinc-400">
          正答率{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {accuracy}%
          </span>
          <span className="ml-1 text-xs">
            ({correctCount}/{answeredCount})
          </span>
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          if (confirm(`${set.label}の進捗をリセットしますか？`)) onReset();
        }}
        className="shrink-0 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        リセット
      </button>
    </header>
  );
}
