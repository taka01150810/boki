import Link from "next/link";
import type { ReactNode } from "react";

/** 級選択・問題集選択で使う、リンクになったカード1枚ぶんの体裁 */
export default function SelectCard({
  href,
  className = "p-4",
  children,
}: {
  href: string;
  /** 余白だけ呼び出し側で変えたいことがある */
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border border-zinc-200 bg-white transition-colors hover:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-600 ${className}`}
    >
      {children}
    </Link>
  );
}
