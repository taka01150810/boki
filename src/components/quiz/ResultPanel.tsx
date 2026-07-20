import type { JournalQuestion } from "@/data/types";
import type { GradeResult } from "@/lib/grading";
import AnswerTable from "./AnswerTable";

/** 採点後に出す正誤バッジ・正解の仕訳・次アクション */
export default function ResultPanel({
  result,
  question,
  isLast,
  onNext,
  onRetry,
}: {
  result: GradeResult;
  question: JournalQuestion;
  isLast: boolean;
  onNext: () => void;
  onRetry: () => void;
}) {
  return (
    <section
      className={`rounded-xl border p-5 ${
        result.correct
          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
          : "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40"
      }`}
    >
      <p
        className={`mb-4 text-lg font-bold ${
          result.correct
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-rose-700 dark:text-rose-300"
        }`}
      >
        {result.correct ? "✅ 正解！" : "❌ 不正解"}
      </p>

      <div className="mb-4">
        <p className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
          正解の仕訳
        </p>
        {question.noJournal ? (
          <p className="rounded-md bg-white/60 px-3 py-2 text-sm font-semibold dark:bg-zinc-900/60">
            仕訳なし
          </p>
        ) : (
          <AnswerTable debit={question.debit} credit={question.credit} />
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {!result.correct && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium transition-colors hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            もう一度解く
          </button>
        )}
        {!isLast ? (
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            次の問題へ →
          </button>
        ) : (
          <span className="self-center text-sm text-zinc-500 dark:text-zinc-400">
            最後の問題です。おつかれさまでした！
          </span>
        )}
      </div>
    </section>
  );
}
