/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // 목데이터 전용 원격 호스트. @PORT(api): 실서버 이식 시 cdn.klow.kr / R2 pub 도메인을 추가한다.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // 홈 샘플 프로그램 섹션의 분위기 사진(어두운 바닥의 앰버 세럼). 브랜드 사진이 아니라 연출용.
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [96, 128, 256, 384],
  },
};

module.exports = nextConfig;
