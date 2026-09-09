import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O <rebill-checkout> cria uma sessão de pagamento de verdade a cada
  // montagem — o duplo-mount do Strict Mode (só em dev) estava criando
  // duas sessões conflitantes e quebrando o formulário visualmente.
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
