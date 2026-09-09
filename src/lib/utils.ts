/** 클래스 결합. clsx / tailwind-merge 를 쓰지 않는 것도 klow_brand 관례다. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
