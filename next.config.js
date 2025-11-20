/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 정적 사이트 생성 (out 폴더에 출력)
  output: 'export',
  // 이미지 최적화 비활성화 (정적 export 시 필요)
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

