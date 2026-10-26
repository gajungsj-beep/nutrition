import React from "react";
import { BookOpen, Sparkles, Users, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

interface HeaderProps {
  activeTab: "single" | "batch" | "guide";
  onTabChange: (tab: "single" | "batch" | "guide") => void;
  savedCount: number;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  savedCount,
  onOpenGuide,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <span className="font-serif font-black text-xl italic leading-none">∫dx</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                  수학 세특 마스터
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  고등학교 수학교사용
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  NEIS 1500Byte 검증
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                학생 활동 자료 분석 · 성취수준 & 6대 핵심역량 맞춤형 세특 자동 생성 솔루션
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onTabChange("single")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "single"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>개별 세특 생성</span>
            </button>

            <button
              onClick={() => onTabChange("batch")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === "batch"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>학급 일괄 관리</span>
              {savedCount > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === "batch"
                      ? "bg-white text-indigo-700"
                      : "bg-indigo-100 text-indigo-800"
                  }`}
                >
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              title="NEIS 기재요령 및 수학 역량 가이드"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">기재요령 가이드</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
