-- ==========================================
-- CaloAI 极简饮食数据库架构 (零图片存储)
-- ==========================================

-- 1. 用户基础体征与减重目标表 (用于实时精确计算 BMR, TDEE, 赤字)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  gender text check (gender in ('male', 'female')) default 'male',
  age integer default 25,
  height_cm numeric(5,2) default 175.0,
  weight_kg numeric(5,2) default 70.0,
  target_weight_kg numeric(5,2) default 65.0,
  activity_level numeric(4,3) default 1.375, -- 1.2(久坐), 1.375(轻度), 1.55(中度), 1.725(高强度)
  target_deficit_kcal integer default 400,     -- 期望每日制造的热量缺口
  custom_openrouter_key text,                 -- 可选：云端同步的用户自定义 OpenRouter 密钥
  preferred_model text default 'google/gemini-2.5-flash',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用 profiles 表的行级安全策略 (RLS)
alter table public.profiles enable row level security;

create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);


-- 2. 饮食记录明细表 (纯文本结构化，阅后即焚零图片存储)
create table if not exists public.meals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')) not null,
  food_name text not null,
  emoji text default '🥗',
  calories integer not null,
  protein_g numeric(5,1) default 0.0,
  carbs_g numeric(5,1) default 0.0,
  fat_g numeric(5,1) default 0.0,
  ingredients jsonb default '[]'::jsonb, -- 格式: [{"name": "鸡胸肉", "weight": "150g", "calories": 200}]
  ai_advice text,                        -- AI 营养减脂建议
  eaten_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用 meals 表的行级安全策略 (RLS)
alter table public.meals enable row level security;

create policy "Users can view own meals" 
  on public.meals for select 
  using (auth.uid() = user_id);

create policy "Users can insert own meals" 
  on public.meals for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own meals" 
  on public.meals for update 
  using (auth.uid() = user_id);

create policy "Users can delete own meals" 
  on public.meals for delete 
  using (auth.uid() = user_id);

-- 索引加速查询
create index if not exists idx_meals_user_eaten_at on public.meals (user_id, eaten_at desc);
