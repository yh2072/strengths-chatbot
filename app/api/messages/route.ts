import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { generateUUID } from '@/lib/utils';
import { saveMessages, getMessagesByChatId, saveChat, getChatById } from '@/lib/db/queries';

// 定义类型，确保与数据库模式匹配
interface ChatData {
  id: string;
  userId: string;
  title: string;
  created_at?: Date;  // 使用下划线格式
  updated_at?: Date;  // 使用下划线格式
  visibility: 'public' | 'private';
}

// 获取聊天消息
export async function GET(request: Request): Promise<NextResponse> {
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
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// 保存用户消息
export async function POST(request: Request): Promise<NextResponse> {
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
      const chatData: ChatData = {
        id: chatId,
        userId: session.user.id,
        title: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
        created_at: new Date(),  // 使用正确的属性名
        visibility: 'private'
      };
      
      await saveChat(chatData);
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
          createdAt: new Date(),  // 注意: 这里可能也需要改为created_at，取决于saveMessages的接口
        },
      ],
    });
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('保存消息失败:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 