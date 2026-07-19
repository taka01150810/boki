# 簿記3級 仕訳 一問一答

日商簿記3級の**仕訳問題**を1問ずつ解いて答え合わせできる学習アプリ。
取引文を読み、借方・貸方の勘定科目（プルダウン）と金額を入力して「解答する」を押すと、自動採点して正誤と正解の仕訳を表示します。

## 動かすには

```bash
npm install       # 依存インストール（初回のみ）
npm run dev       # 開発サーバー起動 → http://localhost:3000
```

## 構成

### アプリ本体

| ファイル | 役割 |
| --- | --- |
| [src/app/page.tsx](src/app/page.tsx) | トップページ |
| [src/app/layout.tsx](src/app/layout.tsx) | `lang="ja"`・メタデータ |
| [src/components/JournalQuiz.tsx](src/components/JournalQuiz.tsx) | 出題・入力・採点・結果表示 |
| [src/data/types.ts](src/data/types.ts) | 型定義 |
| [src/data/journal-questions.ts](src/data/journal-questions.ts) | 3級 仕訳15問 |
| [src/lib/grading.ts](src/lib/grading.ts) | 金額正規化・順不同採点 |
| [src/lib/useProgress.ts](src/lib/useProgress.ts) | localStorage 進捗管理 |

### ドキュメント

| ファイル | 役割 |
| --- | --- |
| [docs/DESIGN.md](docs/DESIGN.md) | 設計判断・採点ロジック・構成・拡張候補 |
| [docs/boki3-workbook-01.md](docs/boki3-workbook-01.md) | 元データ（出典付き） |
| [README.md](README.md) | 概要とコマンド |

## 実装した機能

- 取引文表示 → 借方/貸方 各3行に「科目プルダウン＋金額入力」→「解答する」で自動採点
- 採点は**順不同**、金額はカンマ・全角・￥を吸収（`1,300` ＝ `1300`）
- 正誤バッジ＋正解の仕訳表を表示、不正解は「もう一度解く」
- 1問ずつ連続出題、前/次ナビ
- 進捗（正答率・解答済み数・再開位置）を localStorage に保存、リセット可
- ライト/ダーク対応、レスポンシブ

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー（<http://localhost:3000>） |
| `npm run build` | 本番ビルド |
| `npm start` | 本番サーバー |
| `npm run lint` | ESLint |

## 検証済み

- `npm run build` ✅（型チェック・静的生成成功）
- `npm run lint` ✅（エラー0）

## 技術スタック

Next.js 16（App Router）/ TypeScript / Tailwind CSS v4
