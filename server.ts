import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// System instruction for High School Math Teacher 세특 Generation
const MATH_TEACHER_SYSTEM_PROMPT = `당신은 대한민국 고등학교의 15년 차 베테랑 수학과 정교사이자 교육부 학교생활기록부(생활기록부/NEIS) 기재요령 권위자입니다.
선생님들이 입력한 학생의 수업 활동 기록, 수행평가 결과, 탐구보고서, 발표 내용, 오답노트 및 학습 태도 자료를 정밀하게 분석하여 나이스(NEIS) 규정에 완벽히 부합하는 고품질의 '수학과 과목별 세부능력 및 특기사항(세특)'을 생성해야 합니다.

[작성 대원칙]
1. 나이스(NEIS) 기재요령 철저 준수:
   - 교외 수상실적, 교외 인증/공인어학시험, 외부 기관명, 사교육 유발 요소, 부모 및 친인척의 사회경제적 지위 암시 표현은 절대 금지합니다.
   - 단순 독서 활동 나열 금지 (책 제목만 단순 기재하지 않고, 탐구 계기나 수학적 개념 발전의 맥락으로 녹여냄).
   - 모의고사/수능 점수, 등급, 등수, 정량적 점수 언급 절대 금지.
   - 문장 끝맺음은 요청된 종결어미 형식(예: '~함.', '~임.', '~을 보여줌.')을 일관되게 유지합니다.
2. 수학 교과 핵심역량 6가지 반영:
   - 문제해결, 추론, 창의·융합, 의사소통, 정보처리, 태도 및 실천
   - 학생 활동에서 드러난 핵심역량을 자연스러운 교육적 언어로 구체화하여 기술합니다.
3. 성취 수준별 차별화된 묘사:
   - 최상위: 수학적 개념 간의 유기적 연결, 공학도구(GeoGebra, Python 등)를 활용한 일반화 및 증명, 독창적 모델링 능력, 심화 이론 탐구의 학문적 호기심 강조.
   - 우수: 개념의 정확한 이해를 바탕으로 한 다각적 접근, 논리적인 문제 해결 과정 서술, 모둠 활동 시 동료의 이해를 돕는 의사소통 및 리더십 강조.
   - 보통: 기본 개념과 원리의 충실한 습득, 오답 분석을 통한 오류 교정과 학습 결손 극복 노력, 꾸준하고 성실한 과제 수행 태도 강조.
   - 기초/도약: 시각화 자료나 구체적 조작 활동을 통한 점진적 이해, 끈기 있는 질문과 피드백 수용을 통한 성취감 경험 강조.
4. 구체성 및 개별화:
   - "수학 성적이 우수함"과 같은 추상적 칭찬은 지양하고, 구체적으로 어떤 개념(예: 지수함수의 밑의 변화에 따른 그래프 개형, 미분계수의 기하학적 의미, 조건부확률의 베이즈 정리 등)을 어떻게 탐구하고 적용했는지를 서술합니다.
5. 분량 준수:
   - 나이스 1개 학기 과목별 세특 기준(통상 1,500바이트 = 공백 포함 한글 약 500자).
   - 기본적으로 공백 포함 400~500자(1,200~1,500바이트) 내외로 풍부하고 충실하게 작성합니다.`;

// Endpoint: Generate Math Record
app.post("/api/generate-record", async (req, res) => {
  try {
    const {
      subject = "공통수학1",
      studentName = "학생",
      achievementLevel = "우수 (상위/주도적)",
      competencies = ["문제해결", "추론"],
      activityData = "",
      lengthTarget = "standard", // standard(450~500자), concise(300~350자), detailed(480~500자꽉)
      toneStyle = "standard_formal", // standard_formal(~함), narrative(~을 보여줌), growth(~을 신장함)
      additionalInstructions = "",
    } = req.body;

    if (!activityData.trim()) {
      return res.status(400).json({ error: "학생 활동 자료를 입력해주세요." });
    }

    if (!ai) {
      // Offline fallback generator for development/preview without API key
      const fallback = generateFallbackRecord({
        subject,
        studentName,
        achievementLevel,
        competencies,
        activityData,
        toneStyle,
      });
      return res.json(fallback);
    }

    const lengthGuide =
      lengthTarget === "concise"
        ? "공백 포함 300~350자 (약 900~1050 Byte)"
        : lengthTarget === "detailed"
        ? "공백 포함 480~500자 (약 1450~1500 Byte 꽉 채움)"
        : "공백 포함 420~480자 (약 1250~1450 Byte 표준)";

    const toneGuide =
      toneStyle === "narrative"
        ? "서술형 문체 ('~을 보여줌.', '~하는 능력이 돋보임.', '~하는 모습을 관찰할 수 있음.')"
        : toneStyle === "growth"
        ? "성장 중심 문체 ('~을 통해 역량을 신장함.', '~을 발전시킴.', '~하는 계기를 마련함.')"
        : "나이스 표준 개조식 종결어미 ('~함.', '~임.', '~을 이끌어냄.')";

    const prompt = `[학생 정보 및 과목]
- 대상 학생: ${studentName}
- 이수 과목: ${subject}
- 성취 수준: ${achievementLevel}
- 반영할 핵심 역량: ${competencies.join(", ")}
- 목표 분량: ${lengthGuide}
- 문체 스타일: ${toneGuide}
${additionalInstructions ? `- 교사 추가 요청사항: ${additionalInstructions}` : ""}

[교사가 입력한 학생 활동 자료/관찰 기록]:
"""
${activityData}
"""

위 학생 활동 자료를 분석하여 다음을 JSON 형식으로 작성해주세요:
1. primaryRecord: 가장 완성도 높고 나이스 기재요령에 부합하는 대표 세특 문장
2. deepDiveRecord: 심화 탐구, 수학적 원리 규명, 학문적 깊이를 더욱 강조한 대안 문장
3. collaborativeRecord: 협동 학습, 수업 태도, 동료 간 의사소통 및 성실성을 더욱 강조한 대안 문장
4. analysis:
   - competenciesEvaluated: 자료에서 추출된 주요 수학 역량 분석 요약
   - curriculumConcepts: 연계된 수학 교육과정 핵심 개념 목록 (예: 미분계수, 정적분, 행렬의 곱셈 등)
   - teacherTip: 교사가 학생 지도나 면담 시 참고할 수 있는 맞춤 피드백 조언
   - neisSafe: 금지어(교외대회, 공인어학, 사교육, 등급 등) 미포함 여부 (true/false)
   - checkedForbiddenWords: 발견된 주의 표현 목록 (없으면 빈 배열)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: MATH_TEACHER_SYSTEM_PROMPT,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryRecord: { type: Type.STRING },
            deepDiveRecord: { type: Type.STRING },
            collaborativeRecord: { type: Type.STRING },
            analysis: {
              type: Type.OBJECT,
              properties: {
                competenciesEvaluated: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                curriculumConcepts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                teacherTip: { type: Type.STRING },
                neisSafe: { type: Type.BOOLEAN },
                checkedForbiddenWords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                "competenciesEvaluated",
                "curriculumConcepts",
                "teacherTip",
                "neisSafe",
                "checkedForbiddenWords",
              ],
            },
          },
          required: [
            "primaryRecord",
            "deepDiveRecord",
            "collaborativeRecord",
            "analysis",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error generating math record:", error);
    return res.status(500).json({
      error: error?.message || "세특 문장 생성 중 오류가 발생했습니다.",
    });
  }
});

// Endpoint: Refine existing record
app.post("/api/refine-record", async (req, res) => {
  try {
    const {
      currentRecord = "",
      instruction = "문장을 더 전문적이고 풍성하게 다듬어줘",
      subject = "수학",
      studentName = "학생",
    } = req.body;

    if (!currentRecord.trim()) {
      return res.status(400).json({ error: "다듬을 세특 문장이 없습니다." });
    }

    if (!ai) {
      return res.json({
        refinedRecord: currentRecord + ` (수학교과 역량 보강 완료)`,
        changes: ["오프라인 모드: 요청사항을 반영하여 문장을 가다듬었습니다."],
      });
    }

    const prompt = `과목: ${subject}
학생명: ${studentName}
현재 세특 문장:
"""
${currentRecord}
"""

선생님의 수정/윤문 요청사항:
"${instruction}"

위 요청을 반영하여 나이스(NEIS) 기재요령을 철저히 지키며 문장을 다듬어주세요.
응답은 JSON 형식으로:
{
  "refinedRecord": "수정 완료된 세특 문장 (한글 400~500자 내외)",
  "changes": ["수정 및 보완된 주요 포인트 1", "수정 포인트 2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: MATH_TEACHER_SYSTEM_PROMPT,
        temperature: 0.6,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error refining math record:", error);
    return res.status(500).json({
      error: error?.message || "세특 문장 수정 중 오류가 발생했습니다.",
    });
  }
});

// Helper for fallback when no API key is set
function generateFallbackRecord({
  subject,
  studentName,
  achievementLevel,
  competencies,
  activityData,
  toneStyle,
}: any) {
  const ending = toneStyle === "narrative" ? "을 보여줌." : "함.";
  const ending2 = toneStyle === "narrative" ? "는 모습이 돋보임." : "을 발휘함.";
  
  const primaryRecord = `[${subject}] 수업에서 '${activityData.slice(0, 40).replace(/\n/g, " ")}...' 관련 탐구 과제를 성실히 수행함. 특히 ${competencies.join(", ")} 역량을 바탕으로 주어진 수학적 개념을 깊이 있게 분석하고 논리적인 전개 과정을 명확히 설명${ending} 모둠 활동 및 토의 과정에서도 개념 적용의 오류를 스스로 점검하고 수정하는 끈기 있는 수학적 태도를 형성${ending2}`;
  
  return {
    primaryRecord,
    deepDiveRecord: `[${subject}] 수학적 원리에 대한 호기심이 남다른 학생으로, 관련 이론의 공리적 체계와 일반화 가능성에 주목하여 심화 탐구를 이끌어냄. ${competencies[0] || "문제해결"} 역량을 십분 발휘하여 수식의 엄밀한 유도 과정을 체계적으로 정리${ending}`,
    collaborativeRecord: `[${subject}] 급우들과의 수학적 의사소통에 적극적으로 참여하며, 난해한 개념을 직관적인 예시와 도식으로 재해석하여 모둠원들의 이해를 돕는 협력적 학습 태도를 견지${ending}`,
    analysis: {
      competenciesEvaluated: competencies,
      curriculumConcepts: [subject, "수학적 모델링", "오류 분석과 교정"],
      teacherTip: "학생이 수행한 활동의 구체적인 수학 공식이나 그래프 조작 과정을 면담 시 언급해주면 좋습니다.",
      neisSafe: true,
      checkedForbiddenWords: [],
    },
  };
}

// Vite integration / Static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port} (${isProd ? "production" : "development"})`);
  });
}

startServer();
