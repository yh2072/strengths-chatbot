import { NextResponse } from 'next/server';

// 这个API只是将客户端发送的消息回显回来，以便我们可以看到实际发送的内容
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  try {
    // 获取上一个聊天内容
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id,
        messages: [
          {
            id: '1',
            role: 'user',
            content: '简要解释一下Next.js是什么',
            createdAt: new Date().toISOString()
          }
        ]
      })
    });
    
    // 转发原始响应供调试
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 