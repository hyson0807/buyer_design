import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // 색은 전부 globals.css 의 CSS 변수(rgb 채널)를 참조한다 — klow_brand 관례.
      // `<alpha-value>` 자리표시자 덕분에 `text-sub/70` 같은 알파 변형이 그대로 동작한다.
      // ⚠️ klow_brand 와 달리 스코프가 하나뿐이라 `.auth-scope` 이중 토큰은 두지 않는다.
      colors: {
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        sub: 'rgb(var(--c-sub) / <alpha-value>)',
        mute: 'rgb(var(--c-mute) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        field: 'rgb(var(--c-field) / <alpha-value>)',
        // ⚠️ accent 와 accent-strong 을 나눈 이유는 접근성이다.
        // 흰 글씨 on #8F5CFF = 4.08:1 (AA 본문 4.5 미달) / on #7C3AED = 5.70:1 (통과).
        // 흰 글씨를 얹거나 텍스트 색으로 쓸 땐 accent-strong, 배경 틴트·테두리·포커스링·
        // 상태점에만 accent 를 쓴다. #7C3AED 는 klow_web 팔레트의 brand-mintInk 와 같은 값.
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-strong': 'rgb(var(--c-accent-strong) / <alpha-value>)',
        'accent-pale': 'rgb(var(--c-accent-pale) / <alpha-value>)',
        ok: 'rgb(var(--c-ok) / <alpha-value>)',
        danger: 'rgb(var(--c-danger) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard Variable', 'Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'Pretendard Variable', '-apple-system', 'system-ui', 'sans-serif'],
      },
      // ⚠️ Tailwind 3 기본 스케일에 px-15 / gap-25 가 없다(v4 의 동적 스케일이 생성해 주는 값).
      //    cosmed-web 의 여백 공식을 그대로 쓰려면 여기 등록해야 한다.
      spacing: { 15: '3.75rem', 25: '6.25rem' },
      // radius 는 세 값만 존재한다: 0(홈 그리드 이미지) / 10px(카드·인풋·버튼·칩) / 20px(모달·패널).
      borderRadius: { xl2: '20px' },
      // 그림자는 모달 하나뿐. 카드는 그림자 0 — 갤러리 룩의 전제다.
      boxShadow: { pop: '0 24px 60px -20px rgba(24, 24, 27, 0.28)' },
      // ⚠️ duration-400 도 v3 기본에 없다. cosmed 카드의 hover 전환에 쓴다.
      transitionDuration: { 400: '400ms' },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        pop: 'pop 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
