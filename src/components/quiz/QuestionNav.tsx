import Link from "next/link";
import type { Grade } from "@/data/types";

const navButton =
  "rounded-md px-3 py-1 transition-colors enabled:hover:bg-zinc-100 disabled:opacity-40 dark:enabled:hover:bg-zinc-800";

/** 一覧へ戻るリンクと、前/次の問題ボタン */
export default function QuestionNav({
  grade,
  isFirst,
  isLast,
  onPrev,
  onNext,
}: {
  grade: Grade;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  // 2級は問題集が8つあるので一覧へ、3級は問題集が1つなので級の選択へ戻す
  const back =
    grade === "2級"
      ? { href: "/2kyu", label: "2級の問題集一覧" }
      : { href: "/", label: "級の選択" };

  return (
    <>
      <Link
        href={back.href}
        className="mx-auto text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
      >
        ← {back.label}へ戻る
      </Link>

      <nav className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className={navButton}
        >
          ← 前の問題
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={isLast}
          className={navButton}
        >
          次の問題 →
        </button>
      </nav>
    </>
  );
}
