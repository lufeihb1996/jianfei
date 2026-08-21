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
import { TrendAnalysisView } from '@/components/TrendAnalysisView';
import {
  Camera,
  Settings,
  Flame,
  Plus,
  Trash2,
  Sparkles,
  TrendingDown,
} from 'lucide-react';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<'today' | 'trends'>('today');
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

  // 计算今日总热量与三大宏量 (仅筛选当天的数据)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(
    (m) => (m.eaten_at ? m.eaten_at.split('T')[0] : '') === todayStr
  );

  const totalIntake = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + m.protein_g, 0);
  const totalCarbs = todayMeals.reduce((sum, m) => sum + m.carbs_g, 0);
  const totalFat = todayMeals.reduce((sum, m) => sum + m.fat_g, 0);

  const bmr = calculateBMR(profile.gender, profile.weight_kg, profile.height_cm, profile.age);
  const tdee = calculateTDEE(bmr, profile.activity_level);

  // 实时热量缺口 = 实时已消耗 - 已摄入
  const liveDeficit = liveBurned - totalIntake;

  // 保存个人资料
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('caloai_profile', JSON.stringify(newProfile));
  };

  // 更新当前体重
  const handleUpdateWeight = (newWeight: number) => {
    const updated = { ...profile, weight_kg: newWeight };
    setProfile(updated);
    localStorage.setItem('caloai_profile', JSON.stringify(updated));
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
    <main className="min-h-screen max-w-md mx-auto flex flex-col justify-between pb-28 pt-4 px-4 select-none">
      {/* 顶部标题栏 (去掉了右上角设置按钮，保持干净极简) */}
      <header className="flex justify-between items-center py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-extrabold text-sm shadow-md shadow-emerald-500/20">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">CaloAI</h1>
            <p className="text-[10px] text-zinc-500 font-medium">科学减脂与热量赤字模型</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-medium font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {profile.preferred_model.split('/')[1] || 'GPT-4o mini'}
        </div>
      </header>

      {/* TAB 1: 今日缺口 (Today Tab) */}
      {currentTab === 'today' && (
        <div className="space-y-4 mt-2 animate-fadeIn">
          {/* 1. 核心双环热量缺口看板 */}
          <DeficitDualRing
            deficit={liveDeficit}
            burnedLive={liveBurned}
            tdee={tdee}
            intake={totalIntake}
            targetDeficit={profile.target_deficit_kcal}
          />

          {/* 2. 三大宏量营养素胶囊标签 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-2xl">
              <span className="text-[10px] text-blue-400 font-medium block">蛋白质</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold text-white">{Math.round(totalProtein)}</span>
                <span className="text-[10px] text-zinc-500">/ 110g</span>
              </div>
              <div className="w-full bg-zinc-950 h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${Math.min((totalProtein / 110) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-2xl">
              <span className="text-[10px] text-amber-400 font-medium block">碳水化合物</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold text-white">{Math.round(totalCarbs)}</span>
                <span className="text-[10px] text-zinc-500">/ 160g</span>
              </div>
              <div className="w-full bg-zinc-950 h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min((totalCarbs / 160) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-2xl">
              <span className="text-[10px] text-rose-400 font-medium block">优质脂肪</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold text-white">{Math.round(totalFat)}</span>
                <span className="text-[10px] text-zinc-500">/ 45g</span>
              </div>
              <div className="w-full bg-zinc-950 h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${Math.min((totalFat / 45) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. AI 拍照上传卡片入口 */}
          <div
            onClick={() => setIsCameraOpen(true)}
            className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-4 text-white shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-[0.98] transition"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold backdrop-blur-sm">
                  <Sparkles className="w-3 h-3" /> OpenRouter 视觉 AI
                </span>
                <h3 className="text-base font-extrabold leading-snug">拍照分析食物热量</h3>
                <p className="text-xs text-emerald-100">阅后即焚零存图 · 自动拆解配料与减脂建议</p>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-2xl shadow-inner backdrop-blur-md">
                📸
              </div>
            </div>
          </div>

          {/* 4. 今日餐次记录流 */}
          <div className="space-y-2.5 pt-1">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                今日饮食明细 ({todayMeals.length} 餐)
              </h3>
              <button
                onClick={() => setIsCameraOpen(true)}
                className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5"
              >
                <Plus className="w-3.5 h-3.5" /> 拍一餐
              </button>
            </div>

            {todayMeals.length === 0 ? (
              <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl p-8 text-center text-zinc-500 text-xs">
                今天还没有记录任何餐食，点击上方「拍照分析」开始打卡吧 🥗
              </div>
            ) : (
              todayMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-zinc-900 border border-zinc-800/90 p-3.5 rounded-2xl flex items-center justify-between transition hover:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xl">
                      {meal.emoji}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{meal.food_name}</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
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
                      onClick={() => handleDeleteMeal(meal.id)}
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
      )}

      {/* TAB 2: 减重趋势与历史分析 (Trends Tab) */}
      {currentTab === 'trends' && (
        <div className="mt-2 animate-fadeIn">
          <TrendAnalysisView
            meals={meals}
            profile={profile}
            onUpdateWeight={handleUpdateWeight}
            onDeleteMeal={handleDeleteMeal}
          />
        </div>
      )}

      {/* 底部固定导航条 (4 个按钮在同一水平线：今日缺口、拍照识别、减重趋势、个人设置) */}
      <nav className="fixed bottom-0 inset-x-0 h-16 glass-nav border-t border-zinc-800/80 px-3 flex justify-around items-center z-40 max-w-md mx-auto">
        <button
          onClick={() => setCurrentTab('today')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition ${
            currentTab === 'today'
              ? 'text-emerald-400 font-bold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span className="text-[10px] leading-none">今日缺口</span>
        </button>

        {/* 拍照识别 */}
        <button
          onClick={() => setIsCameraOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-400 hover:text-teal-300 active:scale-95 transition font-bold"
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px] leading-none">拍照识别</span>
        </button>

        {/* 减重趋势 */}
        <button
          onClick={() => setCurrentTab('trends')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition ${
            currentTab === 'trends'
              ? 'text-purple-400 font-bold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <TrendingDown className="w-5 h-5" />
          <span className="text-[10px] leading-none">减重趋势</span>
        </button>

        {/* 个人体征与模型设置 */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 active:scale-95 transition"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] leading-none">体征设置</span>
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
