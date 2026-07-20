"use client";

import type { QuestionSet } from "@/data/types";
import { useQuizSession } from "@/lib/useQuizSession";
import EntryForm from "./quiz/EntryForm";
import HistoryLog from "./quiz/HistoryLog";
import QuestionNav from "./quiz/QuestionNav";
import QuizHeader from "./quiz/QuizHeader";
import ResultPanel from "./quiz/ResultPanel";

/**
 * 1つの問題集を1問ずつ出題する画面。
 * 状態は useQuizSession が持ち、ここは並べ方だけを決める。
 */
export default function JournalQuiz({ set }: { set: QuestionSet }) {
  const {
    question,
    index,
    total,
    isLast,
    entry,
    result,
    history,
    stats,
    updateRow,
    setNoJournal,
    submit,
    retry,
    goTo,
    resetProgress,
  } = useQuizSession(set);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <QuizHeader
        set={set}
        questionNo={question.no}
        total={total}
        stats={stats}
        onReset={resetProgress}
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {question.title}
        </h2>
        <p className="leading-7 text-zinc-800 dark:text-zinc-100">
          {question.text}
        </p>
      </section>

      <EntryForm
        entry={entry}
        options={question.accounts}
        result={result}
        onChangeRow={updateRow}
        onChangeNoJournal={setNoJournal}
      />

      {result ? (
        <ResultPanel
          result={result}
          question={question}
          isLast={isLast}
          onNext={() => goTo(index + 1)}
          onRetry={retry}
        />
      ) : (
        <button
          type="button"
          onClick={submit}
          className="mx-auto w-full max-w-xs rounded-full bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 active:scale-[0.99]"
        >
          解答する
        </button>
      )}

      <QuestionNav
        grade={set.grade}
        isFirst={index === 0}
        isLast={isLast}
        onPrev={() => goTo(index - 1)}
        onNext={() => goTo(index + 1)}
      />

      <HistoryLog history={history} />
    </div>
  );
}
