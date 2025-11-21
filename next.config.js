/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // output: 'export' 제거 - API Routes 사용을 위해 필요
  trailingSlash: false,

  // 이미지 최적화 설정
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

