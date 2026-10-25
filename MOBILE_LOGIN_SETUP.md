# 모바일 Google 로그인 배포 설정

모바일 브라우저에서 인증 시작 정보가 사라지는 문제를 줄이기 위해 운영 사이트의 Firebase 인증 도메인을 `modumanjok.vercel.app`으로 통일합니다.
Vercel은 `/__/auth/*` 요청을 Firebase 인증 서버로 전달합니다. localhost 개발 환경은 기존 Firebase 인증 도메인을 사용합니다.

## 한 번 필요한 콘솔 설정

1. Firebase Authentication → 설정 → 승인된 도메인에서 `modumanjok.vercel.app`을 확인하고 없으면 추가합니다.
2. Google Cloud에서 Firebase 프로젝트 `modumanjok`을 선택합니다.
3. Google Auth Platform의 클라이언트 또는 API 및 서비스의 사용자 인증 정보에서 Firebase Google 로그인에 사용 중인 **웹 OAuth 클라이언트**를 엽니다. Firebase Authentication → 로그인 방법 → Google의 웹 SDK 구성에서 클라이언트 ID를 대조할 수 있습니다.
4. 승인된 JavaScript 원본에 `https://modumanjok.vercel.app`을 추가합니다.
5. 승인된 리디렉션 URI에 다음 주소를 추가하고 저장합니다. 기존 주소는 유지합니다.

   `https://modumanjok.vercel.app/__/auth/handler`

6. 수정한 `src/main.jsx`, `src/firebase.js`, `src/styles.css`, `vercel.json`을 GitHub에 반영하여 Vercel을 재배포합니다. 이 수정 때문에 환경변수 값을 바꿀 필요는 없습니다.
7. 휴대폰에서 기존에 오류가 뜬 firebaseapp.com 탭은 닫고, `https://modumanjok.vercel.app`에서 Google 로그인을 새로 시작합니다.

## 확인

- `/__/auth/iframe`이 앱 홈 HTML 대신 Firebase 인증 보조 페이지를 반환해야 합니다.
- 로그인 창에서 오류가 나면 정확한 오류와 Google OAuth 반환 주소 설정을 확인합니다.
- Google 버튼에는 Google 로그인 중일 때만, 비회원 버튼에는 비회원 로그인 중일 때만 로딩이 표시됩니다.
- 실제 휴대폰의 로그인 완료 및 새로고침 후 로그인 유지까지 확인합니다.

참고: https://firebase.google.com/docs/auth/web/redirect-best-practices#option-3-proxy-auth-requests-to-firebaseappcom
