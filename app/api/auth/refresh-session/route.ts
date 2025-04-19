import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { User } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    // 获取当前会话
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    
    // 从数据库获取最新用户数据
    const userData = await db.select()
      .from(User)
      .where(eq(User.id, session.user.id))
      .execute();
    
    if (userData.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    const currentUser = userData[0];
    
    // 返回最新用户数据 - 只包含实际存在的字段
    return NextResponse.json({ 
      success: true, 
      user: {
        id: currentUser.id,
        email: currentUser.email,
        points: currentUser.points,
        level: currentUser.level
      }
    });
    
  } catch (error) {
    console.error('刷新会话失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 