# GitHub 저장소(gajungsj-beep/nutrition) 자동 푸시 연동 계획

선생님의 GitHub 계정(`gajungsj-beep`)의 `nutrition` 원격 저장소로 현재 완성된 '수학 세특 마스터' 애플리케이션의 최신 커밋 코드를 안전하게 자동 푸시하기 위한 실행 계획입니다.

### User Review & Critical Decisions

> [!IMPORTANT]
> **확정된 결정**: 선생님께서 **GitHub Personal Access Token (PAT)**을 통한 자동 푸시 방식을 선택하셨습니다.
> 보안상 토큰이 영구 저장되거나 git log에 남지 않도록 일회성 인증 방식으로 안전하게 원격 푸시를 진행합니다.

- **원격 저장소 대상**: `https://github.com/gajungsj-beep/nutrition.git`
- **푸시 대상 브랜치**: `main`
- **커밋 상태**: 모든 파일 정상 커밋 완료 (`feat: 고등학교 수학교사용 세특 마스터 앱 구현 및 NEIS 바이트 규정 문체 교정 오류 수정`)

---

### 1. Overview & Core Concept

- **목표**: GitHub 인증을 통과하여 `gajungsj-beep/nutrition` 저장소로 코드베이스 전체를 원격 동기화
- **안전성**: 토큰은 푸시 명령 실행에만 사용되며, git config 파일이나 코드 파일 내부에 노출되지 않도록 처리

---

### 2. 푸시 실행 단계 (Execution Steps)

```
┌────────────────────────────────────────────────────────┐
│ 1. GitHub Personal Access Token (Fine-grained or Classic)│
│    - 권한: Contents (Read and Write) 필요                │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. 임시 인증 URL로 원격 푸시 수행                      │
│    https://<TOKEN>@github.com/gajungsj-beep/nutrition.git│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. 원격 origin URL 원복 (토큰 잔류 방지)               │
│    https://github.com/gajungsj-beep/nutrition.git      │
└────────────────────────────────────────────────────────┘
```

1. **토큰 입력 안내 및 수신**:
   - GitHub 설정(Settings > Developer Settings > Personal access tokens)에서 생성한 토큰을 입력받습니다.
2. **원격 푸시 실행**:
   - `git push https://<TOKEN>@github.com/gajungsj-beep/nutrition.git main:main`
3. **자격 증명 정리 및 원격 주소 표준화**:
   - 푸시 완료 후 원격 저장소 URL을 기본 공개 URL(`https://github.com/gajungsj-beep/nutrition.git`)로 유지하여 보안을 확보합니다.
4. **결과 확인**:
   - 원격 브랜치 반영 여부 및 최신 커밋 해시 검증.
