import type { Grade, QuestionSet } from "./types";
import { g301 } from "./questions/g3-01";
import { g201 } from "./questions/g2-01";
import { g202 } from "./questions/g2-02";
import { g203 } from "./questions/g2-03";
import { g204 } from "./questions/g2-04";
import { g205 } from "./questions/g2-05";
import { g206 } from "./questions/g2-06";
import { g207 } from "./questions/g2-07";
import { g208 } from "./questions/g2-08";

/** 収録している全問題集（トップ・問題集選択・静的ルート生成の元データ） */
export const questionSets: QuestionSet[] = [
  g301,
  g201,
  g202,
  g203,
  g204,
  g205,
  g206,
  g207,
  g208,
];

/** 出題の級（トップに並べる順） */
export const grades: Grade[] = ["3級", "2級"];

/** 指定した級の問題集を、収録順に返す */
export function setsOfGrade(grade: Grade): QuestionSet[] {
  return questionSets.filter((s) => s.grade === grade);
}

/** セットIDから問題集を引く（未知のIDなら undefined） */
export function findSet(id: string): QuestionSet | undefined {
  return questionSets.find((s) => s.id === id);
}

/**
 * 進捗保存に使うグローバルな問題キー。
 * 問題IDは問題集内でしか一意でない（どのセットにも "q1" がある）ため、セットIDで修飾する。
 */
export function questionKey(setId: string, questionId: string): string {
  return `${setId}-${questionId}`;
}

/** 級ごとの合計問題数 */
export function questionCountOfGrade(grade: Grade): number {
  return setsOfGrade(grade).reduce((n, s) => n + s.questions.length, 0);
}
