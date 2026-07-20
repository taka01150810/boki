// 仕訳一問一答アプリのデータ型定義

/** 仕訳の1行（勘定科目と金額のペア） */
export interface JournalLine {
  /** 勘定科目名（例: "仕入", "現金"） */
  account: string;
  /** 金額（円） */
  amount: number;
}

/** 1つの仕訳問題 */
export interface JournalQuestion {
  /** 問題ID（例: "q1"） */
  id: string;
  /** 問題番号（1始まり） */
  no: number;
  /** 見出し（例: "仕入と仕入諸掛り"） */
  title: string;
  /** 取引文（問題本文） */
  text: string;
  /**
   * 勘定科目の候補リスト。借方・貸方どちらのプルダウンにもこの候補を出す。
   * 正解に含まれない科目（ダミー）も混ざっている。
   */
  accounts: string[];
  /**
   * 正解が「仕訳なし」の問題。
   * 空欄のまま提出しても正解になってしまわないよう、UI では専用のチェックで解答させる。
   */
  noJournal?: boolean;
  /** 正解の借方（順不同で採点）。noJournal のときは空。 */
  debit: JournalLine[];
  /** 正解の貸方（順不同で採点）。noJournal のときは空。 */
  credit: JournalLine[];
}

/** 出題元の級 */
export type Grade = "3級" | "2級";
