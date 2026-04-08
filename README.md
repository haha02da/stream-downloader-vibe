# StreamDownloader 🎥

강력한 오픈소스 엔진인 `yt-dlp`를 기반으로 한 웹 영상 다운로더입니다. 
유튜브, 트위치, 인스타그램, 틱톡 등 수천 개의 스트리밍 사이트에서 영상을 고화질로 다운로드할 수 있도록 돕습니다.

## ✨ 주요 기능

- **광범위한 지원**: `yt-dlp`가 지원하는 수천 개의 사이트와 호환.
- **메타데이터 분석**: 제목, 업로더, 재생 시간, 썸네일을 자동으로 추출.
- **포맷 선택**: 다양한 해상도와 포맷 정보를 제공.
- **현대적인 UI**: Next.js와 Tailwind CSS를 사용한 깔끔하고 직관적인 디자인.

## 🛠 필수 구성 요소 (Prerequisites)

이 애플리케이션은 서버(또는 로컬 환경)에 **`yt-dlp`**가 설치되어 있어야 작동합니다.

### 1. yt-dlp 설치

- **macOS (Homebrew 사용)**:
  ```bash
  brew install yt-dlp
  ```
- **Windows (Pip 사용)**:
  ```bash
  pip install yt-dlp
  ```
- **직접 바이너리 다운로드**: [yt-dlp GitHub Releases](https://github.com/yt-dlp/yt-dlp/releases)에서 운영체제에 맞는 바이너리를 다운로드하고 PATH에 추가하세요.

## 📦 설치 및 실행

1. **프로젝트 클론 및 종속성 설치**:
   ```bash
   git clone https://github.com/haha02da/stream-downloader-vibe.git
   cd stream-downloader
   npm install --force
   ```

2. **로컬 개발 서버 실행**:
   ```bash
   npm run dev
   ```

3. **브라우저 접속**:
   [http://localhost:3000](http://localhost:3000)으로 접속하여 사용하세요.

## ⚠️ 면책 조항 (Disclaimer)

이 도구는 개인적인 교육 및 백업 목적으로만 제작되었습니다. 
- 타인의 저작권을 침해하는 상업적 용도로 사용하지 마십시오.
- 각 스트리밍 서비스의 이용약관(TOS)을 준수할 책임은 사용자에게 있습니다.
- 저작권이 있는 콘텐츠의 불법 다운로드로 발생하는 모든 책임은 사용자 본인에게 있습니다.

## 🤝 기여하기

프로젝트에 버그를 발견하거나 기능을 추가하고 싶다면 Issue 또는 PR을 남겨주세요!
