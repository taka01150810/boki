import type { JournalLine } from "@/data/types";
import { formatAmount } from "@/lib/grading";

/** 正解の仕訳を借方・貸方2列で並べる表 */
export default function AnswerTable({
  debit,
  credit,
}: {
  debit: JournalLine[];
  credit: JournalLine[];
}) {
  const rowCount = Math.max(debit.length, credit.length);
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    d: debit[i],
    c: credit[i],
  }));

  return (
    <div className="overflow-x-auto rounded-md">
      <table className="w-full min-w-[20rem] border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-zinc-100 text-left dark:bg-zinc-800">
            <th className="px-2 py-1.5 font-medium sm:px-3">借方</th>
            <th className="px-2 py-1.5 text-right font-medium sm:px-3">金額</th>
            <th className="px-2 py-1.5 font-medium sm:px-3">貸方</th>
            <th className="px-2 py-1.5 text-right font-medium sm:px-3">金額</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-zinc-200 dark:border-zinc-700">
              <td className="px-2 py-1.5 sm:px-3">{r.d?.account ?? ""}</td>
              <td className="px-2 py-1.5 text-right tabular-nums sm:px-3">
                {r.d ? formatAmount(r.d.amount) : ""}
              </td>
              <td className="px-2 py-1.5 sm:px-3">{r.c?.account ?? ""}</td>
              <td className="px-2 py-1.5 text-right tabular-nums sm:px-3">
                {r.c ? formatAmount(r.c.amount) : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
