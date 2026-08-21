# CaloAI - 拍照智能减脂饮食助手 (iOS Standalone PWA)

基于 **Next.js 15 (App Router) + Tailwind CSS + OpenRouter 视觉大模型 + Supabase** 开发的极简减脂应用。

---

## ✨ 核心特性

1. **双环卡路里缺口仪表盘 (Deficit Dual Ring)**：
   - 依据 **Mifflin-St Jeor** 国际公认公式，根据用户填写的**性别、年龄、身高、当前体重、日常活动强度**精确计算出 **BMR（基础代谢）** 与 **TDEE（每日总消耗）**。
   - **紫色外环**：自然消耗进度（随着 24 小时时间流逝实时自然累加）。
   - **橙色内环**：已摄入食物热量进度。
   - **中心核心指标**：当前**实时热量缺口**（如 `+1,013 kcal`）。
2. **AI 拍照秒级分析（OpenRouter 多模态）**：
   - 自由调度 `google/gemini-2.5-flash`、`anthropic/claude-3.5-sonnet`、`openai/gpt-4o-mini`。
   - 自动识别食材配料、精准估重（g）、拆解蛋白质/碳水/脂肪并给出营养学减脂建议。
3. **阅后即焚（0 存储成本）**：
   - 拍照后由前端 HTML5 Canvas 自动压缩至 500KB 以内发给 AI，解析完后**立即丢弃图片内存**，云端与本地只存储结构化 JSON，100% 保护隐私且零存储费用。
4. **iOS 主屏幕 Standalone PWA**：
   - 适配 `manifest.json` 与 iOS Safe Area，Safari 点击「分享」➔「添加到主屏幕」即可享受无地址栏、无原生浏览器边框的沉浸式原生体验。

---

## 🚀 本地开发与启动

```bash
cd D:\projects\diet-ai-app

# 1. 安装依赖
pnpm install

# 2. 启动本地开发服务
pnpm dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

---

## 🗄️ Supabase 数据库部署

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)，新建一个项目。
2. 进入 **SQL Editor**，将根目录下的 `supabase_schema.sql` 粘贴并运行。
3. 在项目设置中获取 `Project URL` 和 `anon key`，填入 `.env.local`：
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 🚢 一键部署到 Vercel

```bash
# 安装 Vercel CLI (若未安装)
npm i -g vercel

# 部署
vercel
```
在 Vercel 环境变量中配置 `OPENROUTER_API_KEY`（或者让用户直接在 App 的设置页填写自己的 API Key）。
