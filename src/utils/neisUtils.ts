/**
 * NEIS (교육행정정보시스템) 바이트 및 글자수 계산 유틸리티
 * 현대 NEIS 기준:
 * - 한글 1글자 = 3 바이트
 * - 영문, 숫자, 특수기호, 공백 = 1 바이트
 * - 줄바꿈(엔터) = 2 바이트
 * 과목별 세부능력 및 특기사항 한도 = 1,500 Byte (약 500자)
 */

export interface NeisByteCount {
  bytes: number;
  charsWithSpace: number;
  charsWithoutSpace: number;
  maxBytes: number;
  percentage: number;
  isOverLimit: boolean;
}

export function calculateNeisBytes(text: string, maxBytes: number = 1500): NeisByteCount {
  if (!text) {
    return {
      bytes: 0,
      charsWithSpace: 0,
      charsWithoutSpace: 0,
      maxBytes,
      percentage: 0,
      isOverLimit: false,
    };
  }

  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = text.charCodeAt(i);

    if (char === "\n") {
      bytes += 2; // 줄바꿈 2바이트
    } else if (char === "\r") {
      // ignore or count with \n
      continue;
    } else if (code > 127) {
      bytes += 3; // 한글 및 2바이트 이상 문자
    } else {
      bytes += 1; // 영문, 숫자, 반각기호, 공백
    }
  }

  const charsWithSpace = text.length;
  const charsWithoutSpace = text.replace(/\s/g, "").length;
  const percentage = Math.min(100, Math.round((bytes / maxBytes) * 100));
  const isOverLimit = bytes > maxBytes;

  return {
    bytes,
    charsWithSpace,
    charsWithoutSpace,
    maxBytes,
    percentage,
    isOverLimit,
  };
}

/**
 * 생활기록부 기재금지어 목록 및 탐지
 */
export const FORBIDDEN_WORDS = [
  // 공인어학시험
  { word: "TOEIC", category: "공인어학시험", reason: "교외 공인어학성적 기재 금지" },
  { word: "TOEFL", category: "공인어학시험", reason: "교외 공인어학성적 기재 금지" },
  { word: "TEPS", category: "공인어학시험", reason: "교외 공인어학성적 기재 금지" },
  { word: "토익", category: "공인어학시험", reason: "교외 공인어학성적 기재 금지" },
  { word: "토플", category: "공인어학시험", reason: "교외 공인어학성적 기재 금지" },
  { word: "텝스", category: "공인어학시험", reason: "교외 공인어학성적 기재 금지" },
  { word: "HSK", category: "공인어학시험", reason: "교외 공인어학성적 기재 금지" },
  { word: "JLPT", category: "공인어학시험", reason: "교외 공인어학성적 기재 금지" },

  // 교외 경시대회 및 수상실적
  { word: "올림피아드", category: "교외 수상실적", reason: "교외 경시대회 및 수상실적 기재 금지" },
  { word: "KMO", category: "교외 수상실적", reason: "한국수학올림피아드 등 교외대회 기재 금지" },
  { word: "경시대회", category: "교외 수상실적", reason: "교외 및 각종 대회 실적 기재 주의" },
  { word: "수학경시대회", category: "교외 수상실적", reason: "대회 관련 명칭 기재 금지" },
  { word: "논문", category: "논문 및 소논문", reason: "논문/소논문 실적 기재 금지" },
  { word: "소논문", category: "논문 및 소논문", reason: "소논문(R&E) 연구실적 기재 금지" },
  { word: "학술지", category: "논문 및 소논문", reason: "학술지 등재 등 외부 실적 기재 금지" },
  { word: "특허", category: "지식재산권", reason: "특허 및 실용신안 출원 기재 금지" },

  // 수능/모의고사 성적
  { word: "수능", category: "수능/모의고사", reason: "수능 및 모의평가 성적 언급 금지" },
  { word: "모의고사", category: "수능/모의고사", reason: "모의고사 등급 및 백분위 언급 금지" },
  { word: "전국연합", category: "수능/모의고사", reason: "전국연합학력평가 성적 기재 금지" },
  { word: "1등급", category: "정량적 평가", reason: "정량적 등급 언급 지양 (정성평가 중심)" },
  { word: "전교 1등", category: "정량적 평가", reason: "정량적 석차 기재 금지" },

  // 사교육/외부기관
  { word: "학원", category: "사교육 유발", reason: "사교육 기관 언급 금지" },
  { word: "과외", category: "사교육 유발", reason: "사교육 언급 금지" },
  { word: "영재교육원", category: "외부 기관", reason: "외부 영재교육원 실적 직접 기재 주의" },
];

export interface ForbiddenWordMatch {
  word: string;
  category: string;
  reason: string;
  index: number;
}

export function detectForbiddenWords(text: string): ForbiddenWordMatch[] {
  if (!text) return [];
  const matches: ForbiddenWordMatch[] = [];

  for (const item of FORBIDDEN_WORDS) {
    const regex = new RegExp(item.word, "gi");
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        word: item.word,
        category: item.category,
        reason: item.reason,
        index: match.index,
      });
    }
  }

  return matches;
}
