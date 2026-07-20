// docs/2級/*.md（いぬぼき由来の仕訳問題）を src/data/questions/g2-0N.ts へ変換する。
//
// markdown 側には勘定科目の候補リストが無いため、
//   候補 = 正解の科目 + 同じ問題集に登場する他の科目（ダミー）
// を問題IDから導いた固定シードで選び、実行するたび同じ並びになるようにしている。
//
//   node scripts/convert-2kyu.mjs

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "docs", "2級");
const OUT_DIR = join(ROOT, "src", "data", "questions");

/** 候補として出したい勘定科目の数（正解がこれより多ければ正解の数に合わせる） */
const CHOICE_COUNT = 6;

/** 文字列から 32bit のシードを作る（問題IDごとに安定した乱数を得るため） */
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: シードから決定的な疑似乱数を返す */
function makeRandom(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates（乱数は呼び出し側から渡す＝決定的） */
function shuffle(items, random) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** "| 当座預金 | 900 | 買掛金 | 900 |" のような表を借方・貸方の配列へ */
function parseTable(lines) {
  const debit = [];
  const credit = [];
  for (const line of lines) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 4) continue;
    // ヘッダ行と区切り行は読み飛ばす
    if (cells[0] === "借方" || /^-+$/.test(cells[0])) continue;
    const push = (side, account, amount) => {
      if (!account) return;
      const n = Number(amount.replace(/[,￥¥円\s]/g, ""));
      if (!Number.isFinite(n)) throw new Error(`金額を解釈できません: ${line}`);
      side.push({ account, amount: n });
    };
    push(debit, cells[0], cells[1]);
    push(credit, cells[2], cells[3]);
  }
  return { debit, credit };
}

/**
 * 1問分のブロックを解析する。
 * 「本店と支店の仕訳をそれぞれ答えなさい」形式（解答表が2つ）は2問に分割して返すため、
 * 常に配列を返す。
 */
function parseBlock(block) {
  const titleMatch = block.match(/^## (問[\d-]+)：(.+)$/m);
  if (!titleMatch) return [];
  const [, code, title] = titleMatch;

  const textMatch = block.match(/^\*\*問題\*\*：(.+)$/m);
  if (!textMatch) throw new Error(`問題文が見つかりません: ${code}`);
  const baseText = textMatch[1].trim();

  // "**解答**：" / "**解答（本店）**：" ごとに区切る
  const answerBlocks = [];
  const answerRe = /^\*\*解答(?:（(.+?)）)?\*\*：(.*)$/gm;
  let m;
  const marks = [];
  while ((m = answerRe.exec(block)) !== null) {
    marks.push({
      who: m[1] ?? null,
      rest: m[2],
      index: m.index,
      start: m.index + m[0].length,
    });
  }
  for (let i = 0; i < marks.length; i++) {
    const body = block.slice(marks[i].start, marks[i + 1]?.index ?? block.length);
    answerBlocks.push({ who: marks[i].who, inline: marks[i].rest.trim(), body });
  }
  if (answerBlocks.length === 0) throw new Error(`解答が見つかりません: ${code}`);

  const multi = answerBlocks.length > 1;
  return answerBlocks.map(({ who, inline, body }) => {
    const tableLines = body.split("\n").filter((l) => l.trim().startsWith("|"));
    const noJournal = inline.includes("仕訳なし") || tableLines.length === 0;
    const { debit, credit } = noJournal
      ? { debit: [], credit: [] }
      : parseTable(tableLines);

    // 「本店と支店の仕訳をそれぞれ〜」は、分割後の問題ごとに主語を明示し直す
    const text = multi
      ? `${baseText.replace(/[^。]*仕訳をそれぞれ答えなさい。/g, "").trim()}「${who}」の仕訳を答えなさい。`
      : baseText;

    return {
      code,
      title: multi ? `${title}（${who}）` : title,
      text,
      debit,
      credit,
      noJournal,
    };
  });
}

/** 正解の科目 + 問題集内の他科目（ダミー）で候補リストを組み立てる */
function buildAccounts(question, pool) {
  const correct = [
    ...new Set([...question.debit, ...question.credit].map((l) => l.account)),
  ];
  const random = makeRandom(hashSeed(question.code + question.title));
  const dummies = shuffle(
    pool.filter((a) => !correct.includes(a)),
    random,
  ).slice(0, Math.max(0, CHOICE_COUNT - correct.length));
  return shuffle([...correct, ...dummies], random);
}

function toTs(setId, meta, questions) {
  const body = questions
    .map((q, i) => {
      const lines = (arr) =>
        arr.length === 0
          ? "[]"
          : `[\n${arr
              .map(
                (l) =>
                  `      { account: ${JSON.stringify(l.account)}, amount: ${l.amount} },`,
              )
              .join("\n")}\n    ]`;
      return [
        "  {",
        `    id: "q${i + 1}",`,
        `    no: ${i + 1},`,
        `    title: ${JSON.stringify(q.title)},`,
        `    text: ${JSON.stringify(q.text)},`,
        `    accounts: ${JSON.stringify(q.accounts)},`,
        q.noJournal ? "    noJournal: true," : null,
        `    debit: ${lines(q.debit)},`,
        `    credit: ${lines(q.credit)},`,
        "  },",
      ]
        .filter((l) => l !== null)
        .join("\n");
    })
    .join("\n");

  return `import type { QuestionSet } from "../types";

/**
 * ${meta.heading}
 * 出典: ${meta.source}
 * 元データ: docs/2級/${meta.file}
 *
 * このファイルは scripts/convert-2kyu.mjs が生成しています。手で編集しないでください。
 */
export const ${setId.replace("-", "")}: QuestionSet = {
  id: ${JSON.stringify(setId)},
  grade: "2級",
  label: ${JSON.stringify(meta.label)},
  topic: ${JSON.stringify(meta.topic)},
  source: ${JSON.stringify(meta.source)},
  questions: [
${body}
  ],
};
`;
}

mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(SRC_DIR).filter((f) => f.endsWith(".md")).sort();
let grandTotal = 0;

for (const file of files) {
  const raw = readFileSync(join(SRC_DIR, file), "utf8");
  const heading = raw.match(/^# (.+)$/m)?.[1] ?? "";
  // 例: 簿記2級 仕訳問題集①（現金預金・商品売買等／23問）
  const headingParts = heading.match(/^簿記2級 (仕訳問題集.)（(.+?)／/);
  const source = raw.match(/^出典: (\S+)$/m)?.[1] ?? "";
  const num = file.match(/(\d+)\.md$/)[1];
  const setId = `g2-${num}`;

  const parsed = raw.split("\n---\n").flatMap(parseBlock);

  // ダミー科目の供給元は「その問題集に登場する全科目」
  const pool = [
    ...new Set(
      parsed.flatMap((q) => [...q.debit, ...q.credit].map((l) => l.account)),
    ),
  ].sort();

  const questions = parsed.map((q) => ({ ...q, accounts: buildAccounts(q, pool) }));

  writeFileSync(
    join(OUT_DIR, `${setId}.ts`),
    toTs(setId, {
      heading,
      source,
      file,
      label: headingParts?.[1] ?? heading,
      topic: headingParts?.[2] ?? "",
    }, questions),
  );

  grandTotal += questions.length;
  const noJournal = questions.filter((q) => q.noJournal).length;
  const maxRows = Math.max(
    ...questions.map((q) => Math.max(q.debit.length, q.credit.length)),
  );
  console.log(
    `${setId}.ts  ${String(questions.length).padStart(3)}問  科目プール${pool.length}  最大${maxRows}行  仕訳なし${noJournal}問`,
  );
}

console.log(`\n2級 合計 ${grandTotal}問`);
