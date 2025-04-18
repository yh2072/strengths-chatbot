import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // 直接增加50积分
    await db.execute(
      sql`UPDATE "User" SET "points" = "points" + 50, "updated_at" = ${new Date().toISOString()} WHERE "id" = ${userId}`
    );
    
    return NextResponse.json({ success: true, message: '测试积分已添加' });
  } catch (error) {
    console.error('测试积分添加失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 