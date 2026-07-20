"use client";

import { questionKey } from "@/data/question-sets";
import type { QuestionSet } from "@/data/types";
import { summarize, useProgress } from "@/lib/useProgress";

/**
 * 選択画面のカードに出す「解答済 n/N・正答率 xx%」バッジ。
 * localStorage を読むためクライアントコンポーネントで、
 * ハイドレーション前は同じ高さのプレースホルダを出してレイアウトのがたつきを防ぐ。
 */
export default function ProgressBadge({ sets }: { sets: QuestionSet[] }) {
  const { hydrated, progress } = useProgress();

  const keys = sets.flatMap((s) =>
    s.questions.map((q) => questionKey(s.id, q.id)),
  );
  const total = keys.length;
  const { answeredCount, correctCount, accuracy } = summarize(
    progress.attempts,
    keys,
  );

  if (!hydrated) {
    return <p className="mt-2 h-5 text-xs text-transparent">読み込み中</p>;
  }

  if (answeredCount === 0) {
    return (
      <p className="mt-2 h-5 text-xs text-zinc-400 dark:text-zinc-500">
        未着手（全{total}問）
      </p>
    );
  }

  return (
    <p className="mt-2 h-5 text-xs text-zinc-500 dark:text-zinc-400">
      解答済 {answeredCount}/{total}・正答率{" "}
      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
        {accuracy}%
      </span>{" "}
      ({correctCount}/{answeredCount})
    </p>
  );
}
