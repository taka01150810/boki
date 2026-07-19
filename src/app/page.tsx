import JournalQuiz from "@/components/JournalQuiz";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black sm:py-12">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          簿記3級 仕訳 一問一答
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          取引文を読んで借方・貸方を入力し、「解答する」で答え合わせ
        </p>
      </div>
      <JournalQuiz />
    </main>
  );
}
