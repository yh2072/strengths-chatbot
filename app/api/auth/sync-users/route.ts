import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { User, UserSelect } from '@/lib/db/schema';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 验证用户
    const session = await auth();
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    
    const userId = session.user.id; // 将ID保存为本地变量，确保TypeScript知道它不是undefined
    
    // 检查用户是否已有游戏相关属性
    const existingUser = await db.select()
      .from(User)
      .where(eq(User.id, userId)) // 使用本地变量，而不是可能为undefined的session.user.id
      .execute();
    
    console.log('查询到用户:', existingUser);
    
    // 如果用户存在但没有游戏相关字段，更新它们
    if (existingUser.length > 0) {
      const currentUser = existingUser[0] as UserSelect;
      
      // 检查是否需要更新游戏字段
      if (currentUser.points === undefined || currentUser.level === undefined) {
        console.log('更新用户游戏属性');
        
        try {
          await db.update(User)
            .set({ 
              points: 0,
              level: 1,
              updated_at: new Date()
            })
            .where(eq(User.id, userId)) // 再次使用本地变量
            .execute();
            
          return NextResponse.json({ 
            status: 'success', 
            message: '用户游戏属性已更新' 
          });
        } catch (updateError) {
          console.error('更新用户游戏属性失败:', updateError);
          return NextResponse.json(
            { error: '更新用户失败' },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json({ 
        status: 'success', 
        message: '用户已存在，属性完整' 
      });
    }
    
    // 用户不存在的情况
    return NextResponse.json({ 
      status: 'warning', 
      message: '未找到用户，请确保用户已登录' 
    }, { status: 404 });
    
  } catch (error: unknown) {
    console.error('同步用户数据失败:', error);
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 