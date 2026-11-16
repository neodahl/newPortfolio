# NeoDahl Portfolio

Vite, Pug, SCSS, and vanilla JavaScript로 만든 반응형 웹 퍼블리셔 포트폴리오입니다.

## 시작하기

```sh
npm install
npm run dev
```

프로덕션 빌드와 로컬 미리보기:

```sh
npm run build
npm run preview
```

## 콘텐츠 수정

- 페이지 문구와 프로젝트 카드는 `src/index.pug`에서 수정합니다. 프로젝트는 Career 안의 하위 영역이며, vendor에 보관한 Swiper의 원본 접근성·키보드·내비게이션 모듈을 사용해 터치·마우스 드래그와 이전/다음 버튼으로 탐색합니다. CDN은 사용하지 않습니다. 주요 스킬은 Skills 섹션에서 관리합니다.
- 스타일은 `src/styles/main.scss`에 작성합니다. `rem(30px auto 12px)`처럼 공백으로 나열된 값의 px만 rem으로 변환합니다. `auto`, `%`, `0`, 음수 값은 그대로 처리됩니다.
- 웹폰트는 `src/fonts/`의 로컬 WOFF2 파일을 사용합니다. Shantell Sans는 실제 사용 중인 400·500·600·700 굵기만 포함하고, 한글용 Hi Melody와 이메일 장식용 Yarndings 12 및 각 OFL 라이선스도 함께 관리합니다.
- 테마 설정, 스크롤에 따른 GNB와 반복 재생 애니메이션은 `src/scripts/main.js`에서 관리합니다.
- 프로젝트 이미지 URL은 실제 작업 이미지로 교체하고, 이미지 설명도 실제 화면을 설명하도록 함께 수정합니다.

## 오픈 소스 출처

- [Swiper](https://github.com/nolimits4web/swiper)는 제작자 Vladimir Kharlampidi의 `swiper@14.4.0` 원본 소스 중 현재 사용하는 코어와 모듈만 `src/scripts/vendor/swiper/`에 보관합니다. 라이브러리 파일은 수정하지 않고, 사용하는 모듈과 슬라이더 설정만 `src/scripts/main.js`에서 작성합니다. MIT 라이선스는 [`src/scripts/vendor/swiper/LICENSE`](./src/scripts/vendor/swiper/LICENSE)에 원본 그대로 포함되며, 배포용 사본은 [`public/licenses/swiper-MIT.txt`](./public/licenses/swiper-MIT.txt)입니다.

## GitHub Pages 배포

저장소의 `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 빌드와 배포를 진행합니다. 저장소 설정의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 선택하세요.

현재 저장소 이름(`newPortfolio`)을 기준으로 빌드 경로가 `/newPortfolio/`로 설정되어 있습니다.

## 접근성 메모

건너뛰기 링크, 시맨틱 영역과 제목 구조, 키보드 포커스 표시, 대체 텍스트, reduced-motion 설정을 포함했습니다. WCAG 2.2 AA 준수를 목표로 한 구현이며, 최종 배포 전 실제 콘텐츠와 색상 대비를 자동·수동으로 확인해 주세요.
