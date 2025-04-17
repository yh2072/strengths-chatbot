import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getChatHistory } from '@/lib/db/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    
    const history = await getChatHistory({ limit });
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('获取聊天历史失败:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 