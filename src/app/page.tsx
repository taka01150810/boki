import Link from "next/link";
import ProgressBadge from "@/components/ProgressBadge";
import { questionCountOfGrade, setsOfGrade } from "@/data/question-sets";

/** トップは級の選択だけ。3級は問題集が1つなので、選択画面を挟まず出題へ直行する。 */
const entries = [
  {
    grade: "3級" as const,
    href: "/quiz/g3-01",
    caption: "仕訳問題集①",
  },
  {
    grade: "2級" as const,
    href: "/2kyu",
    caption: "仕訳問題集①〜⑧",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-black sm:py-20">
      <div className="mx-auto mb-10 max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          日商簿記 仕訳 一問一答
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          取引文を読んで借方・貸方を入力し、「解答する」で答え合わせ
        </p>
      </div>

      <div className="mx-auto flex max-w-md flex-col gap-4">
        {entries.map(({ grade, href, caption }) => (
          <Link
            key={grade}
            href={href}
            className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-600"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {grade}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {caption}・全{questionCountOfGrade(grade)}問
              </span>
            </div>
            <ProgressBadge sets={setsOfGrade(grade)} />
          </Link>
        ))}
      </div>
    </main>
  );
}
