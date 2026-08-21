'use client';

import React, { useState, useEffect } from 'react';
import {
  DEFAULT_PROFILE,
  calculateBMR,
  calculateTDEE,
  calculateLiveBurnedCalories,
} from '@/lib/calorie-calculator';
import { UserProfile, MealRecord, FoodAnalysisResult, MealType } from '@/types';
import { DeficitDualRing } from '@/components/DeficitDualRing';
import { CameraScanModal } from '@/components/CameraScanModal';
import { SettingsModal } from '@/components/SettingsModal';
import {
  Camera,
  Settings,
  Flame,
  Plus,
  Trash2,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [liveBurned, setLiveBurned] = useState(0);

  // 初始化加载 LocalStorage 数据
  useEffect(() => {
    const savedProfile = localStorage.getItem('caloai_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Failed to parse saved profile', e);
      }
    }

    const savedMeals = localStorage.getItem('caloai_meals');
    if (savedMeals) {
      try {
        setMeals(JSON.parse(savedMeals));
      } catch (e) {
        console.error('Failed to parse saved meals', e);
      }
    } else {
      const initialMock: MealRecord[] = [
        {
          id: '1',
          meal_type: 'breakfast',
          food_name: '水煮蛋与全麦吐司',
          emoji: '🍳',
          calories: 320,
          protein_g: 18.0,
          carbs_g: 28.0,
          fat_g: 12.0,
          ingredients: [
            { name: '鸡蛋', weight: '100g', calories: 140 },
            { name: '全麦面包', weight: '60g', calories: 150 },
          ],
          ai_advice: '高饱腹感优质蛋白质与复合碳水，适合开启一天。',
          eaten_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        },
        {
          id: '2',
          meal_type: 'lunch',
          food_name: '香煎鸡胸肉藜麦沙拉',
          emoji: '🥗',
          calories: 480,
          protein_g: 42.0,
          carbs_g: 45.0,
          fat_g: 11.0,
          ingredients: [
            { name: '鸡胸肉', weight: '150g', calories: 200 },
            { name: '藜麦与生菜', weight: '120g', calories: 180 },
          ],
          ai_advice: '蛋白质充足，热量控制得当。',
          eaten_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        },
      ];
      setMeals(initialMock);
      localStorage.setItem('caloai_meals', JSON.stringify(initialMock));
    }
  }, []);

  // 实时更新已消耗代谢 (每分钟更新一次)
  useEffect(() => {
    const bmr = calculateBMR(profile.gender, profile.weight_kg, profile.height_cm, profile.age);
    const tdee = calculateTDEE(bmr, profile.activity_level);

    const updateBurn = () => {
      setLiveBurned(calculateLiveBurnedCalories(tdee));
    };

    updateBurn();
    const interval = setInterval(updateBurn, 60000);
    return () => clearInterval(interval);
  }, [profile]);

  // 计算今日总热量与三大宏量
  const totalIntake = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein_g, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs_g, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat_g, 0);

  const bmr = calculateBMR(profile.gender, profile.weight_kg, profile.height_cm, profile.age);
  const tdee = calculateTDEE(bmr, profile.activity_level);

  // 实时热量缺口 = 实时已消耗 - 已摄入
  const liveDeficit = liveBurned - totalIntake;

  // 保存个人资料
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('caloai_profile', JSON.stringify(newProfile));
  };

  // 添加一餐
  const handleConfirmMeal = (result: FoodAnalysisResult, mealType: MealType) => {
    const newRecord: MealRecord = {
      id: Date.now().toString(),
      meal_type: mealType,
      food_name: result.food_name,
      emoji: result.emoji || '🥗',
      calories: result.calories,
      protein_g: result.protein_g,
      carbs_g: result.carbs_g,
      fat_g: result.fat_g,
      ingredients: result.ingredients || [],
      ai_advice: result.ai_advice,
      eaten_at: new Date().toISOString(),
    };

    const updated = [newRecord, ...meals];
    setMeals(updated);
    localStorage.setItem('caloai_meals', JSON.stringify(updated));
  };

  // 删除餐次
  const handleDeleteMeal = (id: string) => {
    const updated = meals.filter((m) => m.id !== id);
    setMeals(updated);
    localStorage.setItem('caloai_meals', JSON.stringify(updated));
  };

  return (
    <main className="h-screen max-w-md mx-auto flex flex-col justify-between p-3.5 pb-20 overflow-hidden select-none">
      {/* 顶部标题栏 (精致极简) */}
      <header className="flex justify-between items-center py-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-extrabold text-xs shadow-md shadow-emerald-500/20">
            ⚡
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-none">CaloAI</h1>
            <p className="text-[9px] text-zinc-500 font-medium mt-0.5">热量缺口减脂模式</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition active:scale-95 shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 核心紧凑仪表盘容器 (无需上下滚动) */}
      <div className="flex-1 flex flex-col justify-between py-1 space-y-2 overflow-hidden">
        
        {/* 1. 双环卡路里缺口仪表盘 (紧凑精细) */}
        <DeficitDualRing
          deficit={liveDeficit}
          burnedLive={liveBurned}
          tdee={tdee}
          intake={totalIntake}
          targetDeficit={profile.target_deficit_kcal}
        />

        {/* 2. 三大宏量营养素胶囊标签 (紧凑横排) */}
        <div className="grid grid-cols-3 gap-1.5 flex-shrink-0">
          <div className="bg-zinc-900/90 border border-zinc-800 p-2 rounded-2xl">
            <span className="text-[9px] text-blue-400 font-medium block leading-none">蛋白质</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xs font-bold text-white">{Math.round(totalProtein)}</span>
              <span className="text-[9px] text-zinc-500">/ 110g</span>
            </div>
            <div className="w-full bg-zinc-950 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${Math.min((totalProtein / 110) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 p-2 rounded-2xl">
            <span className="text-[9px] text-amber-400 font-medium block leading-none">碳水化合物</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xs font-bold text-white">{Math.round(totalCarbs)}</span>
              <span className="text-[9px] text-zinc-500">/ 160g</span>
            </div>
            <div className="w-full bg-zinc-950 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${Math.min((totalCarbs / 160) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 p-2 rounded-2xl">
            <span className="text-[9px] text-rose-400 font-medium block leading-none">优质脂肪</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xs font-bold text-white">{Math.round(totalFat)}</span>
              <span className="text-[9px] text-zinc-500">/ 45g</span>
            </div>
            <div className="w-full bg-zinc-950 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${Math.min((totalFat / 45) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. 紧凑型 AI 拍照卡片入口 */}
        <div
          onClick={() => setIsCameraOpen(true)}
          className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-3 text-white shadow-md shadow-emerald-500/20 cursor-pointer active:scale-[0.98] transition flex-shrink-0"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[9px] font-bold backdrop-blur-sm">
                <Sparkles className="w-2.5 h-2.5" /> OpenAI GPT-4o mini
              </span>
              <h3 className="text-xs font-extrabold leading-snug">拍照分析食物热量</h3>
              <p className="text-[10px] text-emerald-100">阅后即焚零存图 · 秒级食材分解</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center text-xl shadow-inner backdrop-blur-md">
              📸
            </div>
          </div>
        </div>

        {/* 4. 今日餐次记录卡片 (自动适应剩余高度) */}
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-2.5 space-y-1.5 overflow-hidden">
          <div className="flex justify-between items-center px-1 flex-shrink-0">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              今日餐次明细 ({meals.length} 餐)
            </h3>
            <button
              onClick={() => setIsCameraOpen(true)}
              className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> 记一餐
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
            {meals.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-zinc-500 text-[11px]">
                点击上方「拍照分析」开始打卡 🥗
              </div>
            ) : (
              meals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-zinc-950/80 border border-zinc-800/80 p-2 rounded-xl flex items-center justify-between transition hover:border-zinc-700"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-base">
                      {meal.emoji}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-none">{meal.food_name}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        蛋 {meal.protein_g}g · 碳 {meal.carbs_g}g · 脂 {meal.fat_g}g
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-white">+{meal.calories}</span>
                      <span className="text-[8px] text-zinc-500 block font-mono leading-none">kcal</span>
                    </div>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="text-zinc-600 hover:text-red-400 transition p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 底部固定导航条 (精美居中对齐，高度收窄) */}
      <nav className="fixed bottom-0 inset-x-0 h-16 glass-nav border-t border-zinc-800/80 px-8 flex justify-around items-center z-40 max-w-md mx-auto">
        <button className="flex flex-col items-center gap-0.5 text-emerald-400 font-bold">
          <Flame className="w-4 h-4" />
          <span className="text-[9px] leading-none">今日缺口</span>
        </button>

        {/* 悬浮居中对齐拍照按钮 */}
        <button
          onClick={() => setIsCameraOpen(true)}
          className="-top-3 relative active:scale-95 transition"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-black font-extrabold">
            <Camera className="w-6 h-6" />
          </div>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-0.5 text-zinc-500 hover:text-zinc-300"
        >
          <Settings className="w-4 h-4" />
          <span className="text-[9px] leading-none">体征模型</span>
        </button>
      </nav>

      {/* 弹窗组件 */}
      <CameraScanModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onConfirmMeal={handleConfirmMeal}
        openrouterKey={profile.openrouter_key}
        preferredModel={profile.preferred_model}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />
    </main>
  );
}
