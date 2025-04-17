import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { generateUUID } from '@/lib/utils';
import { saveMessages, getChatById, saveChat } from '@/lib/db/queries';

export async function POST(request: Request) {
  try {
    const { chatId, messageId, content } = await request.json();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    
    // 直接保存完整响应
    if (content && chatId) {
      // 检查聊天是否存在，如果不存在则创建
      const chat = await getChatById({ id: chatId });
      
      if (!chat) {
        console.log('聊天记录不存在，创建新聊天:', chatId);
        
        // 创建新的聊天记录
        await saveChat({
          id: chatId,
          userId: session.user.id,
          title: "AI对话 " + new Date().toLocaleString(),
          createdAt: new Date(),
          visibility: 'private'
        });
      }
      
      await saveMessages({
        messages: [
          {
            chatId,
            id: messageId || generateUUID(),
            role: 'assistant',
            parts: [content],
            attachments: [],
            createdAt: new Date(),
          },
        ],
      });
      
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ 
        error: "内容或聊天ID缺失" 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('保存AI响应失败:', error);
    return NextResponse.json({ 
      error: String(error) 
    }, { status: 500 });
  }
} 