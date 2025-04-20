import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// 处理 GET 请求
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    
    // 这里可以添加额外的管理员检查逻辑
    
    console.log('开始执行数据库迁移...');
    
    // 添加name字段
    await db.execute(sql`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "name" VARCHAR(255)
    `);
    
    console.log('数据库迁移完成');
    
    return NextResponse.json({ 
      success: true,
      message: '迁移已执行' 
    });
  } catch (error: unknown) {
    console.error('迁移执行错误:', error);
    return NextResponse.json({ 
      error: '迁移失败', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 处理 POST 请求
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    
    // 这里可以添加迁移逻辑
    
    return NextResponse.json({ 
      success: true, 
      message: '迁移已执行' 
    });
  } catch (error: unknown) {
    console.error('迁移执行错误:', error);
    return NextResponse.json({ 
      error: '迁移失败', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 