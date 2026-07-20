import { toAmountInput, type EntryRow } from "@/lib/grading";
import type { Side } from "@/lib/useQuizSession";

/** 借方または貸方の入力表。1行 = 科目プルダウン + 金額入力。 */
export default function SideTable({
  label,
  side,
  rows,
  options,
  disabled,
  correct,
  onChange,
}: {
  label: string;
  side: Side;
  rows: EntryRow[];
  options: string[];
  disabled: boolean;
  /** 採点後のみ渡る。undefined は未採点。 */
  correct?: boolean;
  onChange: (side: Side, rowIdx: number, patch: Partial<EntryRow>) => void;
}) {
  const borderColor =
    correct === undefined
      ? "border-zinc-200 dark:border-zinc-800"
      : correct
        ? "border-emerald-400 dark:border-emerald-600"
        : "border-rose-400 dark:border-rose-600";

  return (
    <div
      className={`rounded-xl border ${borderColor} bg-white p-2.5 dark:bg-zinc-900 sm:p-4`}
    >
      <div className="mb-2 flex items-center justify-between sm:mb-3">
        <h3 className="text-sm font-semibold sm:text-base">{label}</h3>
        {correct !== undefined && (
          <span
            className={
              correct
                ? "text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                : "text-xs font-semibold text-rose-600 dark:text-rose-400"
            }
          >
            {correct ? "OK" : "要確認"}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] gap-1 sm:gap-2">
            <select
              value={row.account}
              disabled={disabled}
              onChange={(e) => onChange(side, i, { account: e.target.value })}
              className="min-w-0 rounded-md border border-zinc-300 bg-white px-1.5 py-1.5 text-xs disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-800 sm:px-2 sm:py-2 sm:text-sm"
            >
              <option value="">科目を選択</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={row.amount}
              disabled={disabled}
              placeholder="金額"
              onChange={(e) =>
                onChange(side, i, { amount: toAmountInput(e.target.value) })
              }
              className="w-14 rounded-md border border-zinc-300 bg-white px-1.5 py-1.5 text-right text-xs tabular-nums disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-800 sm:w-24 sm:px-2 sm:py-2 sm:text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
