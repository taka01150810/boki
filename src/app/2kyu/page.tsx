import Link from "next/link";
import ProgressBadge from "@/components/ProgressBadge";
import { setsOfGrade } from "@/data/question-sets";

export const metadata = {
  title: "簿記2級 仕訳問題集 | 日商簿記 仕訳 一問一答",
};

export default function Grade2Index() {
  const sets = setsOfGrade("2級");

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black sm:py-12">
      <div className="mx-auto mb-8 max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          簿記2級 仕訳問題集
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          論点ごとに8セット・全
          {sets.reduce((n, s) => n + s.questions.length, 0)}問
        </p>
      </div>

      <div className="mx-auto flex max-w-md flex-col gap-3">
        {sets.map((set) => (
          <Link
            key={set.id}
            href={`/quiz/${set.id}`}
            className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-600"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                {set.label}
              </span>
              <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                {set.questions.length}問
              </span>
            </div>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-300">
              {set.topic}
            </p>
            <ProgressBadge sets={[set]} />
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          ← 級の選択へ戻る
        </Link>
      </div>
    </main>
  );
}
