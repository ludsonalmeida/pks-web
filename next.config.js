// next.config.js
/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
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
