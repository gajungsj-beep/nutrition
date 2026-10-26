import React, { useState } from "react";
import { StudentItem, MathSubject, AchievementLevel, MathCompetency } from "../types/mathRecord";
import { calculateNeisBytes, detectForbiddenWords } from "../utils/neisUtils";
import { generateClientMathRecord } from "../utils/clientRecordGenerator";
import {
  Users,
  Plus,
  Play,
  Copy,
  Download,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Search,
} from "lucide-react";

interface BatchGeneratorProps {
  students: StudentItem[];
  onUpdateStudents: (students: StudentItem[]) => void;
  onSelectStudentToEdit: (student: StudentItem) => void;
}

export const BatchGenerator: React.FC<BatchGeneratorProps> = ({
  students,
  onUpdateStudents,
  onSelectStudentToEdit,
}) => {
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [copiedBatchToast, setCopiedBatchToast] = useState(false);

  // Selected student for quick modal view
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.includes(searchQuery) ||
      s.studentNumber.includes(searchQuery) ||
      s.activityData.includes(searchQuery);
    const matchesSubj = filterSubject === "all" || s.subject === filterSubject;
    const matchesLvl = filterLevel === "all" || s.achievementLevel.includes(filterLevel);
    return matchesSearch && matchesSubj && matchesLvl;
  });

  // Generate Single Student in Batch
  const generateStudent = async (student: StudentItem): Promise<StudentItem> => {
    try {
      let data: any = null;
      try {
        const response = await fetch("/api/generate-record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: student.subject,
            studentName: student.name,
            achievementLevel: student.achievementLevel,
            competencies: student.competencies,
            activityData: student.activityData,
            lengthTarget: "standard",
            toneStyle: "standard_formal",
          }),
        });

        const contentType = response.headers.get("content-type") || "";
        if (response.ok && contentType.includes("application/json")) {
          data = await response.json();
        }
      } catch (e) {
        console.warn("Backend not available in batch, using client generator:", e);
      }

      if (!data || !data.primaryRecord) {
        data = generateClientMathRecord({
          subject: student.subject,
          studentName: student.name,
          achievementLevel: student.achievementLevel,
          competencies: student.competencies,
          activityData: student.activityData,
          lengthTarget: "standard",
          toneStyle: "standard_formal",
        });
      }

      return {
        ...student,
        generatedRecord: data.primaryRecord,
        deepDiveRecord: data.deepDiveRecord,
        collaborativeRecord: data.collaborativeRecord,
        isGenerating: false,
        error: undefined,
        updatedAt: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch (err: any) {
      // Emergency client generation fallback
      const fallback = generateClientMathRecord({
        subject: student.subject,
        studentName: student.name,
        achievementLevel: student.achievementLevel,
        competencies: student.competencies,
        activityData: student.activityData,
        lengthTarget: "standard",
        toneStyle: "standard_formal",
      });
      return {
        ...student,
        generatedRecord: fallback.primaryRecord,
        deepDiveRecord: fallback.deepDiveRecord,
        collaborativeRecord: fallback.collaborativeRecord,
        isGenerating: false,
        error: undefined,
        updatedAt: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    }
  };

  // Run Batch Generation for all pending/un-generated students
  const handleRunBatch = async (onlyPending: boolean = true) => {
    const targets = onlyPending
      ? students.filter((s) => !s.generatedRecord)
      : students;

    if (targets.length === 0) {
      alert("생성할 대상 학생이 없습니다.");
      return;
    }

    setIsBatchGenerating(true);
    setBatchProgress({ current: 0, total: targets.length });

    let updatedList = [...students];

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      setBatchProgress({ current: i + 1, total: targets.length });

      // Mark as generating
      updatedList = updatedList.map((s) =>
        s.id === target.id ? { ...s, isGenerating: true } : s
      );
      onUpdateStudents(updatedList);

      const res = await generateStudent(target);

      updatedList = updatedList.map((s) => (s.id === target.id ? res : s));
      onUpdateStudents(updatedList);
    }

    setIsBatchGenerating(false);
  };

  // Add default new student
  const handleAddNewStudent = () => {
    const nextNum = students.length + 1;
    const newStudent: StudentItem = {
      id: "std-" + Date.now(),
      studentNumber: `${nextNum}번`,
      name: `학생${nextNum}`,
      subject: "공통수학1",
      achievementLevel: "우수 (상위/주도적)",
      competencies: ["문제해결", "추론"],
      activityData: "수행평가 및 탐구활동 내용을 입력해주세요.",
    };
    onUpdateStudents([newStudent, ...students]);
  };

  // Delete student
  const handleDeleteStudent = (id: string) => {
    if (confirm("이 학생 기록을 삭제하시겠습니까?")) {
      onUpdateStudents(students.filter((s) => s.id !== id));
      if (selectedStudent?.id === id) setSelectedStudent(null);
    }
  };

  // Copy All Records to NEIS formatted text
  const handleCopyAllToClipboard = () => {
    const lines = students
      .filter((s) => s.generatedRecord)
      .map((s) => `[${s.studentNumber} ${s.name} - ${s.subject}]\n${s.generatedRecord}\n`)
      .join("\n");

    if (!lines) {
      alert("생성 완료된 세특 문장이 없습니다.");
      return;
    }

    navigator.clipboard.writeText(lines);
    setCopiedBatchToast(true);
    setTimeout(() => setCopiedBatchToast(false), 2500);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const rows = [
      ["번호", "이름", "과목", "성취수준", "핵심역량", "활동자료", "생성세특(NEIS)"],
      ...students.map((s) => [
        `"${s.studentNumber}"`,
        `"${s.name}"`,
        `"${s.subject}"`,
        `"${s.achievementLevel}"`,
        `"${s.competencies.join(", ")}"`,
        `"${s.activityData.replace(/"/g, '""')}"`,
        `"${(s.generatedRecord || "").replace(/"/g, '""')}"`,
      ]),
    ];

    const csvContent =
      "\uFEFF" + rows.map((e) => e.join(",")).join("\n"); // UTF-8 BOM for Korean Excel
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `수학_세특_일괄목록_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              학급 세특 일괄 관리 및 대량 생성
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              총 {students.length}명 관리 중
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            수학 교과목별 학생 활동 자료를 일괄 관리하고 한 번에 나이스(NEIS) 세특을 생성 및 엑셀(CSV)로 내보낼 수 있습니다.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddNewStudent}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>학생 추가</span>
          </button>

          <button
            type="button"
            disabled={isBatchGenerating}
            onClick={() => handleRunBatch(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            {isBatchGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>생성 중 ({batchProgress.current}/{batchProgress.total})</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>미생성 학생 일괄 AI 생성</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyAllToClipboard}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedBatchToast ? "복사 완료!" : "전체 복사"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>엑셀(CSV) 다운로드</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="학생 이름, 번호, 활동 내용 검색..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
          >
            <option value="all">모든 과목</option>
            <option value="공통수학1">공통수학1</option>
            <option value="공통수학2">공통수학2</option>
            <option value="대수">대수</option>
            <option value="미적분Ⅰ">미적분Ⅰ</option>
            <option value="미적분Ⅱ">미적분Ⅱ</option>
            <option value="확률과 통계">확률과 통계</option>
            <option value="기하">기하</option>
            <option value="인공지능 수학">인공지능 수학</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
          >
            <option value="all">모든 성취수준</option>
            <option value="최상위">최상위</option>
            <option value="우수">우수</option>
            <option value="보통">보통</option>
            <option value="기초">기초</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-16">번호</th>
                <th className="py-3 px-4 w-28">성명</th>
                <th className="py-3 px-4 w-28">과목</th>
                <th className="py-3 px-4 w-32">성취수준</th>
                <th className="py-3 px-4">활동 자료 요약</th>
                <th className="py-3 px-4 w-44">세특 상태 및 용량</th>
                <th className="py-3 px-4 w-28 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((std) => {
                  const bytesInfo = std.generatedRecord
                    ? calculateNeisBytes(std.generatedRecord)
                    : null;
                  const forbidden = std.generatedRecord
                    ? detectForbiddenWords(std.generatedRecord)
                    : [];

                  return (
                    <tr
                      key={std.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {std.studentNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {std.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {std.subject}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            std.achievementLevel.includes("최상위")
                              ? "bg-purple-100 text-purple-800"
                              : std.achievementLevel.includes("우수")
                              ? "bg-blue-100 text-blue-800"
                              : std.achievementLevel.includes("보통")
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {std.achievementLevel.split(" ")[0]}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate font-mono text-[11px]">
                        {std.activityData}
                      </td>
                      <td className="py-3.5 px-4">
                        {std.isGenerating ? (
                          <div className="flex items-center gap-1.5 text-indigo-600 font-semibold animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>생성 중...</span>
                          </div>
                        ) : std.generatedRecord ? (
                          <div>
                            <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>생성 완료</span>
                            </div>
                            {bytesInfo && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {bytesInfo.bytes}B ({bytesInfo.charsWithSpace}자)
                                {forbidden.length > 0 && (
                                  <span className="text-rose-600 font-bold ml-1">
                                    ⚠️금지어 {forbidden.length}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">
                            미생성
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectStudentToEdit(std)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="개별 워크스페이스에서 열기"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(std.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    등록된 학생이 없거나 검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
