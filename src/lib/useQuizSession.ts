"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { questionKey } from "@/data/question-sets";
import type { JournalQuestion, QuestionSet } from "@/data/types";
import {
  emptyEntry,
  grade,
  type EntryRow,
  type GradeResult,
  type QuizEntry,
} from "@/lib/grading";
import { summarize, useProgress, type Attempt } from "@/lib/useProgress";

/** 仕訳の左右どちら側か */
export type Side = "debit" | "credit";

export interface QuizSession {
  /** 出題中の問題と、その位置 */
  question: JournalQuestion;
  index: number;
  total: number;
  isLast: boolean;
  /** 入力中の解答 */
  entry: QuizEntry;
  /** 採点結果。未解答なら null */
  result: GradeResult | null;
  /** この問題の解答履歴（古い順） */
  history: Attempt[];
  /** このセットぶんの集計 */
  stats: { answeredCount: number; correctCount: number; accuracy: number };
  updateRow: (side: Side, rowIdx: number, patch: Partial<EntryRow>) => void;
  setNoJournal: (value: boolean) => void;
  submit: () => void;
  /** 同じ問題を空欄に戻してやり直す */
  retry: () => void;
  goTo: (nextIndex: number) => void;
  /** このセットの進捗を消して第1問へ戻る */
  resetProgress: () => void;
}

/**
 * 1つの問題集を解き進めるための状態をまとめたフック。
 * 出題位置・入力・採点結果を持ち、localStorage への保存は useProgress に委ねる。
 */
export function useQuizSession(set: QuestionSet): QuizSession {
  const {
    hydrated,
    progress,
    recordResult,
    getHistory,
    setCurrentIndex,
    resetSet,
  } = useProgress();

  const [index, setIndex] = useState(0);
  const [entry, setEntry] = useState<QuizEntry>(() =>
    emptyEntry(set.questions[0]),
  );
  const [result, setResult] = useState<GradeResult | null>(null);

  const question = set.questions[index];
  const total = set.questions.length;

  // 保存された再開位置をマウント後に反映（初回ハイドレーション時のみ）
  useEffect(() => {
    if (hydrated) {
      const saved = Math.min(progress.currentIndex[set.id] ?? 0, total - 1);
      const next = saved < 0 ? 0 : saved;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndex(next);
      setEntry(emptyEntry(set.questions[next]));
    }
    // progress.currentIndex は初回反映のみ狙うため依存に入れない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // このセットぶんの集計（他のセットの成績は混ぜない）
  const stats = useMemo(
    () =>
      summarize(
        progress.attempts,
        set.questions.map((q) => questionKey(set.id, q.id)),
      ),
    [progress.attempts, set],
  );

  const updateRow = useCallback(
    (side: Side, rowIdx: number, patch: Partial<EntryRow>) => {
      setEntry((prev) => ({
        ...prev,
        [side]: prev[side].map((r, i) =>
          i === rowIdx ? { ...r, ...patch } : r,
        ),
      }));
    },
    [],
  );

  const setNoJournal = useCallback((value: boolean) => {
    setEntry((prev) => ({ ...prev, noJournal: value }));
  }, []);

  const submit = useCallback(() => {
    if (result) return;
    const graded = grade(entry, question);
    setResult(graded);
    recordResult(set.id, question.id, graded.correct);
  }, [entry, question, recordResult, result, set.id]);

  const retry = useCallback(() => {
    setEntry(emptyEntry(question));
    setResult(null);
  }, [question]);

  const goTo = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(nextIndex, total - 1));
      setIndex(clamped);
      setCurrentIndex(set.id, clamped);
      setEntry(emptyEntry(set.questions[clamped]));
      setResult(null);
    },
    [set, setCurrentIndex, total],
  );

  const resetProgress = useCallback(() => {
    resetSet(
      set.id,
      set.questions.map((q) => q.id),
    );
    goTo(0);
  }, [goTo, resetSet, set]);

  return {
    question,
    index,
    total,
    isLast: index === total - 1,
    entry,
    result,
    history: getHistory(set.id, question.id),
    stats,
    updateRow,
    setNoJournal,
    submit,
    retry,
    goTo,
    resetProgress,
  };
}
