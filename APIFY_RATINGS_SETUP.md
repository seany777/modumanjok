# 네이버 매장 평점 연결

## 해야 할 일

1. https://console.apify.com/account/integrations 에서 API 토큰을 확인합니다. 토큰은 채팅이나 GitHub에 올리지 않습니다.
2. Vercel 프로젝트 → Settings → Environment Variables에 다음 변수를 추가합니다.
   - Key: `APIFY_API_TOKEN`
   - Value: Apify에서 복사한 실제 API 토큰
   - Type: Secret
   - Environment: Production, 필요한 경우 Preview
   - `VITE_` 접두사는 붙이지 않습니다.
3. Apify 계정에 이 Actor를 실행할 권한과 사용 가능한 크레딧이 있는지 확인합니다. 비용 제한도 설정합니다.
4. `api/restaurant-rating.js`, `vercel.json`, `src/main.jsx`, `src/styles.css`를 GitHub에 반영하고 Vercel을 재배포합니다.
5. 매장 상세 또는 식사 준비 완료 화면에서 **네이버 평점 확인**을 누릅니다.

## 동작 및 비용 관리

- Actor: `parsebird/naver-place-review-scraper-korean` (`xvg44GCreVkeViPQ8`).
- 화면을 그리거나 스크롤할 때는 실행하지 않고, 사용자가 평점을 확인할 때만 실행합니다.
- 한 번에 매장 1개, 방문자 리뷰 최대 1개와 매장 통계만 요청합니다. 블로그 리뷰와 사진 수집은 끕니다.
- 표시하는 평점은 `averageRating` 또는 `placeRating`입니다. 개별 리뷰 1개의 점수를 매장 평균처럼 사용하지 않습니다.
- 검색된 매장의 이름과 주소가 일치해야 평점을 표시합니다. 다른 지점이나 확인 불가능한 주소의 점수는 표시하지 않습니다.
- 별점을 제공하지 않는 매장은 별점 미제공으로 표시합니다.
- 성공 및 미제공 결과는 브라우저 세션 저장소와 서버 인스턴스 메모리에 24시간 캐시합니다. Vercel CDN에도 24시간 캐시를 요청합니다.
- 동일 매장에 대한 중복 요청은 같은 브라우저 및 서버 인스턴스 안에서 합칩니다. 서버 재시작·여러 인스턴스 사이의 전역 잠금은 없으므로 엄격한 전체 비용 제한은 Apify 계정에서 설정해야 합니다.
- 서버 인스턴스 기준 사용자당 시간당 20회 신규 조회, 동시 수집 2개 제한을 둡니다. Firebase 로그인 토큰을 확인하며 비회원 계정도 지원합니다.
- Actor 실행에는 `maxTotalChargeUsd=0.01`, `timeout=35`, 자동 재시작 끄기를 전달합니다. 제한 때문에 실행이 끝나지 못하면 가짜 평점을 만들지 않고 조회 실패로 표시합니다.
- 현재 로컬 Vite 개발 서버에는 이 Vercel 함수가 자동 실행되지 않습니다. 실제 조회는 Vercel 배포 또는 Vercel 개발 환경에서 확인합니다.

참고: https://apify.com/parsebird/naver-place-review-scraper-korean
