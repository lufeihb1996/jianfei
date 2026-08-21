'use client';

import React from 'react';

interface DeficitDualRingProps {
  deficit: number;
  burnedLive: number;
  tdee: number;
  intake: number;
  targetDeficit: number;
}

export const DeficitDualRing: React.FC<DeficitDualRingProps> = ({
  deficit,
  burnedLive,
  tdee,
  intake,
  targetDeficit,
}) => {
  // 外环：消耗进度比例 (已消耗 / TDEE)
  const burnRatio = Math.min(burnedLive / Math.max(tdee, 1), 1);
  const outerCircumference = 2 * Math.PI * 82; // ~515.2
  const outerDasharray = `${burnRatio * outerCircumference}, ${outerCircumference}`;

  // 内环：摄入进度比例 (已摄入 / 预算上限 (TDEE - targetDeficit))
  const maxIntakeAllowed = Math.max(tdee - targetDeficit, 500);
  const intakeRatio = Math.min(intake / maxIntakeAllowed, 1);
  const innerCircumference = 2 * Math.PI * 62; // ~389.5
  const innerDasharray = `${intakeRatio * innerCircumference}, ${innerCircumference}`;

  return (
    <div className="bg-[#18181b] rounded-3xl p-3.5 border border-zinc-800/80 flex flex-col items-center shadow-lg relative overflow-hidden flex-shrink-0">
      {/* 柔和背景光晕 */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* 核心双环 SVG 仪表盘 (紧凑缩放 180x180) */}
      <div className="relative w-48 h-48 flex items-center justify-center my-0.5">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* 外环底色虚线 (Purple Track) */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="rgba(167, 139, 250, 0.18)"
            strokeWidth="12"
            strokeDasharray="3, 4.5"
            strokeLinecap="round"
          />
          {/* 外环实时进度 (Purple Active Solid) */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="13"
            strokeDasharray={outerDasharray}
            strokeDashoffset="0"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* 内环底色虚线 (Orange Track) */}
          <circle
            cx="100"
            cy="100"
            r="62"
            fill="none"
            stroke="rgba(251, 146, 60, 0.18)"
            strokeWidth="10"
            strokeDasharray="3, 4"
            strokeLinecap="round"
          />
          {/* 内环已摄入进度 (Orange Active Solid) */}
          <circle
            cx="100"
            cy="100"
            r="62"
            fill="none"
            stroke="#fb923c"
            strokeWidth="11"
            strokeDasharray={innerDasharray}
            strokeDashoffset="0"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* 中心文字：缺口核心指标 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] font-semibold text-zinc-400 tracking-wider">缺口</span>
          <span className="text-3xl font-extrabold text-white tracking-tight my-0 font-sans">
            {deficit.toLocaleString()}
          </span>
          <span className="text-[10px] font-medium text-zinc-500">kcal</span>
        </div>
      </div>

      {/* 底部对比数据栏 */}
      <div className="w-full grid grid-cols-2 gap-2 pt-2.5 mt-0.5 border-t border-zinc-800/80">
        {/* 已消耗 */}
        <div className="flex items-start gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
          <div>
            <span className="text-[10px] text-zinc-400 font-medium leading-none block">已消耗</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-white font-sans">
                {burnedLive.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-500">kcal</span>
            </div>
            <span className="text-[9px] text-zinc-500 block">全天预估 {tdee.toLocaleString()}</span>
          </div>
        </div>

        {/* 摄入 */}
        <div className="flex items-start gap-2 pl-2 border-l border-zinc-800">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
          <div>
            <span className="text-[10px] text-zinc-400 font-medium leading-none block">摄入</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-white font-sans">
                {intake.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-500">kcal</span>
            </div>
            <span className="text-[9px] text-emerald-400 font-medium block">
              {intake <= maxIntakeAllowed
                ? `预算内 -${maxIntakeAllowed - intake}`
                : `超标 +${intake - maxIntakeAllowed}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
