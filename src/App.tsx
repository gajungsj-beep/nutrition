/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SingleStudentGenerator } from "./components/SingleStudentGenerator";
import { BatchGenerator } from "./components/BatchGenerator";
import { NeisGuideModal } from "./components/NeisGuideModal";
import { StudentItem } from "./types/mathRecord";
import { MATH_PRESETS } from "./data/mathPresets";

// Initial seed students for quick testing and demonstration
const INITIAL_STUDENTS: StudentItem[] = [
  {
    id: "std-1",
    studentNumber: "1번",
    name: "김민준",
    subject: "대수",
    achievementLevel: "최상위 (탁월/심화탐구)",
    competencies: ["문제해결", "창의·융합", "추론"],
    activityData: MATH_PRESETS[0].activityData,
    generatedRecord: `[대수] 감염병 확산 모델링 수행평가에서 SIR 모델의 연립 미분방정식 구조와 지수함수의 수학적 원리를 심도 있게 탐구함. 파이썬을 활용해 기본재생산지수(R0)의 변화에 따른 감염자 수 변곡점과 피크 시점을 정밀하게 시각화함. 집단면역 형성 임계치 수식을 엄밀하게 유도하고, 백신 접종과 거리두기의 수학적 정당성을 논리적인 보고서로 정리하여 학술적 깊이가 돋보이는 발표를 완수함. 동료들의 질문에도 개념의 원리를 알기 쉽게 설명하며 수학적 의사소통 역량을 훌륭히 발휘함.`,
  },
  {
    id: "std-2",
    studentNumber: "2번",
    name: "이서연",
    subject: "미적분Ⅰ",
    achievementLevel: "우수 (상위/주도적)",
    competencies: ["문제해결", "정보처리", "추론"],
    activityData: MATH_PRESETS[1].activityData,
    generatedRecord: `[미적분Ⅰ] 자율주행 차량의 안전 주행과 도로 곡률의 관계를 탐구하며 1계 도함수로 접선의 기울기를, 2계 도함수로 곡률을 산출하는 미분적 원리를 명확히 이해함. 도로의 곡선 반경에 따른 차량의 원심력과 안전 제한 속도 수식을 성공적으로 도출함. 공학용 계산 프로그램을 활용하여 최적 제동 지점을 시뮬레이션하고, 미분계수의 기하학적 의미가 실제 첨단 공학 기술에 어떻게 필수적으로 적용되는지 모둠원들에게 설득력 있게 전달함.`,
  },
  {
    id: "std-3",
    studentNumber: "3번",
    name: "박도현",
    subject: "인공지능 수학",
    achievementLevel: "최상위 (탁월/심화탐구)",
    competencies: ["정보처리", "문제해결", "추론"],
    activityData: MATH_PRESETS[2].activityData,
  },
  {
    id: "std-4",
    studentNumber: "4번",
    name: "정유진",
    subject: "기하",
    achievementLevel: "우수 (상위/주도적)",
    competencies: ["추론", "창의·융합", "의사소통"],
    activityData: MATH_PRESETS[3].activityData,
  },
  {
    id: "std-5",
    studentNumber: "5번",
    name: "최지호",
    subject: "공통수학1",
    achievementLevel: "보통 (성실/성장형)",
    competencies: ["태도 및 실천", "의사소통", "문제해결"],
    activityData: MATH_PRESETS[5].activityData,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"single" | "batch" | "guide">("single");
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Load students from localStorage or fallback to initial
  const [students, setStudents] = useState<StudentItem[]>(() => {
    try {
      const saved = localStorage.getItem("math_records_students");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STUDENTS;
  });

  // Sync students to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("math_records_students", JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  // Handle Save from Single Generator
  const handleSaveToClass = (newStudent: StudentItem) => {
    setStudents((prev) => {
      // replace if same studentNumber and name exists, else prepend
      const existingIdx = prev.findIndex(
        (s) => s.studentNumber === newStudent.studentNumber && s.name === newStudent.name
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newStudent;
        return copy;
      }
      return [newStudent, ...prev];
    });
  };

  // Handle Edit selection from Batch Generator
  const handleSelectStudentToEdit = (student: StudentItem) => {
    setActiveTab("single");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "guide") {
            setIsGuideOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        savedCount={students.length}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1">
        {activeTab === "single" && (
          <SingleStudentGenerator onSaveToClass={handleSaveToClass} />
        )}

        {activeTab === "batch" && (
          <BatchGenerator
            students={students}
            onUpdateStudents={setStudents}
            onSelectStudentToEdit={handleSelectStudentToEdit}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            수학 세특 마스터 (Math Record AI) · 고등학교 수학교사 전용
          </p>
          <p>
            교육부 학교생활기록부 기재요령 준수 · 2022/2015 개정 고등학교 수학과 교육과정 성취기준 및 6대 핵심역량 반영
          </p>
          <p className="text-[11px] text-slate-400">
            * 생성된 문장은 교사의 최종 검토 및 수정을 거쳐 NEIS에 입력하시기 바랍니다.
          </p>
        </div>
      </footer>

      {/* NEIS Guide Modal */}
      <NeisGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
