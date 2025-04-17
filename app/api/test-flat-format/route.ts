import { NextResponse } from 'next/server';

export async function GET() {
  // 使用扁平消息结构
  const requestBody = {
    "model": "Qwen/QwQ-32B",
    "messages": [
      {
        "role": "system", 
        "content": "You are a friendly assistant! Keep your responses concise and helpful."
      },
      {
        "role": "user",
        "content": "What are the advantages of using Next.js?"
      }
    ],
    "stream": false,
    "max_tokens": 512,
    "stop": null,
    "temperature": 0.7,
    "top_p": 0.7,
    "top_k": 50,
    "frequency_penalty": 0.5,
    "n": 1,
    "response_format": { "type": "text" },
    "tools": []
  };
  
  try {
    const response = await fetch(`${process.env.SILICONFLOW_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    });
  }
} 