# 日商簿記 仕訳 一問一答

日商簿記**2級・3級**の仕訳問題を1問ずつ解いて答え合わせできる学習アプリ。
取引文を読み、借方・貸方の勘定科目（プルダウン）と金額を入力して「解答する」を押すと、自動採点して正誤と正解の仕訳を表示します。

## 収録問題

| 級 | 問題集 | 問数 |
| --- | --- | --- |
| 3級 | 仕訳問題集① | 15問 |
| 2級 | 仕訳問題集①〜⑧（現金預金／手形／有価証券／固定資産・リース／引当金・純資産・合併／外貨・税効果／連結／本支店・製造業） | 190問 |

## 画面の流れ

```
/            級を選ぶ（3級 / 2級・進捗つき）
 ├ 3級  →  /quiz/g3-01     出題
 └ 2級  →  /2kyu           問題集①〜⑧を選ぶ（進捗つき）
                └  /quiz/g2-01 … g2-08   出題
```

## 公開URL

<https://taka01150810.github.io/boki/>

`main` への push で GitHub Actions が自動ビルド・デプロイします（[.github/workflows](.github/workflows)）。

## 動かすには

```bash
npm install       # 依存インストール（初回のみ）
npm run dev       # 開発サーバー起動 → http://localhost:3000
```

## 構成

### アプリ本体

| ファイル | 役割 |
| --- | --- |
| [src/app/page.tsx](src/app/page.tsx) | トップ（級の選択） |
| [src/app/2kyu/page.tsx](src/app/2kyu/page.tsx) | 2級の問題集一覧 |
| [src/app/quiz/[setId]/page.tsx](src/app/quiz/[setId]/page.tsx) | 出題ページ（全問題集を静的生成） |
| [src/app/layout.tsx](src/app/layout.tsx) | `lang="ja"`・メタデータ |
| [src/components/JournalQuiz.tsx](src/components/JournalQuiz.tsx) | 出題画面の組み立て |
| [src/components/quiz/](src/components/quiz/) | 出題画面のパーツ（ヘッダ・入力欄・結果・ナビ・履歴） |
| [src/components/ProgressBadge.tsx](src/components/ProgressBadge.tsx) | 選択画面の進捗バッジ |
| [src/components/SelectCard.tsx](src/components/SelectCard.tsx) | 選択画面のカード |
| [src/data/types.ts](src/data/types.ts) | 型定義 |
| [src/data/question-sets.ts](src/data/question-sets.ts) | 問題集レジストリ |
| [src/data/questions/](src/data/questions/) | 問題データ（`g3-01` / `g2-01`〜`g2-08`） |
| [src/lib/grading.ts](src/lib/grading.ts) | 金額正規化・順不同採点 |
| [src/lib/useQuizSession.ts](src/lib/useQuizSession.ts) | 出題画面の状態（位置・入力・採点結果） |
| [src/lib/useProgress.ts](src/lib/useProgress.ts) | localStorage 進捗管理 |
| [scripts/convert-2kyu.mjs](scripts/convert-2kyu.mjs) | `docs/2級/*.md` → 2級データを生成 |

### ドキュメント

| ファイル | 役割 |
| --- | --- |
| [docs/DESIGN.md](docs/DESIGN.md) | 設計判断・採点ロジック・構成・拡張候補 |
| [docs/3級/](docs/3級/) | 3級の元データ（出典付き） |
| [docs/2級/](docs/2級/) | 2級の元データ（出典付き） |
| [README.md](README.md) | 概要とコマンド |

## 実装した機能

- 級 → 問題集 → 出題の3階層。選択画面に「解答済 n/N・正答率 xx%」を表示
- 取引文表示 → 借方/貸方に「科目プルダウン＋金額入力」→「解答する」で自動採点
- 入力行数は問題ごとに `max(正解行数, 3)`（のれん・連結など4行の問題に対応）
- 「仕訳なし」が正解の問題は専用チェックで解答（空欄のまま提出は不正解）
- 採点は**順不同**、金額はカンマ・全角・￥を吸収（`1,300` ＝ `1300`）
- 正誤バッジ＋正解の仕訳表を表示、不正解は「もう一度解く」
- 1問ずつ連続出題、前/次ナビ
- 進捗（正答率・解答済み数・再開位置）を**問題集ごとに** localStorage へ保存、リセット可
- ライト/ダーク対応、レスポンシブ

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー（<http://localhost:3000>） |
| `npm run build` | 本番ビルド |
| `npm start` | 本番サーバー |
| `npm run lint` | ESLint |
| `node scripts/convert-2kyu.mjs` | `docs/2級/*.md` から2級の問題データを再生成 |

## 検証済み

- `npm run build` ✅（型チェック・14ページの静的生成成功）
- `npm run lint` ✅（エラー0・警告0）
- 全205問の貸借一致／正解科目が候補に含まれることを機械チェック ✅
- ブラウザ実機で級選択・問題集一覧・出題・採点・「仕訳なし」・4行入力・進捗の反映・旧 `v2` 進捗からの移行を確認 ✅

## 技術スタック

Next.js 16（App Router）/ TypeScript / Tailwind CSS v4

## 参考

出題形式は [いぬぼき 2級 仕訳問題](https://inuboki.com/2q-siwake/) を参考にしています。詳細は [docs/DESIGN.md](docs/DESIGN.md#参考にしたサイト) を参照。
