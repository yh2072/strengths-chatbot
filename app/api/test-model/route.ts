import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function GET() {
  const client = new OpenAI({
    baseURL: process.env.SILICONFLOW_API_BASE_URL,
    apiKey: process.env.SILICONFLOW_API_KEY,
  });
  
  try {
    // 测试非流式调用
    const response = await client.chat.completions.create({
      model: 'deepseek-ai/DeepSeek-V3', // 测试这个模型名
      messages: [{ role: 'user', content: '你好' }],
      stream: false
    });
    
    return NextResponse.json({ success: true, response });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error), details: error });
  }
} 