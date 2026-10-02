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
        bone: 'rgb(var(--c-bone) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        sub: 'rgb(var(--c-sub) / <alpha-value>)',
        mute: 'rgb(var(--c-mute) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        field: 'rgb(var(--c-field) / <alpha-value>)',
        // ⚠️ accent 계열은 이제 잉크와 같은 값이다(보라를 걷어냈다). 이름은 이전 코드와의
        //    호환을 위해서만 남긴다 — 새 코드는 ink 를 쓴다.
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
      spacing: { 15: '3.75rem', 25: '6.25rem', 30: '7.5rem' },
      // ⚠️ 라운딩은 없다. 모든 면·버튼·입력·모달이 직각이다(원은 아바타·상태점뿐).
      //    rounded-[10px] · rounded-xl2 같은 값을 새로 쓰지 말 것.
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
        rise: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drawer: {
          '0%': { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
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
        rise: 'rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        drawer: 'drawer 0.36s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
