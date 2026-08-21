'use client';

import React, { useState } from 'react';
import { MealRecord, UserProfile } from '@/types';
import { calculateBMR, calculateTDEE } from '@/lib/calorie-calculator';
import { Calendar, TrendingDown, ChevronRight, Utensils, Flame, Trash2 } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  meals: MealRecord[];
  profile: UserProfile;
  onDeleteMeal: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  meals,
  profile,
  onDeleteMeal,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (!isOpen) return null;

  const bmr = calculateBMR(profile.gender, profile.weight_kg, profile.height_cm, profile.age);
  const tdee = calculateTDEE(bmr, profile.activity_level);

  // 按日期归类餐食数据 (YYYY-MM-DD)
  const groupedMealsByDate = meals.reduce((acc, meal) => {
    const dateKey = meal.eaten_at ? meal.eaten_at.split('T')[0] : new Date().toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(meal);
    return acc;
  }, {} as Record<string, MealRecord[]>);

  const sortedDates = Object.keys(groupedMealsByDate).sort((a, b) => b.localeCompare(a));
  const todayStr = new Date().toISOString().split('T')[0];

  // 选中的日期的餐单明细
  const activeDate = selectedDate || sortedDates[0] || todayStr;
  const currentDayMeals = groupedMealsByDate[activeDate] || [];
  const currentDayIntake = currentDayMeals.reduce((sum, m) => sum + m.calories, 0);
  const currentDayDeficit = tdee - currentDayIntake;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-4 pt-12 pb-8 overflow-y-auto">
      <div className="space-y-4 max-w-lg mx-auto w-full flex-1 flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center flex-shrink-0">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              减脂打卡档案
            </span>
            <h2 className="text-xl font-extrabold text-white">历史饮食与缺口记录</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* 1. 近 7 天日历轴选择栏 */}
        <div className="flex gap-2 overflow-x-auto pb-1 flex-shrink-0">
          {sortedDates.map((date) => {
            const isToday = date === todayStr;
            const isSelected = activeDate === date;
            const dayMeals = groupedMealsByDate[date] || [];
            const dayIntake = dayMeals.reduce((sum, m) => sum + m.calories, 0);
            const isDeficitAchieved = (tdee - dayIntake) >= (profile.target_deficit_kcal - 100);

            // 格式化月份和日
            const dateObj = new Date(date);
            const monthDay = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            const weekday = weekdayNames[dateObj.getDay()];

            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-2xl flex flex-col items-center min-w-[76px] transition border ${
                  isSelected
                    ? 'bg-zinc-800 border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/60'
                }`}
              >
                <span className="text-[10px] text-zinc-400 font-medium">
                  {isToday ? '今天' : weekday}
                </span>
                <span className="text-sm font-extrabold text-white my-0.5">{monthDay}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full mt-1 ${
                    isDeficitAchieved
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {dayIntake}k
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. 当日热量总结卡片 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4.5 space-y-3 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white">
                {activeDate === todayStr ? '今天' : activeDate} 减脂汇总
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              全天总消耗 (TDEE): {tdee} kcal
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-3 rounded-2xl">
            <div>
              <span className="text-[10px] text-zinc-500 block font-medium">当天摄入</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-white font-sans">{currentDayIntake}</span>
                <span className="text-xs text-zinc-500">kcal</span>
              </div>
            </div>

            <div className="pl-3 border-l border-zinc-800">
              <span className="text-[10px] text-zinc-500 block font-medium">制造热量缺口</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={`text-xl font-black font-sans ${
                    currentDayDeficit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {currentDayDeficit >= 0 ? `+${currentDayDeficit}` : currentDayDeficit}
                </span>
                <span className="text-xs text-zinc-500">kcal</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 当日餐食列表流水 */}
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            餐次明细 ({currentDayMeals.length} 餐)
          </span>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {currentDayMeals.length === 0 ? (
              <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-6 text-center text-xs text-zinc-500">
                该日期暂无餐食打卡记录
              </div>
            ) : (
              currentDayMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-lg">
                      {meal.emoji}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">{meal.food_name}</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        蛋 {meal.protein_g}g · 碳 {meal.carbs_g}g · 脂 {meal.fat_g}g
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
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
    </div>
  );
};
