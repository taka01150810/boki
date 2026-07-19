"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "boki-progress-v2";

/** 1回の解答試行（正誤 + 解答日時） */
export interface Attempt {
  /** 正解だったか */
  correct: boolean;
  /** 解答日時（エポックミリ秒） */
  at: number;
}

export interface Progress {
  /** questionId -> 解答履歴（古い順に積み重なる） */
  attempts: Record<string, Attempt[]>;
  /** 再開用の現在の問題インデックス */
  currentIndex: number;
}

const initialProgress: Progress = { attempts: {}, currentIndex: 0 };

function load(): Progress {
  if (typeof window === "undefined") return initialProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      attempts: parsed.attempts ?? {},
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

  /** 解答結果を履歴に追記する（日時つき） */
  const recordResult = useCallback((questionId: string, correct: boolean) => {
    const attempt: Attempt = { correct, at: Date.now() };
    setProgress((prev) => {
      const prevAttempts = prev.attempts[questionId] ?? [];
      return {
        ...prev,
        attempts: {
          ...prev.attempts,
          [questionId]: [...prevAttempts, attempt],
        },
      };
    });
  }, []);

  /** 指定問題の解答履歴を取得（未挑戦なら空配列） */
  const getHistory = useCallback(
    (questionId: string): Attempt[] => progress.attempts[questionId] ?? [],
    [progress.attempts],
  );

  /** 現在インデックスを保存 */
  const setCurrentIndex = useCallback((index: number) => {
    setProgress((prev) => ({ ...prev, currentIndex: index }));
  }, []);

  /** すべてリセット */
  const reset = useCallback(() => {
    setProgress(initialProgress);
  }, []);

  // 集計は「各問の直近の試行」を基準にする
  const answeredIds = Object.keys(progress.attempts).filter(
    (id) => progress.attempts[id].length > 0,
  );
  const answeredCount = answeredIds.length;
  const correctCount = answeredIds.filter((id) => {
    const list = progress.attempts[id];
    return list[list.length - 1].correct;
  }).length;
  const accuracy =
    answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100);

  return {
    progress,
    hydrated,
    recordResult,
    getHistory,
    setCurrentIndex,
    reset,
    answeredCount,
    correctCount,
    accuracy,
  };
}
