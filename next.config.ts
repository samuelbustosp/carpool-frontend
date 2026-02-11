/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  swSrc: 'src/service-worker.js', 
})

module.exports = withPWA({
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "carpool-media.5dce6dd8fd2b8c12742c81bbb251a9ca.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-15165322192045ea9751c967a7ea3853.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "carpool-app.5dce6dd8fd2b8c12742c81bbb251a9ca.r2.cloudflarestorage.com",
        pathname: "/**",
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/ws/:path*',
        destination: 'http://vps-5436481-x.dattaweb.com:8080/carpool/api/v1/ws/:path*',
      },
    ];
  },
})