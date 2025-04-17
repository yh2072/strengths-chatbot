import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, chatId, selectedChatModel } = body;
    
    // 获取授权信息
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 处理消息
    const flatMessages = [];
    
    // 添加系统提示
    flatMessages.push({
      role: 'system',
      content: systemPrompt({ selectedChatModel })
    });
    
    // 提取最后一条用户消息
    const userMsg = messages.find(m => m.role === 'user');
    if (userMsg) {
      let content = '';
      
      if (typeof userMsg.content === 'string') {
        content = userMsg.content;
      } else if (Array.isArray(userMsg.content)) {
        content = userMsg.content
          .filter(item => item && item.type === 'text')
          .map(item => item.text)
          .join('\n');
      } else if (Array.isArray(userMsg.parts)) {
        content = userMsg.parts.join('\n');
      }
      
      if (content) {
        flatMessages.push({
          role: 'user',
          content
        });
      }
    }
    
    // 调用API
    const response = await fetch(`${process.env.SILICONFLOW_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "Qwen/QwQ-32B",
        messages: flatMessages,
        stream: true,
        max_tokens: 512,
        temperature: 0.7
      })
    });
    
    // 转发响应
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