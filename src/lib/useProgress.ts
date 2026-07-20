"use client";

import { useCallback, useEffect, useState } from "react";
import { questionKey } from "@/data/question-sets";

const STORAGE_KEY = "boki-progress-v3";
/** 3級しか無かった頃のキー。問題IDが "q1" 形式で、再開位置も1つだけだった。 */
const LEGACY_KEY = "boki-progress-v2";
/** 旧データの問題はすべて3級 仕訳問題集①のもの */
const LEGACY_SET_ID = "g3-01";

/** 1回の解答試行（正誤 + 解答日時） */
export interface Attempt {
  /** 正解だったか */
  correct: boolean;
  /** 解答日時（エポックミリ秒） */
  at: number;
}

export interface Progress {
  /** questionKey（"g2-03-q5" 形式）-> 解答履歴（古い順に積み重なる） */
  attempts: Record<string, Attempt[]>;
  /** セットID -> 再開用の問題インデックス */
  currentIndex: Record<string, number>;
}

const initialProgress: Progress = { attempts: {}, currentIndex: {} };

/** v2（3級のみ・単一の再開位置）の保存内容を v3 の形へ移し替える */
function migrateLegacy(raw: string): Progress {
  const parsed = JSON.parse(raw) as {
    attempts?: Record<string, Attempt[]>;
    currentIndex?: number;
  };
  const attempts: Record<string, Attempt[]> = {};
  for (const [questionId, list] of Object.entries(parsed.attempts ?? {})) {
    attempts[questionKey(LEGACY_SET_ID, questionId)] = list;
  }
  return {
    attempts,
    currentIndex:
      typeof parsed.currentIndex === "number"
        ? { [LEGACY_SET_ID]: parsed.currentIndex }
        : {},
  };
}

function load(): Progress {
  if (typeof window === "undefined") return initialProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Progress>;
      return {
        attempts: parsed.attempts ?? {},
        currentIndex: parsed.currentIndex ?? {},
      };
    }
    // v3 がまだ無い場合だけ旧データを引き継ぐ（以後は v3 のみを読む）
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) return migrateLegacy(legacy);
    return initialProgress;
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

/** 解答済み問題数・正解数・正答率を「各問の直近の試行」基準で数える */
export function summarize(
  attempts: Record<string, Attempt[]>,
  keys: string[],
): { answeredCount: number; correctCount: number; accuracy: number } {
  const answered = keys.filter((k) => (attempts[k]?.length ?? 0) > 0);
  const correctCount = answered.filter((k) => {
    const list = attempts[k];
    return list[list.length - 1].correct;
  }).length;
  const answeredCount = answered.length;
  return {
    answeredCount,
    correctCount,
    accuracy:
      answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100),
  };
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
  const recordResult = useCallback(
    (setId: string, questionId: string, correct: boolean) => {
      const key = questionKey(setId, questionId);
      const attempt: Attempt = { correct, at: Date.now() };
      setProgress((prev) => ({
        ...prev,
        attempts: {
          ...prev.attempts,
          [key]: [...(prev.attempts[key] ?? []), attempt],
        },
      }));
    },
    [],
  );

  /** 指定問題の解答履歴を取得（未挑戦なら空配列） */
  const getHistory = useCallback(
    (setId: string, questionId: string): Attempt[] =>
      progress.attempts[questionKey(setId, questionId)] ?? [],
    [progress.attempts],
  );

  /** そのセットの再開位置を保存 */
  const setCurrentIndex = useCallback((setId: string, index: number) => {
    setProgress((prev) => ({
      ...prev,
      currentIndex: { ...prev.currentIndex, [setId]: index },
    }));
  }, []);

  /** そのセットの進捗だけを消す */
  const resetSet = useCallback((setId: string, questionIds: string[]) => {
    setProgress((prev) => {
      const attempts = { ...prev.attempts };
      for (const id of questionIds) delete attempts[questionKey(setId, id)];
      const currentIndex = { ...prev.currentIndex };
      delete currentIndex[setId];
      return { attempts, currentIndex };
    });
  }, []);

  return {
    progress,
    hydrated,
    recordResult,
    getHistory,
    setCurrentIndex,
    resetSet,
  };
}
