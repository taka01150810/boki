import { notFound } from "next/navigation";
import JournalQuiz from "@/components/JournalQuiz";
import { findSet, questionSets } from "@/data/question-sets";

/** 静的エクスポートなので、全問題集ぶんのページをビルド時に書き出す */
export function generateStaticParams() {
  return questionSets.map((set) => ({ setId: set.id }));
}

/** 一覧に無いIDは 404（output: "export" ではランタイム生成できない） */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const set = findSet(setId);
  if (!set) return {};
  return { title: `簿記${set.grade} ${set.label}（${set.topic}）| 仕訳 一問一答` };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const set = findSet(setId);
  if (!set) notFound();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black sm:py-12">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          簿記{set.grade} {set.label}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {set.topic}
        </p>
      </div>
      <JournalQuiz set={set} />
    </main>
  );
}
