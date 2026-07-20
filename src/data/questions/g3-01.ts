import type { JournalQuestion, QuestionSet } from "../types";

/**
 * 日商簿記3級 仕訳問題集①（15問）
 * 出典: https://moneyfriends-blog.com/boki3-workbook-01/
 * 元データ: docs/3級/boki3-workbook-01.md
 */
const questions: JournalQuestion[] = [
  {
    id: "q1",
    no: 1,
    title: "仕入と仕入諸掛り",
    text: "仕入先大阪商事から注文した商品￥5,000が到着。手付金￥500と相殺し、残額は掛け。引取運賃￥400を現金で支払った。",
    accounts: ["現金", "前払金", "発送費", "仕入", "立替金", "買掛金"],
    debit: [{ account: "仕入", amount: 5400 }],
    credit: [
      { account: "前払金", amount: 500 },
      { account: "買掛金", amount: 4500 },
      { account: "現金", amount: 400 },
    ],
  },
  {
    id: "q2",
    no: 2,
    title: "売上（前受金・クレジット売掛金）",
    text: "商品￥100,000を売却。うち￥30,000は受け取り済み手付金と相殺。残額はクレジット決済。信販手数料は売上代金の2%。",
    accounts: ["売掛金", "現金", "売上", "クレジット売掛金", "前受金", "支払手数料"],
    debit: [
      { account: "前受金", amount: 30000 },
      { account: "クレジット売掛金", amount: 68600 },
      { account: "支払手数料", amount: 1400 },
    ],
    credit: [{ account: "売上", amount: 100000 }],
  },
  {
    id: "q3",
    no: 3,
    title: "貸付金と利息",
    text: "大阪商事に￥160,000を10か月間貸付。利率3%（月割計算）を差し引いた残額を当座預金から振込。",
    accounts: ["貸付金", "借入金", "当座預金", "支払利息", "受取利息", "普通預金"],
    debit: [{ account: "貸付金", amount: 160000 }],
    credit: [
      { account: "当座預金", amount: 156000 },
      { account: "受取利息", amount: 4000 },
    ],
  },
  {
    id: "q4",
    no: 4,
    title: "貸倒れ処理",
    text: "神奈川商店の倒産により売掛金￥150,000が貸し倒れ。前期分￥50,000、当期分￥100,000。貸倒引当金残高￥60,000。",
    accounts: [
      "貸倒引当金戻入",
      "売掛金",
      "貸倒引当金繰入",
      "貸倒損失",
      "償却債権取立益",
      "貸倒引当金",
    ],
    debit: [
      { account: "貸倒引当金", amount: 50000 },
      { account: "貸倒損失", amount: 100000 },
    ],
    credit: [{ account: "売掛金", amount: 150000 }],
  },
  {
    id: "q5",
    no: 5,
    title: "土地の賃借料",
    text: "駐車場用土地の本月賃借料￥70,000を普通預金から振込。",
    accounts: ["土地", "支払家賃", "支払地代", "現金", "普通預金", "当座預金"],
    debit: [{ account: "支払地代", amount: 70000 }],
    credit: [{ account: "普通預金", amount: 70000 }],
  },
  {
    id: "q6",
    no: 6,
    title: "収入印紙（租税公課）",
    text: "郵便局で収入印紙￥3,000を購入。現金で支払い、ただちに使用。",
    accounts: ["普通預金", "消耗品費", "租税公課", "現金", "通信費", "広告宣伝費"],
    debit: [{ account: "租税公課", amount: 3000 }],
    credit: [{ account: "現金", amount: 3000 }],
  },
  {
    id: "q7",
    no: 7,
    title: "法人税等",
    text: "決算時に法人税等￥250,000を計上。中間納付済み￥150,000。",
    accounts: [
      "法人税等",
      "普通預金",
      "現金",
      "仮払法人税等",
      "未払法人税等",
      "未払消費税",
    ],
    debit: [{ account: "法人税等", amount: 250000 }],
    credit: [
      { account: "仮払法人税等", amount: 150000 },
      { account: "未払法人税等", amount: 100000 },
    ],
  },
  {
    id: "q8",
    no: 8,
    title: "仮払金精算と売掛金回収",
    text: "出張者から旅費残額￥1,000と売掛金回収代金￥2,000を現金で受取。出張前の概算額￥5,000。",
    accounts: ["売掛金", "仮受金", "旅費交通費", "仮払金", "前受金", "現金"],
    debit: [
      { account: "現金", amount: 3000 },
      { account: "旅費交通費", amount: 4000 },
    ],
    credit: [
      { account: "仮払金", amount: 5000 },
      { account: "売掛金", amount: 2000 },
    ],
  },
  {
    id: "q9",
    no: 9,
    title: "当座借越",
    text: "決算時に当座預金の貸方残高￥34,000を借入金に振替。当座借越限度額￥100,000。",
    accounts: ["借入金", "普通預金", "貸付金", "当座預金", "現金", "買掛金"],
    debit: [{ account: "当座預金", amount: 34000 }],
    credit: [{ account: "借入金", amount: 34000 }],
  },
  {
    id: "q10",
    no: 10,
    title: "固定資産売却",
    text: "備品（取得原価￥50,000、耐用年数5年、残存価額ゼロ）を3年使用後、4年目期首に￥25,000で売却。代金は月末受取。定額法・間接法。",
    accounts: [
      "固定資産売却益",
      "固定資産売却損",
      "備品減価償却累計額",
      "未収入金",
      "備品",
      "売掛金",
    ],
    debit: [
      { account: "未収入金", amount: 25000 },
      { account: "備品減価償却累計額", amount: 30000 },
    ],
    credit: [
      { account: "備品", amount: 50000 },
      { account: "固定資産売却益", amount: 5000 },
    ],
  },
  {
    id: "q11",
    no: 11,
    title: "当期純損失",
    text: "決算において当期純損失￥900,000を計上。",
    accounts: ["利益準備金", "資本金", "繰越利益剰余金", "仕入", "損益", "未払配当金"],
    debit: [{ account: "繰越利益剰余金", amount: 900000 }],
    credit: [{ account: "損益", amount: 900000 }],
  },
  {
    id: "q12",
    no: 12,
    title: "手形借入金返済",
    text: "手形で借り入れていた￥400,000の満期日に、当座預金から同額が引き落とされた。",
    accounts: ["手形借入金", "手形貸付金", "受取利息", "借入金", "当座預金", "支払利息"],
    debit: [{ account: "手形借入金", amount: 400000 }],
    credit: [{ account: "当座預金", amount: 400000 }],
  },
  {
    id: "q13",
    no: 13,
    title: "売掛金回収と売上返品",
    text: "売掛金￥650,000のうち、小切手￥300,000と郵便為替￥250,000で受取。残￥100,000は以前の返品未処理。",
    accounts: ["売掛金", "現金", "受取手形", "売上", "仕入", "当座預金"],
    debit: [
      { account: "現金", amount: 550000 },
      { account: "売上", amount: 100000 },
    ],
    credit: [{ account: "売掛金", amount: 650000 }],
  },
  {
    id: "q14",
    no: 14,
    title: "消費税相殺",
    text: "決算時に仮払消費税￥130,000、仮受消費税￥370,000を相殺して納税額確定。",
    accounts: ["仮受消費税", "未払消費税", "未払金", "仕入", "仮払消費税", "売上"],
    debit: [{ account: "仮受消費税", amount: 370000 }],
    credit: [
      { account: "仮払消費税", amount: 130000 },
      { account: "未払消費税", amount: 240000 },
    ],
  },
  {
    id: "q15",
    no: 15,
    title: "消費税（税抜方式）",
    text: "商品A（￥5,000）とB（￥8,000）を仕入れ、納品書兼請求書受取。代金は掛け。税抜方式記帳（消費税10%）。",
    accounts: ["仮払消費税", "売掛金", "仕入", "仮受消費税", "買掛金", "普通預金"],
    debit: [
      { account: "仕入", amount: 13000 },
      { account: "仮払消費税", amount: 1300 },
    ],
    credit: [{ account: "買掛金", amount: 14300 }],
  },
];

export const g301: QuestionSet = {
  id: "g3-01",
  grade: "3級",
  label: "仕訳問題集①",
  topic: "3級 仕訳総合",
  source: "https://moneyfriends-blog.com/boki3-workbook-01/",
  questions,
};
