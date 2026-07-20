"use client";

import { useEffect, useMemo, useState } from "react";
import { journalQuestions } from "@/data/journal-questions";
import type { JournalLine } from "@/data/types";
import {
  emptyEntry,
  formatAmount,
  formatDateTime,
  grade,
  toAmountInput,
  type EntryRow,
  type GradeResult,
  type QuizEntry,
} from "@/lib/grading";
import { useProgress, type Attempt } from "@/lib/useProgress";

type Side = "debit" | "credit";

export default function JournalQuiz() {
  const {
    hydrated,
    progress,
    recordResult,
    getHistory,
    setCurrentIndex,
    reset,
    answeredCount,
    correctCount,
    accuracy,
  } = useProgress();

  const [index, setIndex] = useState(0);
  const [entry, setEntry] = useState<QuizEntry>(emptyEntry);
  const [result, setResult] = useState<GradeResult | null>(null);

  const question = journalQuestions[index];
  const total = journalQuestions.length;

  // この問題の過去の解答履歴（古い順に積み重なる）
  const history = getHistory(question.id);

  // 保存された再開位置をマウント後に反映（初回ハイドレーション時のみ）
  useEffect(() => {
    if (hydrated) {
      const saved = Math.min(progress.currentIndex, total - 1);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndex(saved < 0 ? 0 : saved);
    }
    // progress.currentIndex は初回反映のみ狙うため依存に入れない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const accountOptions = useMemo(
    () => question.accounts,
    [question],
  );

  function updateRow(side: Side, rowIdx: number, patch: Partial<EntryRow>) {
    setEntry((prev) => {
      const rows = prev[side].map((r, i) =>
        i === rowIdx ? { ...r, ...patch } : r,
      );
      return { ...prev, [side]: rows };
    });
  }

  function handleSubmit() {
    if (result) return;
    const g = grade(entry, question);
    setResult(g);
    recordResult(question.id, g.correct);
  }

  function goTo(nextIndex: number) {
    const clamped = Math.max(0, Math.min(nextIndex, total - 1));
    setIndex(clamped);
    setCurrentIndex(clamped);
    setEntry(emptyEntry());
    setResult(null);
  }

  const isLast = index === total - 1;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* 進捗バー */}
      <header className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-semibold">
            第{question.no}問 / 全{total}問
          </span>
          <span className="text-zinc-500 dark:text-zinc-400">
            解答済み {answeredCount}問
          </span>
          <span className="text-zinc-500 dark:text-zinc-400">
            正答率 <span className="font-semibold text-zinc-900 dark:text-zinc-100">{accuracy}%</span>
            <span className="ml-1 text-xs">({correctCount}/{answeredCount})</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("進捗をリセットしますか？")) {
              reset();
              goTo(0);
            }
          }}
          className="shrink-0 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          リセット
        </button>
      </header>

      {/* 問題文 */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {question.title}
        </h2>
        <p className="leading-7 text-zinc-800 dark:text-zinc-100">{question.text}</p>
      </section>

      {/* 入力欄（スマホでも借方・貸方を横並びに保つ） */}
      <section className="grid grid-cols-2 gap-2 sm:gap-4">
        <SideTable
          label="借方"
          side="debit"
          rows={entry.debit}
          options={accountOptions}
          disabled={!!result}
          correct={result?.debitCorrect}
          onChange={updateRow}
        />
        <SideTable
          label="貸方"
          side="credit"
          rows={entry.credit}
          options={accountOptions}
          disabled={!!result}
          correct={result?.creditCorrect}
          onChange={updateRow}
        />
      </section>

      {/* アクション & 判定 */}
      {!result ? (
        <button
          type="button"
          onClick={handleSubmit}
          className="mx-auto w-full max-w-xs rounded-full bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 active:scale-[0.99]"
        >
          解答する
        </button>
      ) : (
        <ResultPanel
          result={result}
          debit={question.debit}
          credit={question.credit}
          isLast={isLast}
          onNext={() => goTo(index + 1)}
          onRetry={() => {
            setEntry(emptyEntry());
            setResult(null);
          }}
        />
      )}

      {/* 問題ナビ */}
      <nav className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="rounded-md px-3 py-1 transition-colors enabled:hover:bg-zinc-100 disabled:opacity-40 dark:enabled:hover:bg-zinc-800"
        >
          ← 前の問題
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={isLast}
          className="rounded-md px-3 py-1 transition-colors enabled:hover:bg-zinc-100 disabled:opacity-40 dark:enabled:hover:bg-zinc-800"
        >
          次の問題 →
        </button>
      </nav>

      {/* 解答履歴（画面下部） */}
      <HistoryLog history={history} />
    </div>
  );
}

function HistoryLog({ history }: { history: Attempt[] }) {
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

function SideTable({
  label,
  side,
  rows,
  options,
  disabled,
  correct,
  onChange,
}: {
  label: string;
  side: Side;
  rows: EntryRow[];
  options: string[];
  disabled: boolean;
  correct?: boolean;
  onChange: (side: Side, rowIdx: number, patch: Partial<EntryRow>) => void;
}) {
  const borderColor =
    correct === undefined
      ? "border-zinc-200 dark:border-zinc-800"
      : correct
        ? "border-emerald-400 dark:border-emerald-600"
        : "border-rose-400 dark:border-rose-600";

  return (
    <div className={`rounded-xl border ${borderColor} bg-white p-2.5 dark:bg-zinc-900 sm:p-4`}>
      <div className="mb-2 flex items-center justify-between sm:mb-3">
        <h3 className="text-sm font-semibold sm:text-base">{label}</h3>
        {correct !== undefined && (
          <span
            className={
              correct
                ? "text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                : "text-xs font-semibold text-rose-600 dark:text-rose-400"
            }
          >
            {correct ? "OK" : "要確認"}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_auto] gap-1 sm:gap-2"
          >
            <select
              value={row.account}
              disabled={disabled}
              onChange={(e) => onChange(side, i, { account: e.target.value })}
              className="min-w-0 rounded-md border border-zinc-300 bg-white px-1.5 py-1.5 text-xs disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-800 sm:px-2 sm:py-2 sm:text-sm"
            >
              <option value="">科目を選択</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={row.amount}
              disabled={disabled}
              placeholder="金額"
              onChange={(e) =>
                onChange(side, i, { amount: toAmountInput(e.target.value) })
              }
              className="w-14 rounded-md border border-zinc-300 bg-white px-1.5 py-1.5 text-right text-xs tabular-nums disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-800 sm:w-24 sm:px-2 sm:py-2 sm:text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultPanel({
  result,
  debit,
  credit,
  isLast,
  onNext,
  onRetry,
}: {
  result: GradeResult;
  debit: JournalLine[];
  credit: JournalLine[];
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
        <AnswerTable debit={debit} credit={credit} />
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

function AnswerTable({
  debit,
  credit,
}: {
  debit: JournalLine[];
  credit: JournalLine[];
}) {
  const rowCount = Math.max(debit.length, credit.length);
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    d: debit[i],
    c: credit[i],
  }));

  return (
    <div className="overflow-x-auto rounded-md">
      <table className="w-full min-w-[20rem] border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-zinc-100 text-left dark:bg-zinc-800">
            <th className="px-2 py-1.5 font-medium sm:px-3">借方</th>
            <th className="px-2 py-1.5 text-right font-medium sm:px-3">金額</th>
            <th className="px-2 py-1.5 font-medium sm:px-3">貸方</th>
            <th className="px-2 py-1.5 text-right font-medium sm:px-3">金額</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-zinc-200 dark:border-zinc-700">
              <td className="px-2 py-1.5 sm:px-3">{r.d?.account ?? ""}</td>
              <td className="px-2 py-1.5 text-right tabular-nums sm:px-3">
                {r.d ? formatAmount(r.d.amount) : ""}
              </td>
              <td className="px-2 py-1.5 sm:px-3">{r.c?.account ?? ""}</td>
              <td className="px-2 py-1.5 text-right tabular-nums sm:px-3">
                {r.c ? formatAmount(r.c.amount) : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
