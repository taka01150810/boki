"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "boki-progress-v1";

export interface Progress {
  /** questionId -> 直近の解答が正解だったか */
  results: Record<string, boolean>;
  /** 再開用の現在の問題インデックス */
  currentIndex: number;
}

const initialProgress: Progress = { results: {}, currentIndex: 0 };

function load(): Progress {
  if (typeof window === "undefined") return initialProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      results: parsed.results ?? {},
      currentIndex: parsed.currentIndex ?? 0,
    };
  } catch {
    return initialProgress;
  }
}

function save(progress: Progress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage が使えない環境では黙って無視
  }
}

/**
 * 学習進捗を localStorage に永続化するフック。
 * SSR とのハイドレーション不整合を避けるため、マウント後に読み込む。
 */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [hydrated, setHydrated] = useState(false);

  // localStorage はマウント後にのみ読む（SSR とのハイドレーション不整合を避ける）
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(progress);
  }, [progress, hydrated]);

  /** 問題の正誤を記録 */
  const recordResult = useCallback((questionId: string, correct: boolean) => {
    setProgress((prev) => ({
      ...prev,
      results: { ...prev.results, [questionId]: correct },
    }));
  }, []);

  /** 現在インデックスを保存 */
  const setCurrentIndex = useCallback((index: number) => {
    setProgress((prev) => ({ ...prev, currentIndex: index }));
  }, []);

  /** すべてリセット */
  const reset = useCallback(() => {
    setProgress(initialProgress);
  }, []);

  const answeredCount = Object.keys(progress.results).length;
  const correctCount = Object.values(progress.results).filter(Boolean).length;
  const accuracy =
    answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100);

  return {
    progress,
    hydrated,
    recordResult,
    setCurrentIndex,
    reset,
    answeredCount,
    correctCount,
    accuracy,
  };
}
