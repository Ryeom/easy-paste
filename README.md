# ✨ Easy Paste 

Obsidian에 필요한 내용을 단순한 **버튼 클릭**만으로 쉽게 붙여넣을 수 있는 플러그인입니다.  
반복적인 날짜, 텍스트, 이모지, 색상 등의 정보를 빠르게 입력해 문서화(Documentation)를 더 일관성 있게 만들어줍니다.

---

## 📌 주요 기능 (Features)

- 📅 **날짜 템플릿 삽입 (Date Templates)**
  - `today`, `file_created_at` 등 다양한 날짜 키워드 지원
  - 원하는 형식(format) + 접두어(prefix) + 접미어(suffix) 조합

- ✍️ **커스텀 텍스트 스니펫 (Text Snippets)**
  - 자주 쓰는 문구, 이모지 등을 저장하고 클릭 한 번으로 삽입

- 🎨 **컬러 값 태그 (Color Tags)**
  - 색상과 설명이 포함된 버튼 생성 → 클릭하면 색상 코드(`#hex`) 삽입

- 🖱️ **Click 또는 키보드 조작 (추후반영)**
  - 버튼을 클릭하거나, 방향키로 선택하여 붙여넣기

---

## ⚙️ 사용 방법 (How to Use)

1. **Settings > My Easy Paste for Consistent Documentation** 이동
2. `Date`, `List`, `Palette` 탭에서 항목 추가
3. 우측 사이드바 탭에서 버튼 확인 및 사용

- 클릭: 커서 위치에 텍스트 삽입  
- 드래그: 마크다운 문서 내 원하는 위치로 텍스트 끌어넣기

---

## 🔧 설치 방법 (Installation)

### 1. GitHub에서 직접 설치 (Manual Install)
```bash
git clone https://github.com/Ryeom/easy-paste.git
cd easy-paste
npm install
npm run build
```

빌드 후 생성된 `main.js`, `manifest.json`, `styles.css`를  
`YOUR_VAULT/.obsidian/plugins/easy-paste` 폴더에 복사한 뒤  
**Obsidian > Settings > Community Plugins** 에서 플러그인을 활성화하세요.

---

## 📐 날짜 포맷 예시 (Date Format Example)

사용 가능한 포맷 토큰:

| 포맷 | 설명          |
|------|---------------|
| `YYYY` | 연도 (e.g. 2025) |
| `MM`   | 월 (01–12)     |
| `DD`   | 일 (01–31)     |
| `hh`   | 시 (00–23)     |
| `mm`   | 분            |
| `ss`   | 초            |

예시:
```
prefix: 🗓  
format: YYYY.MM.DD hh:mm:ss  
suffix: created

→ 🗓 2025.05.19 16:12:45 created
```

---

## ✅ 현재 구현된 기능 (Implemented)

- [x] 커스터마이징 가능한 날짜 버튼
- [x] 텍스트/문장 버튼 추가 및 클릭/삽입
- [x] 컬러 버튼 생성 및 삽입
- [x] 커서 위치 자동 인식 후 삽입
- [x] 드래그 앤 드롭 지원
- [x] 다크모드 대응 UI
- [x] `file_created_at` 같은 파일 정보 기반 기능

---

## 🚀 앞으로 구현 예정 (Planned Features)

- [ ] 키보드 방향키로 포커싱 후 paste 
- [ ] `file_modified_at`, `file_name`, `file_path` 등 추가 메타데이터 지원
- [ ] 사용자가 버튼 그룹을 만들고 묶을 수 있는 구조
- [ ] preset 템플릿 import/export 기능

---

## 🙌 크레딧 (Credits)

개발자: [Ryeom]  
Obsidian API 및 커뮤니티 플러그인 문서 기반으로 개발  
피드백과 제안은 언제든 환영합니다!

---

## 📄 라이센스 (License)

MIT License
