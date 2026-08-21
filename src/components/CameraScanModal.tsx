'use client';

import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Check, RefreshCw } from 'lucide-react';
import { FoodAnalysisResult, MealType } from '@/types';

interface CameraScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmMeal: (result: FoodAnalysisResult, mealType: MealType) => void;
  openrouterKey?: string;
  preferredModel?: string;
}

export const CameraScanModal: React.FC<CameraScanModalProps> = ({
  isOpen,
  onClose,
  onConfirmMeal,
  openrouterKey,
  preferredModel = 'google/gemini-2.5-flash',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // 压缩图片并转 Base64 (节约 Token 与带宽，阅后即焚零云端存储)
  const processAndAnalyzeImage = (file: File) => {
    setErrorMessage(null);
    setAnalyzing(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const scaleSize = MAX_WIDTH / Math.max(img.width, img.height);
        const targetWidth = img.width > MAX_WIDTH ? img.width * scaleSize : img.width;
        const targetHeight = img.height > MAX_WIDTH ? img.height * scaleSize : img.height;

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, targetWidth, targetHeight);

        // 导出压缩 JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        setSelectedImage(compressedBase64);

        // 调用服务端 OpenRouter API
        callAnalyzeAPI(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const callAnalyzeAPI = async (base64Data: string) => {
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          model: preferredModel,
          customApiKey: openrouterKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || '食物识别失败');
      }

      setAnalysisResult(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '识别网络异常';
      setErrorMessage(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAndAnalyzeImage(e.target.files[0]);
    }
  };

  const handleConfirm = () => {
    if (analysisResult) {
      onConfirmMeal(analysisResult, mealType);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 pt-12 pb-8 overflow-y-auto">
      {/* 隐藏的真实文件输入框 (支持拍照 capture 与相册) */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 顶部控制栏 */}
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={() => {
            handleReset();
            onClose();
          }}
          className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-sm"
        >
          ✕
        </button>

        {/* 餐次选择器 */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-full p-1 gap-1 text-xs">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => {
            const labelMap = { breakfast: '早', lunch: '午', dinner: '晚', snack: '加餐' };
            const isActive = mealType === type;
            return (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  isActive
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {labelMap[type]}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-zinc-400 font-mono bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
          {preferredModel.split('/')[1] || 'Gemini'}
        </div>
      </div>

      {/* 中部：相机取景框 / 预览区域 */}
      <div className="relative flex-1 w-full max-h-[380px] bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 flex items-center justify-center">
        {selectedImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Food Preview"
              className="w-full h-full object-cover filter brightness-95"
            />
            {analyzing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                <div className="scanner-laser absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]" />
                <div className="bg-black/70 px-4 py-2 rounded-2xl border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  AI 正在深度解析食材与热量...
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-zinc-500 text-center p-6">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-zinc-300">对准食物拍照，或从相册选取</p>
            <p className="text-xs text-zinc-500">
              AI 将秒级识别食物重量、卡路里与三大宏量营养素
            </p>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {errorMessage && (
        <div className="my-2 p-3 bg-red-950/50 border border-red-800/60 rounded-2xl text-xs text-red-300">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* 底部：AI 分析结果卡片 */}
      {analysisResult && (
        <div className="my-3 bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-3 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{analysisResult.emoji || '🥗'}</span>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {analysisResult.food_name}
                </h3>
                <span className="text-xs text-emerald-400 font-medium">
                  识别置信度 {Math.round((analysisResult.confidence || 0.95) * 100)}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-white font-sans">
                {analysisResult.calories}
              </span>
              <span className="text-xs text-zinc-400 block">kcal</span>
            </div>
          </div>

          {/* 营养素拆解 */}
          <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-2.5 rounded-2xl text-center text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px]">蛋白质</span>
              <b className="text-blue-400">{analysisResult.protein_g}g</b>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">碳水化合物</span>
              <b className="text-amber-400">{analysisResult.carbs_g}g</b>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">优质脂肪</span>
              <b className="text-rose-400">{analysisResult.fat_g}g</b>
            </div>
          </div>

          {/* 食材配料分解明细 */}
          {analysisResult.ingredients && analysisResult.ingredients.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                食材分解明细
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {analysisResult.ingredients.map((item, idx) => (
                  <span
                    key={idx}
                    className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-xl text-[11px] flex items-center gap-1"
                  >
                    <span>{item.name} ({item.weight})</span>
                    <b className="text-zinc-400">{item.calories}kcal</b>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI 减脂建议 */}
          {analysisResult.ai_advice && (
            <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 leading-relaxed">
              💡 {analysisResult.ai_advice}
            </div>
          )}
        </div>
      )}

      {/* 底部主操作区 */}
      <div className="flex items-center justify-around gap-4 pt-2">
        {!selectedImage ? (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <ImageIcon className="w-4 h-4" />
              相册选取
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-emerald-500/20"
            >
              <Camera className="w-4 h-4" />
              立刻拍照
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleReset}
              className="py-3 px-4 bg-zinc-800 text-zinc-300 rounded-2xl text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              重拍
            </button>
            {analysisResult && (
              <button
                onClick={handleConfirm}
                className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4" />
                确认并记入缺口
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
