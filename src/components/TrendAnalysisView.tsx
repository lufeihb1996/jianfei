'use client';

import React, { useState } from 'react';
import { MealRecord, UserProfile } from '@/types';
import { calculateBMR, calculateTDEE } from '@/lib/calorie-calculator';
import {
  TrendingDown,
  Scale,
  Flame,
  Sparkles,
  Calendar,
  ChevronRight,
  Award,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface TrendAnalysisViewProps {
  meals: MealRecord[];
  profile: UserProfile;
  onUpdateWeight: (newWeight: number) => void;
  onDeleteMeal: (id: string) => void;
}

export const TrendAnalysisView: React.FC<TrendAnalysisViewProps> = ({
  meals,
  profile,
  onUpdateWeight,
  onDeleteMeal,
}) => {
  const [weightInput, setWeightInput] = useState('');
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const bmr = calculateBMR(profile.gender, profile.weight_kg, profile.height_cm, profile.age);
  const tdee = calculateTDEE(bmr, profile.activity_level);

  // 1. 减重进度计算
  const initialWeight = profile.initial_weight_kg || profile.weight_kg + 3.5;
  const currentWeight = profile.weight_kg;
  const targetWeight = profile.target_weight_kg;
  const totalToLose = Math.max(initialWeight - targetWeight, 0.1);
  const lostSoFar = Math.max(initialWeight - currentWeight, 0);
  const progressPercent = Math.min(Math.round((lostSoFar / totalToLose) * 100), 100);

  // 2. 按日期归类餐食数据 (近 7 天)
  const groupedMealsByDate = meals.reduce((acc, meal) => {
    const dateKey = meal.eaten_at ? meal.eaten_at.split('T')[0] : new Date().toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(meal);
    return acc;
  }, {} as Record<string, MealRecord[]>);

  // 生成近 7 天的日期数组 (从今天往前倒推 7 天)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  // 计算近 7 天总热量缺口
  let total7DayDeficit = 0;
  const dailyStats = last7Days.map((dateStr) => {
    const dayMeals = groupedMealsByDate[dateStr] || [];
    const dayIntake = dayMeals.reduce((sum, m) => sum + m.calories, 0);
    // 如果当天没有任何记录且不是今天，按基础代谢估算或 0
    const dayBurned = tdee;
    const dayDeficit = dayIntake > 0 ? dayBurned - dayIntake : 0;
    if (dayIntake > 0) {
      total7DayDeficit += dayDeficit;
    }
    const d = new Date(dateStr);
    const weekdayNames = ['日', '一', '二', '三', '四', '五', '六'];
    return {
      date: dateStr,
      label: weekdayNames[d.getDay()],
      intake: dayIntake,
      deficit: dayDeficit,
      isTargetMet: dayDeficit >= profile.target_deficit_kcal,
      hasRecords: dayMeals.length > 0,
    };
  });

  // 3. 7700 大卡减脂定律预测 (7700 kcal 纯脂肪 = 1kg)
  const fatLostKg = Math.max(total7DayDeficit / 7700, 0).toFixed(2);

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 20 && w < 300) {
      onUpdateWeight(w);
      setShowWeightInput(false);
      setWeightInput('');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const activeDate = selectedDate || todayStr;
  const activeMeals = groupedMealsByDate[activeDate] || [];

  return (
    <div className="space-y-4 pb-4">
      {/* 1. 减重总览与体重打卡卡片 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4.5 space-y-3.5 shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">减重进度追踪</h3>
          </div>
          <button
            onClick={() => setShowWeightInput(!showWeightInput)}
            className="text-[11px] bg-purple-950/70 border border-purple-800/50 text-purple-300 px-2.5 py-1 rounded-xl font-medium active:scale-95 transition"
          >
            ⚖️ 记录今日体重
          </button>
        </div>

        {/* 快捷输入今日体重 */}
        {showWeightInput && (
          <form onSubmit={handleSaveWeight} className="flex gap-2 p-2 bg-zinc-950 rounded-2xl border border-zinc-800 animate-fadeIn">
            <input
              type="text"
              inputMode="decimal"
              placeholder={`输入称重 (当前: ${currentWeight}kg)`}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="flex-1 bg-transparent px-3 text-xs text-white focus:outline-none font-bold"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold active:scale-95 transition"
            >
              保存
            </button>
          </form>
        )}

        {/* 初始 ➔ 当前 ➔ 目标 对比 */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-zinc-950 p-2.5 rounded-2xl">
            <span className="text-[10px] text-zinc-500 block">初始体重</span>
            <span className="text-sm font-bold text-zinc-300">{initialWeight} <small className="text-[9px]">kg</small></span>
          </div>

          <div className="bg-purple-950/30 border border-purple-800/40 p-2.5 rounded-2xl">
            <span className="text-[10px] text-purple-400 font-semibold block">当前体重</span>
            <span className="text-base font-extrabold text-white">{currentWeight} <small className="text-[9px]">kg</small></span>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-2xl">
            <span className="text-[10px] text-emerald-400 block">🎯 目标体重</span>
            <span className="text-sm font-bold text-emerald-400">{targetWeight} <small className="text-[9px]">kg</small></span>
          </div>
        </div>

        {/* 进度条 */}
        <div>
          <div className="flex justify-between text-[11px] text-zinc-400 mb-1.5">
            <span>已减去 <b className="text-emerald-400">{lostSoFar.toFixed(1)} kg</b></span>
            <span>还需减 <b className="text-purple-300">{(currentWeight - targetWeight > 0 ? currentWeight - targetWeight : 0).toFixed(1)} kg</b></span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. 7700 大卡减脂定律成就卡片 (科学减脂正向反馈) */}
      <div className="bg-gradient-to-br from-emerald-950/40 to-teal-950/20 border border-emerald-800/40 rounded-3xl p-4.5 space-y-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            7700 大卡减脂定律预测
          </h3>
        </div>
        
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-[10px] text-zinc-400">近 7 天累计创造热量赤字</span>
            <div className="text-2xl font-black text-white font-sans mt-0.5">
              {total7DayDeficit.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">kcal</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-400 font-semibold block">预计消耗纯脂肪</span>
            <div className="text-xl font-extrabold text-emerald-400 font-sans">
              ~ {fatLostKg} <span className="text-xs text-zinc-400 font-normal">kg</span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-emerald-200/80 leading-relaxed pt-1">
          💡 人体每累计制造 7,700 kcal 热量缺口，可稳定消耗 1kg 脂肪。保持赤字是掉秤的关键！
        </p>
      </div>

      {/* 3. 近 7 天热量赤字柱状图 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4.5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs font-bold text-white">近 7 天赤字达成趋势</h3>
          </div>
          <span className="text-[10px] text-zinc-400">目标: -{profile.target_deficit_kcal}kcal/天</span>
        </div>

        {/* 柱状图 */}
        <div className="flex justify-between items-end h-32 pt-4 pb-2 px-1 border-b border-zinc-800">
          {dailyStats.map((d, i) => {
            const isSelected = activeDate === d.date;
            // 柱高计算
            const maxRef = Math.max(tdee, 2200);
            const heightPercent = d.hasRecords
              ? Math.min(Math.max((Math.abs(d.deficit) / maxRef) * 100, 15), 100)
              : 8;

            return (
              <button
                key={d.date}
                type="button"
                onClick={() => setSelectedDate(d.date)}
                className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <span className="text-[9px] text-zinc-500 font-mono scale-90">
                  {d.hasRecords ? `${Math.round(d.deficit)}` : '-'}
                </span>
                <div
                  className={`w-5 rounded-t-md transition-all duration-500 ${
                    !d.hasRecords
                      ? 'bg-zinc-800'
                      : d.deficit >= profile.target_deficit_kcal
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      : d.deficit > 0
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  } ${isSelected ? 'ring-2 ring-white scale-105' : ''}`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span
                  className={`text-[10px] font-bold ${
                    isSelected
                      ? 'text-emerald-400 font-extrabold'
                      : d.date === todayStr
                      ? 'text-white'
                      : 'text-zinc-500'
                  }`}
                >
                  {d.date === todayStr ? '今' : d.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. AI 减脂教练周期性诊断报告 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4.5 space-y-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white">AI 减脂教练周度点评</h3>
        </div>
        <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed space-y-2">
          <p>
            🔥 <strong>缺口表现：</strong>
            {total7DayDeficit >= 2500
              ? '本周整体热量缺口把控优秀，减脂节奏稳健，继续保持！'
              : '本周热量摄入较接近总消耗，建议增加轻度快走或在晚餐减少精致主食。'}
          </p>
          <p>
            🥗 <strong>营养建议：</strong> 减脂期请优先确保每日蛋白质摄入（1.5g/kg体重），能有效防止瘦体重流失并维持高代谢水平。
          </p>
        </div>
      </div>

      {/* 5. 选中日期的历史餐食记录 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4.5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white">
              {activeDate === todayStr ? '今天' : activeDate} 饮食明细 ({activeMeals.length} 餐)
            </h3>
          </div>
        </div>

        <div className="space-y-2">
          {activeMeals.length === 0 ? (
            <div className="bg-zinc-950/60 border border-dashed border-zinc-800 rounded-2xl p-6 text-center text-xs text-zinc-500">
              该日期暂无餐单打卡记录
            </div>
          ) : (
            activeMeals.map((meal) => (
              <div
                key={meal.id}
                className="bg-zinc-950 border border-zinc-800/90 p-3 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg">
                    {meal.emoji}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{meal.food_name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      蛋 {meal.protein_g}g · 碳 {meal.carbs_g}g · 脂 {meal.fat_g}g
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-white">+{meal.calories}</span>
                    <span className="text-[9px] text-zinc-500 block font-mono">kcal</span>
                  </div>
                  <button
                    onClick={() => onDeleteMeal(meal.id)}
                    className="text-zinc-600 hover:text-red-400 transition p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
