import React, { useState } from "react";
import {
  MathSubject,
  AchievementLevel,
  MathCompetency,
  GeneratedRecordResult,
  ToneStyle,
  LengthTarget,
  StudentItem,
} from "../types/mathRecord";
import { MATH_PRESETS, MathPreset } from "../data/mathPresets";
import { calculateNeisBytes, detectForbiddenWords } from "../utils/neisUtils";
import { generateClientMathRecord } from "../utils/clientRecordGenerator";
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  Send,
  Save,
  Wand2,
  Layers,
  ChevronDown,
} from "lucide-react";

interface SingleStudentGeneratorProps {
  onSaveToClass: (student: StudentItem) => void;
}

const SUBJECT_LIST: MathSubject[] = [
  "공통수학1",
  "공통수학2",
  "대수",
  "미적분Ⅰ",
  "미적분Ⅱ",
  "확률과 통계",
  "기하",
  "인공지능 수학",
  "경제 수학",
  "수학과제 탐구",
];

const ACHIEVEMENT_LEVELS: {
  level: AchievementLevel;
  badge: string;
  color: string;
  desc: string;
}[] = [
  {
    level: "최상위 (탁월/심화탐구)",
    badge: "최상위",
    color: "border-purple-300 bg-purple-50 text-purple-900 active:ring-purple-500",
    desc: "개념 간의 심화 연결, 일반화 및 증명, 독창적 수학 모델링",
  },
  {
    level: "우수 (상위/주도적)",
    badge: "우수",
    color: "border-blue-300 bg-blue-50 text-blue-900 active:ring-blue-500",
    desc: "개념의 다각적 응용, 논리적 해결 과정, 수업 발표 및 토의 주도",
  },
  {
    level: "보통 (성실/성장형)",
    badge: "보통",
    color: "border-emerald-300 bg-emerald-50 text-emerald-900 active:ring-emerald-500",
    desc: "기본 공식과 개념의 충실한 적용, 오답 분석을 통한 오류 교정",
  },
  {
    level: "기초 (노력/잠재력)",
    badge: "기초",
    color: "border-amber-300 bg-amber-50 text-amber-900 active:ring-amber-500",
    desc: "시각화 및 조작 도구를 통한 점진적 이해, 질문을 통한 피드백 수용",
  },
];

const COMPETENCIES_LIST: {
  name: MathCompetency;
  icon: string;
  summary: string;
}[] = [
  { name: "문제해결", icon: "💡", summary: "문제 인식, 해결 전략 수립 및 대안 탐색" },
  { name: "추론", icon: "🔍", summary: "논리적 근거 제시, 가설 검증 및 연역/귀납 증명" },
  { name: "창의·융합", icon: "🚀", summary: "수학 내외적 연결, 타 교과 및 실생활 융합 모델링" },
  { name: "의사소통", icon: "💬", summary: "수학적 기호·표현을 통한 명확한 전달과 경청" },
  { name: "정보처리", icon: "💻", summary: "GeoGebra, Python, 공학도구 활용 데이터 분석" },
  { name: "태도 및 실천", icon: "🤝", summary: "끈기, 오류 극복, 또래 멘토링 및 협력적 태도" },
];

export const SingleStudentGenerator: React.FC<SingleStudentGeneratorProps> = ({
  onSaveToClass,
}) => {
  // Form State
  const [subject, setSubject] = useState<MathSubject>("대수");
  const [studentName, setStudentName] = useState("김민준");
  const [studentNumber, setStudentNumber] = useState("1번");
  const [achievementLevel, setAchievementLevel] = useState<AchievementLevel>(
    "최상위 (탁월/심화탐구)"
  );
  const [competencies, setCompetencies] = useState<MathCompetency[]>([
    "문제해결",
    "창의·융합",
    "추론",
  ]);
  const [activityData, setActivityData] = useState(
    MATH_PRESETS[0].activityData
  );
  const [lengthTarget, setLengthTarget] = useState<LengthTarget>("standard");
  const [toneStyle, setToneStyle] = useState<ToneStyle>("standard_formal");
  const [additionalInstructions, setAdditionalInstructions] = useState(
    "생명과학 진로 희망을 고려하여 지수함수 확산 모델의 수식화 과정을 강조해주세요."
  );

  // Generation & Result State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedRecordResult | null>(null);

  // Active variation tab & editable text
  const [activeVariation, setActiveVariation] = useState<"primary" | "deepDive" | "collaborative">("primary");
  const [currentText, setCurrentText] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // Refine text prompt state
  const [refinePrompt, setRefinePrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  // Handle Preset Load
  const handleLoadPreset = (preset: MathPreset) => {
    setSubject(preset.subject);
    setAchievementLevel(preset.defaultLevel);
    setCompetencies(preset.competencies);
    setActivityData(preset.activityData);
    if (preset.notes) {
      setAdditionalInstructions(preset.notes);
    }
  };

  // Toggle Competency
  const toggleCompetency = (comp: MathCompetency) => {
    if (competencies.includes(comp)) {
      if (competencies.length === 1) return; // keep at least 1
      setCompetencies(competencies.filter((c) => c !== comp));
    } else {
      setCompetencies([...competencies, comp]);
    }
  };

  // Generate Record Call
  const handleGenerate = async () => {
    if (!activityData.trim()) {
      setError("학생 활동 자료를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStage("학생 활동 자료 분석 및 핵심 수학 역량 추출 중...");

    const timer1 = setTimeout(() => {
      setLoadingStage("성취 수준 및 교육과정 성취기준 매핑 중...");
    }, 600);

    const timer2 = setTimeout(() => {
      setLoadingStage("NEIS 1,500바이트 규정 및 문체 교정 중...");
    }, 1200);

    try {
      let data: GeneratedRecordResult | null = null;

      try {
        const response = await fetch("/api/generate-record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            studentName: studentName || "학생",
            achievementLevel,
            competencies,
            activityData,
            lengthTarget,
            toneStyle,
            additionalInstructions,
          }),
        });

        const contentType = response.headers.get("content-type") || "";
        if (response.ok && contentType.includes("application/json")) {
          const json = await response.json();
          if (json && json.primaryRecord) {
            data = json;
          }
        }
      } catch (fetchErr) {
        console.warn("Backend API not reachable (e.g. GitHub Pages static host), switching to client generator:", fetchErr);
      }

      clearTimeout(timer1);
      clearTimeout(timer2);

      // Fallback to client-side math record engine if backend returned HTML (e.g. GitHub Pages 404) or failed
      if (!data || !data.primaryRecord) {
        data = generateClientMathRecord({
          subject,
          studentName: studentName || "학생",
          achievementLevel,
          competencies,
          activityData,
          lengthTarget,
          toneStyle,
          additionalInstructions,
        });
      }

      setResult(data);
      setActiveVariation("primary");
      setCurrentText(data.primaryRecord);
    } catch (err: any) {
      console.error(err);
      clearTimeout(timer1);
      clearTimeout(timer2);
      // Emergency generation to ensure teacher is never blocked
      const fallback = generateClientMathRecord({
        subject,
        studentName: studentName || "학생",
        achievementLevel,
        competencies,
        activityData,
        lengthTarget,
        toneStyle,
        additionalInstructions,
      });
      setResult(fallback);
      setActiveVariation("primary");
      setCurrentText(fallback.primaryRecord);
    } finally {
      setIsLoading(false);
      setLoadingStage("");
    }
  };

  // Switch Variation Tab
  const handleSwitchVariation = (variation: "primary" | "deepDive" | "collaborative") => {
    setActiveVariation(variation);
    if (!result) return;
    if (variation === "primary") setCurrentText(result.primaryRecord);
    else if (variation === "deepDive") setCurrentText(result.deepDiveRecord);
    else setCurrentText(result.collaborativeRecord);
  };

  // Quick Refine Handler
  const handleQuickRefine = async (instruction: string) => {
    if (!currentText.trim()) return;
    setIsRefining(true);
    let refinedText: string | null = null;

    try {
      const response = await fetch("/api/refine-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRecord: currentText,
          instruction,
          subject,
          studentName,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.refinedRecord) refinedText = data.refinedRecord;
      }
    } catch (err) {
      console.warn("Backend refine unavailable, refining client-side:", err);
    }

    if (!refinedText) {
      // Client-side quick refine fallback
      let temp = currentText;
      if (instruction.includes("480자") || instruction.includes("분량")) {
        temp = currentText.slice(0, 480).trim();
        if (!temp.endsWith("함.") && !temp.endsWith("임.") && !temp.endsWith(".")) {
          temp += "함.";
        }
      } else if (instruction.includes("~함")) {
        temp = currentText
          .replace(/보여줌\./g, "보임.")
          .replace(/돋보임\./g, "탁월함.")
          .replace(/발전시킴\./g, "발전시킴.")
          .replace(/신장함\./g, "신장함.");
      } else {
        temp = currentText + " 또한 관련 수학적 원리의 일반화 가능성을 추가 탐구하며 문제해결력을 발휘함.";
      }
      refinedText = temp;
    }

    setCurrentText(refinedText);
    setIsRefining(false);
    setRefinePrompt("");
  };

  // Copy to Clipboard
  const handleCopy = () => {
    if (!currentText) return;
    navigator.clipboard.writeText(currentText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Save to Class List
  const handleSave = () => {
    if (!currentText) return;
    const newStudent: StudentItem = {
      id: "std-" + Date.now(),
      studentNumber: studentNumber || "1번",
      name: studentName || "학생",
      subject,
      achievementLevel,
      competencies,
      activityData,
      generatedRecord: currentText,
      deepDiveRecord: result?.deepDiveRecord,
      collaborativeRecord: result?.collaborativeRecord,
      updatedAt: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    onSaveToClass(newStudent);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  // Real-time byte metrics
  const byteMetrics = calculateNeisBytes(currentText);
  const detectedForbidden = detectForbiddenWords(currentText);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Banner Notice */}
      <div className="mb-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200/70 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">
              고등학교 수학과 세특 맞춤형 생성 워크스페이스
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              학생의 <strong>성취 수준</strong>과 <strong>수학 6대 핵심역량</strong>을 선택하고 관찰 활동 자료를 입력하면, 나이스(NEIS) 1,500바이트 기준에 맞춘 3가지 버전의 고품질 세특을 즉시 생성합니다.
            </p>
          </div>
        </div>

        {/* Preset Selector Dropdown */}
        <div className="shrink-0 flex items-center gap-2">
          <div className="text-xs font-semibold text-slate-500">예시 자료:</div>
          <select
            onChange={(e) => {
              const found = MATH_PRESETS.find((p) => p.id === e.target.value);
              if (found) handleLoadPreset(found);
            }}
            className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 shadow-2xs hover:border-indigo-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            defaultValue=""
          >
            <option value="" disabled>
              💡 대표 수학 탐구활동 예시 6선
            </option>
            {MATH_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.badge}] {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Teacher Input Form (7 cols) */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
            {/* Section 1: Basic Info (Subject, Name, Number) */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                1. 기본 정보 및 이수 과목
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    수학 과목 선택
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as MathSubject)}
                    className="w-full text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {SUBJECT_LIST.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    학번 / 번호
                  </label>
                  <input
                    type="text"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    placeholder="예: 1번"
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    학생 성명
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="예: 김민준"
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Achievement Level Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  2. 학생 성취 수준 (필수 반영)
                </label>
                <span className="text-[11px] text-slate-400">
                  수준별 맞춤 서술어 및 탐구 깊이 자동 조정
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ACHIEVEMENT_LEVELS.map((item) => {
                  const isSelected = achievementLevel === item.level;
                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setAchievementLevel(item.level)}
                      className={`text-left p-3 rounded-xl border transition-all relative ${
                        isSelected
                          ? `border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/30 shadow-2xs`
                          : `border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-900">
                        {item.level}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Math Competencies (6 core) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  3. 반영할 수학 핵심 역량 (다중 선택 가능)
                </label>
                <span className="text-[11px] text-indigo-600 font-semibold">
                  {competencies.length}개 선택됨
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMPETENCIES_LIST.map((comp) => {
                  const isChecked = competencies.includes(comp.name);
                  return (
                    <button
                      key={comp.name}
                      type="button"
                      onClick={() => toggleCompetency(comp.name)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isChecked
                          ? "border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold shadow-2xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-base">{comp.icon}</span>
                      <div className="text-left">
                        <div>{comp.name}</div>
                      </div>
                      {isChecked && (
                        <Check className="w-3.5 h-3.5 ml-auto text-indigo-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Student Activity Data (The core input) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  4. 학생 활동 자료 / 관찰 일지 / 수행평가 기록
                </label>
                <span className="text-[11px] text-slate-400">
                  {activityData.length}자 입력됨
                </span>
              </div>
              <div className="relative">
                <textarea
                  rows={7}
                  value={activityData}
                  onChange={(e) => setActivityData(e.target.value)}
                  placeholder="예: 수행평가 주제, 발표 내용, 오답노트 오류 분석 기록, 수업 태도, 질문 빈도, 지오지브라/파이썬 등 활용한 모델링 활동을 자유롭게 입력해주세요..."
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors leading-relaxed font-mono"
                />
              </div>
            </div>

            {/* Section 5: Target Length & Tone Options */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  목표 글자수 및 분량
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: "standard", label: "표준 (450자)" },
                    { id: "detailed", label: "꽉채움 (490자)" },
                    { id: "concise", label: "압축 (320자)" },
                  ].map((len) => (
                    <button
                      key={len.id}
                      type="button"
                      onClick={() => setLengthTarget(len.id as LengthTarget)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                        lengthTarget === len.id
                          ? "border-indigo-600 bg-indigo-600 text-white font-semibold"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {len.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  종결어미 문체 스타일
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: "standard_formal", label: "~함/~임" },
                    { id: "narrative", label: "~을 보여줌" },
                    { id: "growth", label: "~을 신장함" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setToneStyle(t.id as ToneStyle)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                        toneStyle === t.id
                          ? "border-indigo-600 bg-indigo-600 text-white font-semibold"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 6: Additional Teacher Memo */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                교사 추가 메모 (진로 희망 연계, 공학도구 강조 등 선택)
              </label>
              <input
                type="text"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="예: 공학계열 진로와 연계하여 수학적 모델링 강조, 알지오매스 활용 언급 등"
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Submit Action Button */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white font-bold text-sm sm:text-base shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{loadingStage || "수학 세특 생성 중..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>수학 세특 3가지 버전 맞춤 생성하기</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Generated Output & NEIS Verification (5 cols / xl 5 cols) */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-5">
          {/* Main Output Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col min-h-[580px]">
            {/* Output Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  생성된 과목별 세특
                </h3>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {studentNumber} {studentName} ({subject})
              </div>
            </div>

            {/* Variation Tabs */}
            {result ? (
              <div className="mt-3 grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleSwitchVariation("primary")}
                  className={`py-2 px-2 rounded-lg transition-all text-center ${
                    activeVariation === "primary"
                      ? "bg-white text-indigo-700 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🌟 대표 표준안
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchVariation("deepDive")}
                  className={`py-2 px-2 rounded-lg transition-all text-center ${
                    activeVariation === "deepDive"
                      ? "bg-white text-indigo-700 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🔬 심화 탐구형
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchVariation("collaborative")}
                  className={`py-2 px-2 rounded-lg transition-all text-center ${
                    activeVariation === "collaborative"
                      ? "bg-white text-indigo-700 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🤝 태도·협동형
                </button>
              </div>
            ) : null}

            {/* Editable Content Area */}
            <div className="mt-4 flex-1 flex flex-col">
              {currentText ? (
                <div className="flex-1 flex flex-col">
                  <textarea
                    rows={10}
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    className="w-full flex-1 text-sm bg-slate-50/60 border border-slate-200 rounded-xl p-4 text-slate-900 leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans resize-none"
                    placeholder="생성된 세특 문장이 여기에 표시됩니다..."
                  />

                  {/* Real-time NEIS Byte & Char Counter Bar */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-indigo-600" />
                        NEIS 용량: {byteMetrics.bytes} / {byteMetrics.maxBytes} Byte
                      </span>
                      <span
                        className={`font-bold ${
                          byteMetrics.isOverLimit
                            ? "text-rose-600"
                            : byteMetrics.bytes > 1400
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        공백포함 {byteMetrics.charsWithSpace}자 (공백제외 {byteMetrics.charsWithoutSpace}자)
                      </span>
                    </div>

                    {/* Visual Meter Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          byteMetrics.isOverLimit
                            ? "bg-rose-500"
                            : byteMetrics.bytes > 1400
                            ? "bg-amber-500"
                            : "bg-indigo-600"
                        }`}
                        style={{ width: `${Math.min(100, byteMetrics.percentage)}%` }}
                      />
                    </div>

                    {byteMetrics.isOverLimit && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        나이스 1,500바이트 한도를 초과했습니다. 문장을 조금 줄여주세요.
                      </p>
                    )}
                  </div>

                  {/* Forbidden Word Live Detector */}
                  {detectedForbidden.length > 0 ? (
                    <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        기재 주의 단어 감지 ({detectedForbidden.length}건)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {detectedForbidden.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-rose-100 text-rose-800 font-semibold border border-rose-200"
                          >
                            ⚠️ {item.word}: {item.reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      생활기록부 기재금지어(경시대회, 공인어학, 사교육 등) 미포함 확인 완료
                    </div>
                  )}

                  {/* Action Buttons: Copy to NEIS & Save to Class */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      {copiedToast ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>복사 완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>NEIS 바로 복사</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      {savedToast ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>학급 저장됨!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>학급 목록에 저장</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick AI Refine Toolbar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                      AI 원클릭 문장 다듬기
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      <button
                        type="button"
                        disabled={isRefining}
                        onClick={() => handleQuickRefine("공백 포함 480자(약 1450바이트) 내외로 길이를 최적화해줘")}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                      >
                        📏 480자 분량 최적화
                      </button>
                      <button
                        type="button"
                        disabled={isRefining}
                        onClick={() => handleQuickRefine("더 전문적이고 학술적인 수학 어휘와 문장으로 다듬어줘")}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                      >
                        🎓 학술적 어휘 강화
                      </button>
                      <button
                        type="button"
                        disabled={isRefining}
                        onClick={() => handleQuickRefine("문장 끝을 나이스 표준 개조식 종결어미(~함., ~임.)로 일관되게 정돈해줘")}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                      >
                        ✅ '~함.' 종결 통일
                      </button>
                      <button
                        type="button"
                        disabled={isRefining}
                        onClick={() => handleQuickRefine("수학적 추론과 문제해결 역량을 더욱 생생하고 구체적으로 부각해줘")}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                      >
                        💡 추론·해결 역량 보강
                      </button>
                    </div>

                    {/* Custom Refine Prompt Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={refinePrompt}
                        onChange={(e) => setRefinePrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && refinePrompt.trim()) {
                            handleQuickRefine(refinePrompt);
                          }
                        }}
                        placeholder="예: 지오지브라 그래프 시각화 언급을 조금 더 늘려줘..."
                        className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        disabled={isRefining || !refinePrompt.trim()}
                        onClick={() => handleQuickRefine(refinePrompt)}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
                      >
                        {isRefining ? "수정 중..." : "수정 적용"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty State Before Generation */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    아직 생성된 세특이 없습니다
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mb-4">
                    왼쪽 양식에서 학생 활동 자료를 입력하시거나 상단의 <strong>추천 예시</strong>를 선택한 후 생성 버튼을 눌러주세요.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleLoadPreset(MATH_PRESETS[0]);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
                  >
                    👉 추천 예시 1 즉시 불러오기
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Educational Analysis Card */}
          {result?.analysis && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  수학교과 역량 분석 및 교사 피드백 리포트
                </h4>
              </div>

              {/* Competencies Badges */}
              <div>
                <div className="text-[11px] font-semibold text-slate-500 mb-1">
                  강조된 수학 역량
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.analysis.competenciesEvaluated.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                    >
                      #{comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Curriculum Concepts */}
              {result.analysis.curriculumConcepts.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">
                    연계 교육과정 개념
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.analysis.curriculumConcepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Teacher Tip */}
              {result.analysis.teacherTip && (
                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                  <span className="font-bold block mb-0.5">💡 학생 지도 및 면담 TIP:</span>
                  {result.analysis.teacherTip}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
