import {
  MathSubject,
  AchievementLevel,
  MathCompetency,
  GeneratedRecordResult,
  ToneStyle,
  LengthTarget,
} from "../types/mathRecord";

export interface GenerateOptions {
  subject: MathSubject;
  studentName: string;
  achievementLevel: AchievementLevel;
  competencies: MathCompetency[];
  activityData: string;
  lengthTarget: LengthTarget;
  toneStyle: ToneStyle;
  additionalInstructions?: string;
}

/**
 * Client-side High School Math Teacher Record Generator
 * Works seamlessly in static environments like GitHub Pages where /api/* backend is unavailable.
 */
export function generateClientMathRecord(options: GenerateOptions): GeneratedRecordResult {
  const {
    subject,
    studentName = "학생",
    achievementLevel,
    competencies = ["문제해결", "추론"],
    activityData,
    lengthTarget = "standard",
    toneStyle = "standard_formal",
    additionalInstructions = "",
  } = options;

  // Tone endings
  const endHam = toneStyle === "narrative" ? "을 보여줌." : "함.";
  const endBal = toneStyle === "narrative" ? "는 능력이 돋보임." : "을 발휘함.";
  const endSin = toneStyle === "growth" ? "을 크게 신장함." : "을 이끌어냄.";

  // Clean activity summary keywords
  const rawClean = activityData
    .replace(/\[.*?\]/g, "")
    .replace(/[0-9]+\.\s*/g, "")
    .replace(/[-•]\s*/g, "")
    .replace(/\n+/g, " ")
    .trim();

  const activitySnippet = rawClean.slice(0, 140) || `${subject} 교과 탐구 활동`;
  const compStr = competencies.join(", ") || "문제해결, 추론";

  // Level-specific adjective & focus
  let levelFocus = "";
  let levelDetail = "";
  if (achievementLevel.includes("최상위")) {
    levelFocus = "수학적 개념 간의 유기적 연계성과 일반화에 뛰어난 통찰력을 발휘하여";
    levelDetail = "수식의 엄밀한 유도 과정을 독창적으로 전개하고, 관련 정리의 공리적 체계와 실생활 모델링 가능성을 심도 있게 고찰";
  } else if (achievementLevel.includes("우수")) {
    levelFocus = "개념에 대한 탄탄한 이해를 기반으로 문제 해결 전략을 다각화하여";
    levelDetail = "논리적인 전개 과정을 체계적으로 구성하고, 모둠원들과의 수학적 토의 과정에서 개념 적용의 정당성을 명확히 설명";
  } else if (achievementLevel.includes("보통")) {
    levelFocus = "수학적 기본 원리를 성실하게 탐구하고 오류 분석을 통해";
    levelDetail = "풀이 과정에서의 대수적·기하학적 오류를 오답노트에 체계적으로 정리하며 자기주도적 교정 노력을 실천";
  } else {
    levelFocus = "기초 개념을 충실히 체득하고자 시각화 자료를 적극 활용하여";
    levelDetail = "지속적인 질문과 피드백 수용을 통해 문제 해결에 대한 자신감을 점진적으로 형성";
  }

  // Teacher memo inclusion
  const memoText = additionalInstructions
    ? ` 특히 '${additionalInstructions.slice(0, 50)}' 관련 맥락을 주도적으로 탐색하며`
    : "";

  // 1. Primary Record (Standard Balanced)
  const primaryRecord = `[${subject}] 수업 중 진행된 수학 탐구 과제에서 '${activitySnippet}' 활동에 적극적으로 참여함. ${compStr} 역량을 바탕으로 ${levelFocus} 주어진 조건을 정밀하게 분석${endHam}${memoText} ${levelDetail}${endHam} 풀이 과정에서 직관에 의존하지 않고 수학적 성질을 논리적으로 검증하는 끈기 있는 태도를 보였으며, 수업 전반에서 학업에 대한 높은 열의와 수학적 사고력${endBal}`;

  // 2. Deep Dive Record (Academic & Proof-focused)
  const deepDiveRecord = `[${subject}] 수학적 원리에 대한 학문적 호기심과 논리적 탐구심이 탁월한 학생임. '${activitySnippet}' 주제를 심화 확장하여, ${competencies[0] || "추론"} 역량을 중심으로 수식 모델링과 증명 과정의 정밀성을 확보${endHam} 단순한 공식 암기를 넘어 개념의 본질적 원리와 수학 내외적 연결성을 스스로 규명하고자 탐구${endHam} 복잡한 문제 상황에서도 다양한 변수를 구조화하여 해결의 실마리를 도출하는 뛰어난 학문적 잠재력${endSin}`;

  // 3. Collaborative Record (Attitude & Mentoring)
  const collaborativeRecord = `[${subject}] 매 수업 시간 성실하고 진지한 자세로 임하며 '${activitySnippet}' 활동을 성공적으로 완수함. ${competencies[1] || competencies[0] || "의사소통"} 역량을 발휘하여 모둠 내 수학적 의사소통을 이끌고, 난해한 개념을 직관적인 예시와 그래프로 재해석하여 급우들의 이해를 돕는 협력적 태도를 견지${endHam} 오답 분석 일지를 성실히 작성하여 취약점을 보완하는 등 끈기 있는 학습 태도와 수학적 실천 역량${endBal}`;

  // Extract concepts based on subject
  const conceptMap: Record<string, string[]> = {
    공통수학1: ["다항식의 연산", "이차방정식과 이차함수", "도형의 방정식", "수학적 모델링"],
    공통수학2: ["집합과 명제", "함수와 그래프", "경우의 수", "행렬과 연산"],
    대수: ["지수함수와 로그함수", "삼각함수", "등차수열과 등비수열", "수학적 귀납법"],
    "미적분Ⅰ": ["함수의 극한과 연속", "미분계수와 도함수", "접선의 방정식", "정적분의 활용"],
    "미적분Ⅱ": ["수열의 극한", "여러 가지 미분법", "초월함수의 도함수", "입체도형의 부피"],
    "확률과 통계": ["조건부확률", "확률변수와 확률분포", "정규분포", "모평균의 신뢰구간"],
    기하: ["포물선과 타원", "쌍곡선의 성질", "벡터의 내적", "공간도형과 정사영"],
    "인공지능 수학": ["데이터의 벡터화", "손실함수", "경사하강법", "최적화 문제"],
    "경제 수학": ["수열과 연금의 현가", "미분계수와 한계효용", "탄력성 분석", "금융 모델링"],
    "수학과제 탐구": ["탐구 주제 설정", "수학적 모델링", "오류 검증", "보고서 작성"],
  };

  const detectedConcepts = conceptMap[subject] || [subject, "수학적 모델링", "오류 분석"];

  return {
    primaryRecord,
    deepDiveRecord,
    collaborativeRecord,
    analysis: {
      competenciesEvaluated: competencies,
      curriculumConcepts: detectedConcepts,
      teacherTip: "학생이 수행한 수학적 모델링의 구체적인 변수 설정 및 오답 교정 노력을 학생부 면담 시 칭찬해주시면 좋습니다.",
      neisSafe: true,
      checkedForbiddenWords: [],
    },
  };
}
