import React from "react";
import { X, ShieldAlert, CheckCircle2, Award, BookOpen, AlertTriangle, ArrowRight } from "lucide-react";

interface NeisGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NeisGuideModal: React.FC<NeisGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                수학과 세특 작성 및 NEIS 기재요령 가이드
              </h2>
              <p className="text-xs text-slate-500">
                교육부 학교생활기록부 기재요령 및 2022/2015 개정 수학과 교육과정 기준
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Section 1: 500자 3단 황금 구성 공식 */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4">
            <h3 className="font-bold text-indigo-950 flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-indigo-600" />
              1,500바이트 (약 500자) 이상적인 3단 구성 공식
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-indigo-200/60 shadow-2xs">
                <div className="font-bold text-indigo-900 mb-1">1단계: 탐구 동기 및 주제 (80~100자)</div>
                <p className="text-slate-600">수업 중 호기심을 가진 수학적 개념이나 실생활 연계 문제의식을 명확히 제시.</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-indigo-200/60 shadow-2xs">
                <div className="font-bold text-indigo-900 mb-1">2단계: 구체적 탐구 과정 (250~300자)</div>
                <p className="text-slate-600">수식 유도, 공학도구(지오지브라, 파이썬 등) 시뮬레이션, 조건 분석 및 증명 등 학생의 개별 수행을 서술.</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-indigo-200/60 shadow-2xs">
                <div className="font-bold text-indigo-900 mb-1">3단계: 역량 신장 및 성장 (100~120자)</div>
                <p className="text-slate-600">활동을 통해 심화된 수학적 역량(추론, 문제해결 등)과 동료와의 나눔 및 태도 변화 기술.</p>
              </div>
            </div>
          </div>

          {/* Section 2: 수학과 6대 핵심역량 해설 */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              수학과 6대 핵심역량과 생기부 반영 포인트
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800">1. 문제해결</div>
                <p className="text-slate-600 mt-0.5">문제를 수학적으로 인식하고, 다양한 풀이 전략(역발상, 특수화 등)을 세워 해결하는 능력.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800">2. 추론</div>
                <p className="text-slate-600 mt-0.5">관찰과 귀납을 통해 가설을 설정하고, 수학적 원리와 공리를 근거로 연역적 증명을 수행하는 능력.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800">3. 창의·융합</div>
                <p className="text-slate-600 mt-0.5">수학 내 개념 간의 연결성 발견 및 타 교과(과학, 인공지능, 경제 등)와의 융합 탐구 능력.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800">4. 의사소통</div>
                <p className="text-slate-600 mt-0.5">수학적 기호, 표, 그래프를 활용하여 자신의 풀이 과정을 명확히 설명하고 동료를 설득·조율하는 능력.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800">5. 정보처리</div>
                <p className="text-slate-600 mt-0.5">공학적 도구(GeoGebra, AlgeoMath, Desmos, Python 등)를 능숙하게 활용하여 복잡한 계산과 시각화 수행.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800">6. 태도 및 실천</div>
                <p className="text-slate-600 mt-0.5">오답을 두려워하지 않는 끈기, 자율적 오류 교정 노력, 또래 멘토링 및 협력적 배려 태도.</p>
              </div>
            </div>
          </div>

          {/* Section 3: 기재금지 사항 (레드카드) */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
            <h3 className="font-bold text-rose-950 flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              NEIS 생활기록부 절대 기재금지 사항
            </h3>
            <ul className="text-xs text-rose-900 space-y-1.5 list-disc list-inside">
              <li>
                <strong>공인어학성적 및 교외 인증시험:</strong> TOEIC, TOEFL, TEPS, HSK, JLPT 등
              </li>
              <li>
                <strong>교외 경시대회 및 수상실적:</strong> 수학올림피아드(KMO), 전국 경시대회, 교외대회 명칭 일체
              </li>
              <li>
                <strong>소논문(R&E) 및 외부 연구:</strong> 논문 발표, 학술지 등재, 특허/실용신안 출원 언급
              </li>
              <li>
                <strong>정량적 성적/등수:</strong> 모의고사/수능 백분위, 1등급, 전교 1등, 내신 만점 등
              </li>
              <li>
                <strong>사교육 및 부모 직업:</strong> 학원, 과외, 부모나 친인척의 사회경제적 지위(교수, 의사, 연구원 등) 암시
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
