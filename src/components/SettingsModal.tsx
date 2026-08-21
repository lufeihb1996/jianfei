'use client';

import React, { useState } from 'react';
import { UserProfile, Gender } from '@/types';
import { calculateBMR, calculateTDEE } from '@/lib/calorie-calculator';
import { ShieldCheck, Cpu, Key, Activity, Target } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (newProfile: UserProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [gender, setGender] = React.useState<Gender>(profile.gender);
  const [ageStr, setAgeStr] = React.useState<string>(profile.age.toString());
  const [heightStr, setHeightStr] = React.useState<string>(profile.height_cm.toString());
  const [weightStr, setWeightStr] = React.useState<string>(profile.weight_kg.toString());
  const [initialWeightStr, setInitialWeightStr] = React.useState<string>(
    (profile.initial_weight_kg || profile.weight_kg + 3.5).toString()
  );
  const [targetWeightStr, setTargetWeightStr] = React.useState<string>(
    profile.target_weight_kg.toString()
  );
  const [activityLevel, setActivityLevel] = React.useState<number>(profile.activity_level);
  const [targetDeficit, setTargetDeficit] = React.useState<number>(profile.target_deficit_kcal);
  const [openrouterKey, setOpenrouterKey] = React.useState<string>(profile.openrouter_key);
  const [preferredModel, setPreferredModel] = React.useState<string>(profile.preferred_model);

  React.useEffect(() => {
    setGender(profile.gender);
    setAgeStr(profile.age.toString());
    setHeightStr(profile.height_cm.toString());
    setWeightStr(profile.weight_kg.toString());
    setInitialWeightStr((profile.initial_weight_kg || profile.weight_kg + 3.5).toString());
    setTargetWeightStr(profile.target_weight_kg.toString());
    setActivityLevel(profile.activity_level);
    setTargetDeficit(profile.target_deficit_kcal);
    setOpenrouterKey(profile.openrouter_key);
    setPreferredModel(profile.preferred_model);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const parsedAge = Math.min(Math.max(parseInt(ageStr) || 25, 10), 120);
  const parsedHeight = Math.min(Math.max(parseFloat(heightStr) || 170, 80), 250);
  const parsedWeight = Math.min(Math.max(parseFloat(weightStr) || 65, 25), 300);
  const parsedInitialWeight = Math.min(Math.max(parseFloat(initialWeightStr) || 72, 25), 300);
  const parsedTargetWeight = Math.min(Math.max(parseFloat(targetWeightStr) || 60, 25), 300);

  const bmr = calculateBMR(gender, parsedWeight, parsedHeight, parsedAge);
  const tdee = calculateTDEE(bmr, activityLevel);

  const handleSave = () => {
    onSaveProfile({
      gender,
      age: parsedAge,
      height_cm: parsedHeight,
      initial_weight_kg: parsedInitialWeight,
      weight_kg: parsedWeight,
      target_weight_kg: parsedTargetWeight,
      activity_level: activityLevel,
      target_deficit_kcal: targetDeficit,
      openrouter_key: openrouterKey,
      preferred_model: preferredModel || 'openai/gpt-4o-mini',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-4 pt-12 pb-8 overflow-y-auto">
      <div className="space-y-4 max-w-lg mx-auto w-full">
        {/* 头部 */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              个人设置 & AI 配置
            </span>
            <h2 className="text-xl font-extrabold text-white">减重参数 & 模型引擎</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* 1. 身体生理体征与减重目标 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white">个人体征参数 (计算热量缺口)</h3>
            </div>
            <span className="text-[10px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full font-mono">
              BMR / TDEE
            </span>
          </div>

          {/* 性别选择 */}
          <div className="grid grid-cols-2 gap-2">
            {(['male', 'female'] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  gender === g
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {g === 'male' ? '👨 男性' : '👩 女性'}
              </button>
            ))}
          </div>

          {/* 年龄、身高、当前体重 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80 focus-within:border-purple-500 transition">
              <span className="text-[10px] text-zinc-500 font-medium block">年龄</span>
              <div className="flex items-baseline gap-1 mt-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={ageStr}
                  onChange={(e) => setAgeStr(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                  placeholder="25"
                />
                <span className="text-[10px] text-zinc-500">岁</span>
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80 focus-within:border-purple-500 transition">
              <span className="text-[10px] text-zinc-500 font-medium block">身高</span>
              <div className="flex items-baseline gap-1 mt-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={heightStr}
                  onChange={(e) => setHeightStr(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                  placeholder="175"
                />
                <span className="text-[10px] text-zinc-500">cm</span>
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80 focus-within:border-purple-500 transition">
              <span className="text-[10px] text-zinc-500 font-medium block">当前体重</span>
              <div className="flex items-baseline gap-1 mt-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={weightStr}
                  onChange={(e) => setWeightStr(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                  placeholder="68.5"
                />
                <span className="text-[10px] text-zinc-500">kg</span>
              </div>
            </div>
          </div>

          {/* 初始体重与目标体重 */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/60">
            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 font-medium block">减重前初始体重</span>
              <div className="flex items-baseline gap-1 mt-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={initialWeightStr}
                  onChange={(e) => setInitialWeightStr(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                  placeholder="72.0"
                />
                <span className="text-[10px] text-zinc-500">kg</span>
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80">
              <span className="text-[10px] text-emerald-400 font-medium block">🎯 目标体重</span>
              <div className="flex items-baseline gap-1 mt-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={targetWeightStr}
                  onChange={(e) => setTargetWeightStr(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-emerald-400 focus:outline-none"
                  placeholder="62.0"
                />
                <span className="text-[10px] text-zinc-500">kg</span>
              </div>
            </div>
          </div>

          {/* 活动系数 */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              日常活动水平 (TDEE 系数)
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="1.2">久坐少动 / 办公室 (×1.2)</option>
              <option value="1.375">轻度运动 / 每周 1-3 天 (×1.375)</option>
              <option value="1.55">中度运动 / 每周 3-5 天 (×1.55)</option>
              <option value="1.725">高强度运动 / 几乎每天 (×1.725)</option>
            </select>
          </div>

          {/* 实时计算结果 */}
          <div className="bg-gradient-to-br from-purple-950/30 to-indigo-950/20 p-3 rounded-2xl border border-purple-900/40 flex justify-around text-center">
            <div>
              <span className="text-[10px] text-purple-400 font-semibold block">基础代谢 BMR</span>
              <span className="text-sm font-bold text-white">
                {bmr} <small className="text-[10px] text-zinc-500 font-normal">kcal</small>
              </span>
            </div>
            <div className="w-px bg-purple-900/40" />
            <div>
              <span className="text-[10px] text-purple-400 font-semibold block">总消耗 TDEE</span>
              <span className="text-sm font-bold text-white">
                {tdee} <small className="text-[10px] text-zinc-500 font-normal">kcal</small>
              </span>
            </div>
            <div className="w-px bg-purple-900/40" />
            <div>
              <span className="text-[10px] text-emerald-400 font-semibold block">建议每日缺口</span>
              <span className="text-sm font-bold text-emerald-400">
                -{targetDeficit} <small className="text-[10px] text-zinc-500 font-normal">kcal</small>
              </span>
            </div>
          </div>
        </div>

        {/* 2. OpenRouter API 密钥配置 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white">OpenRouter API 密钥</h3>
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> 本地安全存储
            </span>
          </div>

          <input
            type="password"
            placeholder="sk-or-v1-..."
            value={openrouterKey}
            onChange={(e) => setOpenrouterKey(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <p className="text-[11px] text-zinc-500">
            支持使用您自己的 OpenRouter 密钥，零服务端留存，随心调用。
          </p>
        </div>

        {/* 3. 视觉模型选择 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4.5 space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white">食物识别多模态模型</h3>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'openai/gpt-4o-mini',
                name: 'openai/gpt-4o-mini',
                desc: 'OpenAI 官方超低价多模态，极速稳定 (~$0.00015/次)',
                tag: 'OpenAI 推荐',
              },
              {
                id: 'openai/gpt-4o',
                name: 'openai/gpt-4o',
                desc: 'OpenAI 旗舰多模态大模型，复杂场景高精度解析',
                tag: 'OpenAI 旗舰',
              },
              {
                id: 'google/gemini-2.0-flash-001',
                name: 'google/gemini-2.0-flash',
                desc: '秒级极速响应，1 元能拍 1400+ 次，极致便宜',
                tag: '极致性价比',
              },
              {
                id: 'qwen/qwen-2.5-vl-72b-instruct',
                name: 'qwen/qwen-2.5-vl-72b',
                desc: '阿里千问最新多模态，中餐与外卖复杂配料识别最准',
                tag: '中餐最强',
              },
            ].map((m) => (
              <label
                key={m.id}
                onClick={() => setPreferredModel(m.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                  preferredModel === m.id
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-800/40'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {m.name}
                    <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded">
                      {m.tag}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500">{m.desc}</span>
                </div>
                <input
                  type="radio"
                  name="preferred_model"
                  checked={preferredModel === m.id}
                  onChange={() => {}}
                  className="accent-emerald-500"
                />
              </label>
            ))}

            {/* 自定义输入任意 OpenRouter 模型 */}
            <div className="pt-1">
              <label className="text-[10px] text-zinc-400 font-medium block mb-1">
                或直接输入任意 OpenRouter 模型 ID：
              </label>
              <input
                type="text"
                placeholder="例如: openai/gpt-4o-mini 或自定义模型"
                value={preferredModel}
                onChange={(e) => setPreferredModel(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="pt-4 max-w-lg mx-auto w-full">
        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-500/20"
        >
          保存设置
        </button>
      </div>
    </div>
  );
};
