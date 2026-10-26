export type MathSubject =
  | "공통수학1"
  | "공통수학2"
  | "대수"
  | "미적분Ⅰ"
  | "미적분Ⅱ"
  | "확률과 통계"
  | "기하"
  | "인공지능 수학"
  | "경제 수학"
  | "수학과제 탐구";

export type AchievementLevel =
  | "최상위 (탁월/심화탐구)"
  | "우수 (상위/주도적)"
  | "보통 (성실/성장형)"
  | "기초 (노력/잠재력)";

export type MathCompetency =
  | "문제해결"
  | "추론"
  | "창의·융합"
  | "의사소통"
  | "정보처리"
  | "태도 및 실천";

export type ToneStyle = "standard_formal" | "narrative" | "growth";

export type LengthTarget = "standard" | "concise" | "detailed";

export interface RecordAnalysis {
  competenciesEvaluated: string[];
  curriculumConcepts: string[];
  teacherTip: string;
  neisSafe: boolean;
  checkedForbiddenWords: string[];
}

export interface GeneratedRecordResult {
  primaryRecord: string;
  deepDiveRecord: string;
  collaborativeRecord: string;
  analysis: RecordAnalysis;
}

export interface StudentItem {
  id: string;
  studentNumber: string; // e.g., "1번"
  name: string; // e.g., "김민준"
  subject: MathSubject;
  achievementLevel: AchievementLevel;
  competencies: MathCompetency[];
  activityData: string;
  generatedRecord?: string;
  deepDiveRecord?: string;
  collaborativeRecord?: string;
  isGenerating?: boolean;
  error?: string;
  updatedAt?: string;
}
