import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { user } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    // 验证用户
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    
    // 检查用户是否已有游戏相关属性
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .execute();
    
    console.log('查询到用户:', existingUser);
    
    // 如果用户存在但没有游戏相关字段，更新它们
    if (existingUser.length > 0) {
      const currentUser = existingUser[0];
      
      // 检查是否需要更新游戏字段
      if (currentUser.points === undefined || currentUser.level === undefined) {
        console.log('更新用户游戏属性');
        
        try {
          await db.update(user)
            .set({ 
              points: 0,
              level: 1,
              updatedAt: new Date()
            })
            .where(eq(user.id, session.user.id))
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
    
    // 用户不存在的情况（不太可能，因为这应该是已登录用户）
    return NextResponse.json({ 
      status: 'warning', 
      message: '未找到用户，请确保用户已登录' 
    }, { status: 404 });
    
  } catch (error) {
    console.error('同步用户数据失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
} 