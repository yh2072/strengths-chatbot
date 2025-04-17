import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import { getMessagesByChatId } from '@/lib/db/queries';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: "缺少聊天ID" }, { status: 400 });
  }
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    
    // 获取历史消息
    const messages = await getMessagesByChatId({ id });
    console.log(`获取到聊天(${id})的历史消息: ${messages.length}条`);
    
    if (messages.length === 0) {
      return NextResponse.json({ error: "未找到消息" }, { status: 400 });
    }
    
    // 按照时间顺序排序消息
    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    // 准备API请求的消息
    const apiMessages = [
      {
        role: 'system',
        content: systemPrompt({ selectedChatModel: 'Qwen/QwQ-32B' })
      }
    ];
    
    // 将数据库中的消息转换为API格式
    for (const msg of messages) {
      // 每条消息的content来自parts属性
      let content = '';
      
      if (Array.isArray(msg.parts) && msg.parts.length > 0) {
        content = msg.parts.join('\n');
      } else if (msg.parts && typeof msg.parts === 'string') {
        content = msg.parts;
      }
      
      if (content && (msg.role === 'user' || msg.role === 'assistant')) {
        apiMessages.push({
          role: msg.role,
          content: content
        });
      }
    }
    
    console.log(`构建API消息: ${apiMessages.length}条 (包括系统消息)`);
    
    // 如果除了系统消息外，没有其他消息，返回错误
    if (apiMessages.length <= 1) {
      return NextResponse.json({ error: "没有有效的对话消息" }, { status: 400 });
    }
    
    // 创建响应流
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 调用API
          const response = await fetch(`${process.env.SILICONFLOW_API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: "Qwen/QwQ-32B",
              messages: apiMessages,
              stream: true,
              max_tokens: 1000,
              temperature: 0.7
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API错误 ${response.status}: ${errorText}`);
          }
          
          // 读取流
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          let buffer = '';
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // 发送完成事件
              controller.enqueue('event: done\ndata: completed\n\n');
              break;
            }
            
            // 解码这个块
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // 处理收到的行
            let processedData = '';
            
            // 尝试提取内容
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine || !trimmedLine.startsWith('data:')) continue;
              
              const data = trimmedLine.substring(5).trim();
              if (data === '[DONE]') continue;
              
              try {
                const parsedData = JSON.parse(data);
                
                // 提取内容
                let content = '';
                if (parsedData.choices && parsedData.choices[0]) {
                  if (parsedData.choices[0].delta && parsedData.choices[0].delta.content) {
                    content = parsedData.choices[0].delta.content;
                  } else if (parsedData.choices[0].message && parsedData.choices[0].message.content) {
                    content = parsedData.choices[0].message.content;
                  }
                }
                
                if (content) {
                  processedData += content;
                }
              } catch (e) {
                console.error('解析响应出错:', e);
              }
            }
            
            // 发送处理后的内容
            if (processedData) {
              controller.enqueue(`data: ${processedData}\n\n`);
            }
          }
          
          controller.close();
        } catch (error) {
          console.error('流处理错误:', error);
          controller.error(error);
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 