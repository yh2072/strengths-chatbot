import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { generateUUID } from '@/lib/utils';
import { saveMessages, getMessagesByChatId, saveChat, getChatById } from '@/lib/db/queries';

// 获取聊天消息
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');
  
  if (!chatId) {
    return NextResponse.json({ error: "缺少聊天ID" }, { status: 400 });
  }
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    
    const messages = await getMessagesByChatId({ id: chatId });
    
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// 保存用户消息
export async function POST(request: Request) {
  try {
    const { chatId, message } = await request.json();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    
    // 检查聊天是否存在，如果不存在则创建
    const chat = await getChatById({ id: chatId });
    
    if (!chat) {
      console.log('聊天记录不存在，创建新聊天:', chatId);
      
      // 创建新的聊天记录
      await saveChat({
        id: chatId,
        userId: session.user.id,
        title: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
        createdAt: new Date(),
        visibility: 'private'
      });
    }
    
    // 保存消息
    await saveMessages({
      messages: [
        {
          chatId,
          id: message.id || generateUUID(),
          role: 'user',
          parts: Array.isArray(message.parts) ? message.parts : [message.content],
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存消息失败:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 