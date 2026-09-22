// next.config.js
/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  // Link curto da casa (bio, Google, anúncios) → jornada de reserva v2 já com origem marcada
  async redirects() {
    return [
      // o link principal de reservas cai direto na jornada nova; a query (utm, unit) passa junto
      { source: '/', destination: '/reserva', permanent: false },
      // a experiência nova assume a rota antiga
      { source: '/reservar', destination: '/reserva', permanent: false },
      { source: '/sobradinho', destination: '/reserva?utm_source=link-sobradinho', permanent: false },
      { source: '/mesa', destination: '/reserva?utm_source=link-mesa', permanent: false },
    ];
  },

  // Proxy só em desenvolvimento
  async rewrites() {
    if (!isDev) return [];
    return [
      {
        source: '/api/:path*',
        destination: 'http://api2.sobradinhoporks.com.br/:path*',
      },
    ];
  },

  // Permite carregar imagens hospedadas na API
  images: {
    remotePatterns: [
      // produção
      { protocol: 'https', hostname: 'api2.sobradinhoporks.com.br' },
      // dev/local
      { protocol: 'http', hostname: 'localhost', port: '4000' },
    ],
  },
};

module.exports = nextConfig;
