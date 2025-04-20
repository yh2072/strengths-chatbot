import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { generateUUID } from '@/lib/utils';
import { saveMessages, getChatById, saveChat } from '@/lib/db/queries';

// 定义类型，确保与数据库模式匹配
interface ChatData {
  id: string;
  userId: string;
  title: string;
  created_at?: Date;
  updated_at?: Date;
  visibility: 'public' | 'private';
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { chatId, aiResponse } = await request.json();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    
    // 检查聊天是否存在，如果不存在则创建
    const chat = await getChatById({ id: chatId });
    
    if (!chat) {
      console.log('聊天记录不存在，创建新聊天:', chatId);
      
      // 创建新的聊天数据对象
      const chatData: ChatData = {
        id: chatId,
        userId: session.user.id,
        title: "AI对话 " + new Date().toLocaleString(),
        created_at: new Date(),  // 修改: createdAt -> created_at
        visibility: 'private'
      };
      
      await saveChat(chatData);
    }
    
    // 保存AI响应消息
    const messageId = aiResponse.id || generateUUID();
    
    await saveMessages({
      messages: [
        {
          chatId,
          id: messageId,
          role: 'assistant',
          parts: Array.isArray(aiResponse.parts) ? aiResponse.parts : [aiResponse.content],
          attachments: aiResponse.attachments || [],
          createdAt: new Date(),  // 注意: 这里可能也需要改为created_at，取决于saveMessages的接口
        },
      ],
    });
    
    return NextResponse.json({ success: true, messageId });
  } catch (error: unknown) {
    console.error('保存AI响应失败:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 