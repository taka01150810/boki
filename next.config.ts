import type { NextConfig } from "next";

// GitHub Pages は https://taka01150810.github.io/boki/ のサブパス配信のため、
// 本番ビルド時のみ basePath を付ける（ローカル dev は "/" のまま動かす）。
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // 静的HTMLとして out/ に書き出す（GitHub Pages で配信できる形式）。
  output: "export",
  // リポジトリ名のサブパス配下で配信するための設定。
  basePath: isProd ? "/boki" : undefined,
  // 静的エクスポートでは next/image の最適化サーバーが使えないため無効化。
  images: { unoptimized: true },
  // ディレクトリ単位で index.html を出力し、サブパス配信でのリンク切れを防ぐ。
  trailingSlash: true,

  // localhost 以外（LAN IP など）から dev サーバーへアクセスする際、
  // HMR の WebSocket や dev アセットがブロックされないよう許可するオリジン。
  // スマホ実機テストで使う IP を列挙する。
  allowedDevOrigins: ["192.168.1.50", "192.168.105.1"],
};

export default nextConfig;
