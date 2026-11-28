import { Capacitor } from '@capacitor/core'

/**
 * capacitor.config.ts에서 Keyboard resize를 'body'로 쓰면 레이아웃이 안 깨지는 대신,
 * 네이티브가 원래 해주던 "포커스된 입력창을 키보드 위로 자동 스크롤"이 사라진다.
 * 모든 input/textarea에 포커스가 갈 때 수동으로 보이는 위치로 스크롤해서 보완한다.
 */
export function setupKeyboardScrollFix(): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {}
  }

  const handleFocusIn = (event: FocusEvent) => {
    const target = event.target as HTMLElement | null
    if (!target) {
      return
    }
    const tag = target.tagName
    if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
      return
    }
    // 키보드가 올라오는 애니메이션 시간(대략) 이후에 스크롤해야 위치가 맞다.
    setTimeout(() => {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 300)
  }

  document.addEventListener('focusin', handleFocusIn)
  return () => document.removeEventListener('focusin', handleFocusIn)
}
