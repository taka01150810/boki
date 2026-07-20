import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // localhost 以外（LAN IP など）から dev サーバーへアクセスする際、
  // HMR の WebSocket や dev アセットがブロックされないよう許可するオリジン。
  // スマホ実機テストで使う IP を列挙する。
  allowedDevOrigins: ["192.168.1.50", "192.168.105.1"],
};

export default nextConfig;
