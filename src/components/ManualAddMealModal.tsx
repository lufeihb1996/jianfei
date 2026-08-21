'use client';

import React, { useState } from 'react';
import { MealType, FoodAnalysisResult } from '@/types';
import { PlusCircle, Utensils, Check } from 'lucide-react';

interface ManualAddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (result: FoodAnalysisResult, mealType: MealType) => void;
}

export const ManualAddMealModal: React.FC<ManualAddMealModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [emoji, setEmoji] = useState('🥗');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !calories) return;

    const result: FoodAnalysisResult = {
      food_name: foodName,
      emoji: emoji || '🍲',
      calories: parseInt(calories) || 0,
      protein_g: parseFloat(protein) || 0,
      carbs_g: parseFloat(carbs) || 0,
      fat_g: parseFloat(fat) || 0,
      confidence: 1.0,
      ingredients: [{ name: foodName, weight: '1份', calories: parseInt(calories) || 0 }],
      ai_advice: '手动记录餐食，请继续保持健康均衡饮食。',
    };

    onConfirm(result, mealType);
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    onClose();
  };

  const quickEmojis = ['🍳', '🥗', '🥩', '🍚', '🥪', '☕', '🍎', '🍜', '🥑', '🍗'];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-4 pt-12 pb-8 overflow-y-auto">
      <div className="space-y-4 max-w-lg mx-auto w-full">
        {/* 头部 */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              手动打卡 / 自定义记录
            </span>
            <h2 className="text-xl font-extrabold text-white">记录一餐饮食</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* 餐次选择 */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-2xl p-1 gap-1">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => {
            const labelMap = { breakfast: '🍳 早餐', lunch: '🥗 午餐', dinner: '🥩 晚餐', snack: '☕ 加餐' };
            const isActive = mealType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setMealType(type)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {labelMap[type]}
              </button>
            );
          })}
        </div>

        {/* 图标快捷选择 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-2">
          <label className="text-[11px] font-bold text-zinc-400 block">选择代表图标</label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickEmojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center transition flex-shrink-0 ${
                  emoji === e
                    ? 'bg-emerald-500/20 border-2 border-emerald-500 scale-105'
                    : 'bg-zinc-950 border border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* 食物名称与热量 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-3">
          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1">食物名称 *</label>
            <input
              type="text"
              required
              placeholder="例如: 燕麦酸奶碗 / 减脂牛排"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1">热量 (kcal) *</label>
            <input
              type="text"
              inputMode="numeric"
              required
              placeholder="例如: 380"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* 宏量选填 */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80">
              <span className="text-[10px] text-blue-400 font-medium block">蛋白质 (g)</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-white mt-1 focus:outline-none"
              />
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80">
              <span className="text-[10px] text-amber-400 font-medium block">碳水 (g)</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-white mt-1 focus:outline-none"
              />
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80">
              <span className="text-[10px] text-rose-400 font-medium block">脂肪 (g)</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-white mt-1 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="pt-4 max-w-lg mx-auto w-full">
        <button
          type="button"
          onClick={handleSave}
          disabled={!foodName || !calories}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 active:scale-[0.98] transition text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          确认记入今日缺口
        </button>
      </div>
    </div>
  );
};
