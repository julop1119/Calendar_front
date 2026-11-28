import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.example.calendar.app',
  appName: 'AI 캘린더',
  webDir: 'dist',
  // 앱 안에 번들을 넣지 않고, 배포된 실제 웹사이트를 그대로 띄운다.
  // 도메인/포트가 바뀌면 여기와 .env.production을 같이 수정 후 `npx cap sync android`.
  server: {
    url: 'https://cmled.synology.me:8443',
    cleartext: false,
  },
  // 네이티브(android WebView) 리사이즈 대신 body만 리사이즈하게 해서,
  // 키보드가 올라올 때 position:fixed 모달(바텀시트 등) 레이아웃이 깨지는 걸 막는다.
  plugins: {
    Keyboard: {
      resize: 'body',
    },
  },
}

export default config
