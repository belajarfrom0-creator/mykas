/** @type {import('next').NextConfig} */
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')

if (process.env.NEXT_PUBLIC_API_URL?.includes('example.com')) {
  throw new Error('NEXT_PUBLIC_API_URL masih menggunakan domain contoh. Isi dengan URL API VPS MyKas.')
}

if (process.env.NEXT_PUBLIC_APP_URL?.includes('example.com')) {
  throw new Error('NEXT_PUBLIC_APP_URL masih menggunakan domain contoh. Isi dengan URL frontend MyKas.')
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: blob: http://localhost:8000 https:; connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; font-src 'self' data:; form-action 'self'",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(':', ''),
        hostname: apiUrl.hostname,
        port: apiUrl.port,
      },
    ],
  },
};

module.exports = nextConfig;
