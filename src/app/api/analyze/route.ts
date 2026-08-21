import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const SYSTEM_PROMPT = `
你是一位极其专业、严谨且富有同理心的注册临床营养师与减脂专家。
用户会发送一张食物的照片。你的任务是：
1. 识别图片中的所有主要食物与组成配料。
2. 合理估计每种配料的重量（以克 g 为单位）与卡路里。
3. 计算该顿餐食的总热量 (kcal)、蛋白质 (g)、碳水化合物 (g)、脂肪 (g)。
4. 挑选一个最契合该餐食的单个 Emoji。
5. 给出一段简明专业、针对减脂人群的营养学建议 (1~2句话)。

请务必直接输出合法的 JSON 格式，严格遵循以下结构，不要包含任何 markdown 代码块标记以外的闲聊文字：
{
  "food_name": "菜品名称（如：香煎三文鱼牛油果藜麦碗）",
  "emoji": "🥗",
  "calories": 460,
  "protein_g": 38.5,
  "carbs_g": 42.0,
  "fat_g": 16.5,
  "confidence": 0.95,
  "ingredients": [
    { "name": "三文鱼", "weight": "120g", "calories": 240 },
    { "name": "牛油果", "weight": "50g", "calories": 80 },
    { "name": "三色藜麦饭", "weight": "80g", "calories": 90 },
    { "name": "西蓝花与小番茄", "weight": "100g", "calories": 50 }
  ],
  "ai_advice": "优质高蛋白与健康不饱和脂肪酸组合，饱腹感强，非常适合作为减脂期的主餐。"
}
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, model = 'google/gemini-2.5-flash', customApiKey } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: '请提供待识别的食物图片' }, { status: 400 });
    }

    const apiKey = customApiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: '未检测到 OpenRouter API 密钥，请在设置页面配置您的 API Key。' },
        { status: 401 }
      );
    }

    // 格式化 Base64 URL
    const imageUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    // 调用 OpenRouter 多模态视觉 API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://caloai.vercel.app',
        'X-Title': 'CaloAI Diet Assistant',
      },
      body: JSON.stringify({
        model: model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请分析这张图片中的食物成分、热量与宏量营养素，并输出标准 JSON。',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `OpenRouter API 错误 (${response.status}): ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json({ error: 'AI 未返回有效的识别内容' }, { status: 500 });
    }

    // 清洗提取 JSON
    let parsedResult;
    try {
      const cleaned = rawContent.replace(/```json\n?|\n?```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'AI 输出解析失败', raw: rawContent }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: parsedResult });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '服务器内部处理错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
