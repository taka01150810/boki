import type { JournalLine, JournalQuestion } from "@/data/types";

/** UI上の1行の入力（未入力を許容するので文字列で保持） */
export interface EntryRow {
  account: string;
  /** 金額の生入力（カンマ・全角を含みうる） */
  amount: string;
}

/** 空の入力行 */
export const emptyRow = (): EntryRow => ({ account: "", amount: "" });

/** 借方・貸方それぞれの入力状態 */
export interface QuizEntry {
  debit: EntryRow[];
  credit: EntryRow[];
  /** 「仕訳なし」を選んだか */
  noJournal: boolean;
}

/** 最低限そろえる行数（借方・貸方とも） */
export const MIN_ROWS = 3;

/**
 * その問題に必要な入力行数。
 * 正解が3行を超える問題（のれん・連結など）だけ欄が増える。
 */
export function rowCount(question: JournalQuestion): number {
  return Math.max(MIN_ROWS, question.debit.length, question.credit.length);
}

/** 空の入力（行数は問題に合わせる） */
export const emptyEntry = (question: JournalQuestion): QuizEntry => {
  const n = rowCount(question);
  return {
    debit: Array.from({ length: n }, emptyRow),
    credit: Array.from({ length: n }, emptyRow),
    noJournal: false,
  };
};

/**
 * 金額の生入力を数値へ正規化する。
 * 全角数字→半角、カンマ・空白・￥・円を除去。数値化できなければ null。
 */
export function parseAmount(raw: string): number | null {
  if (!raw) return null;
  const normalized = raw
    // 全角数字を半角へ
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    // カンマ・空白・通貨記号を除去
    .replace(/[,\s￥¥円]/g, "");
  if (normalized === "" || !/^\d+$/.test(normalized)) return null;
  return Number(normalized);
}

/**
 * 金額入力欄用のサニタイズ。全角数字を半角へ変換し、数字以外を除去する。
 * （入力時点で数字だけしか残らないようにするため）
 */
export function toAmountInput(raw: string): string {
  return raw
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[^0-9]/g, "");
}

/** 入力行を採点用の JournalLine へ変換（未入力・不正な行は除外） */
function toLines(rows: EntryRow[]): JournalLine[] {
  const lines: JournalLine[] = [];
  for (const row of rows) {
    const amount = parseAmount(row.amount);
    if (row.account && amount !== null) {
      lines.push({ account: row.account, amount });
    }
  }
  return lines;
}

/** 順不同で比較するための正規化キー配列（"科目:金額" をソート） */
function toKeySet(lines: JournalLine[]): string[] {
  return lines.map((l) => `${l.account}:${l.amount}`).sort();
}

/** 2つの仕訳（順不同）が完全一致するか */
function linesEqual(a: JournalLine[], b: JournalLine[]): boolean {
  const ka = toKeySet(a);
  const kb = toKeySet(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k, i) => k === kb[i]);
}

export interface GradeResult {
  correct: boolean;
  debitCorrect: boolean;
  creditCorrect: boolean;
}

/**
 * 入力を正解と照合する。借方・貸方とも順不同で過不足なく一致すれば正解。
 *
 * 「仕訳なし」は空欄と区別する必要がある（空欄のまま提出＝正解、では判断を問えない）。
 * そのため専用のチェックを立てたときだけ正解になり、
 * 逆に仕訳が必要な問題でチェックを立てれば不正解にする。
 */
export function grade(entry: QuizEntry, question: JournalQuestion): GradeResult {
  if (question.noJournal || entry.noJournal) {
    const correct = !!question.noJournal && entry.noJournal;
    return { correct, debitCorrect: correct, creditCorrect: correct };
  }
  const debitCorrect = linesEqual(toLines(entry.debit), question.debit);
  const creditCorrect = linesEqual(toLines(entry.credit), question.credit);
  return {
    correct: debitCorrect && creditCorrect,
    debitCorrect,
    creditCorrect,
  };
}

/** 金額を3桁カンマ区切りで表示 */
export function formatAmount(n: number): string {
  return n.toLocaleString("ja-JP");
}

/** エポックミリ秒を "2026/07/20 14:32" 形式で表示（ロケール差を避け固定書式） */
export function formatDateTime(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
