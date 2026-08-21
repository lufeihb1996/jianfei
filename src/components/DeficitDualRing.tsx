'use client';

import React from 'react';
import { Target, Info } from 'lucide-react';

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

  // 缺口达成情况对比 (当前缺口 vs 建议目标缺口)
  const isDeficitAchieved = deficit >= targetDeficit;

  return (
    <div className="bg-[#18181b] rounded-3xl p-5 border border-zinc-800/80 flex flex-col items-center shadow-lg relative overflow-hidden">
      {/* 柔和背景光晕 */}
      <div className="absolute -top-10 -left-10 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* 顶部目标缺口与预算提示栏 */}
      <div className="w-full flex justify-between items-center px-1 pb-1 text-xs">
        <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full text-emerald-400 font-semibold">
          <Target className="w-3.5 h-3.5" />
          <span>建议每日缺口: <b>-{targetDeficit}</b> kcal</span>
        </div>
        <span className="text-[11px] text-zinc-400">
          摄入上限: <b className="text-zinc-200">{maxIntakeAllowed}</b> kcal
        </span>
      </div>

      {/* 核心双环 SVG 仪表盘 */}
      <div className="relative w-64 h-64 flex items-center justify-center my-2">
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

        {/* 中心文字：缺口核心指标与目标达成对比 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xs font-semibold text-zinc-400 tracking-wider">实时缺口</span>
          <span className="text-4xl font-extrabold text-white tracking-tight my-0.5 font-sans">
            {deficit.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-zinc-500">kcal</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                isDeficitAchieved
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              目标 -{targetDeficit}
            </span>
          </div>
        </div>
      </div>

      {/* 底部对比数据栏 */}
      <div className="w-full grid grid-cols-2 gap-4 pt-4 mt-1 border-t border-zinc-800/80">
        {/* 已消耗 */}
        <div className="flex items-start gap-2.5">
          <span className="w-3 h-3 rounded-full bg-purple-400 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
          <div>
            <span className="text-xs text-zinc-400 font-medium">已消耗 (实时代谢)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-white font-sans">
                {burnedLive.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-500">kcal</span>
            </div>
            <span className="text-[11px] text-zinc-500">全天预估消耗 {tdee.toLocaleString()}</span>
          </div>
        </div>

        {/* 摄入 */}
        <div className="flex items-start gap-2.5 pl-3 border-l border-zinc-800">
          <span className="w-3 h-3 rounded-full bg-orange-400 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
          <div>
            <span className="text-xs text-zinc-400 font-medium">已摄入 (饮食热量)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-white font-sans">
                {intake.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-500">kcal</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">
              {intake <= maxIntakeAllowed
                ? `预算剩余 -${maxIntakeAllowed - intake}`
                : `超标 +${intake - maxIntakeAllowed}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
