import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const message = searchParams.get('message') || 'Hello, how are you?';
  
  // 最简单的请求结构
  const requestBody = {
    model: "Qwen/QwQ-32B",
    messages: [
      {
        role: "user",
        content: message
      }
    ],
    stream: false,
    max_tokens: 512,
    temperature: 0.7
  };
  
  console.log('直接测试 - 请求体:', JSON.stringify(requestBody));
  
  try {
    const response = await fetch(`${process.env.SILICONFLOW_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ success: true, data });
    } else {
      const errorText = await response.text();
      return NextResponse.json({ 
        success: false, 
        status: response.status,
        statusText: response.statusText,
        errorText,
        headers: Object.fromEntries(response.headers.entries())
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 