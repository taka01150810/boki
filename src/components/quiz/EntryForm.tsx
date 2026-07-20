import type { GradeResult, QuizEntry, EntryRow } from "@/lib/grading";
import type { Side } from "@/lib/useQuizSession";
import SideTable from "./SideTable";

/** 借方・貸方の入力表と「仕訳なし」チェック。採点後は入力を固定する。 */
export default function EntryForm({
  entry,
  options,
  result,
  onChangeRow,
  onChangeNoJournal,
}: {
  entry: QuizEntry;
  options: string[];
  result: GradeResult | null;
  onChangeRow: (side: Side, rowIdx: number, patch: Partial<EntryRow>) => void;
  onChangeNoJournal: (value: boolean) => void;
}) {
  const locked = !!result;

  return (
    <>
      {/* スマホでも借方・貸方を横並びに保つ */}
      <section className="grid grid-cols-2 gap-2 sm:gap-4">
        <SideTable
          label="借方"
          side="debit"
          rows={entry.debit}
          options={options}
          disabled={locked || entry.noJournal}
          correct={result?.debitCorrect}
          onChange={onChangeRow}
        />
        <SideTable
          label="貸方"
          side="credit"
          rows={entry.credit}
          options={options}
          disabled={locked || entry.noJournal}
          correct={result?.creditCorrect}
          onChange={onChangeRow}
        />
      </section>

      {/* 「仕訳なし」も解答の1つ（空欄のまま提出とは区別する） */}
      <label className="mx-auto flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={entry.noJournal}
          disabled={locked}
          onChange={(e) => onChangeNoJournal(e.target.checked)}
          className="size-4 accent-emerald-600"
        />
        仕訳なし
      </label>
    </>
  );
}
