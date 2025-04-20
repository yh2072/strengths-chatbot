import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { eq, and } from 'drizzle-orm';
import { userExercises, User } from '@/lib/db/schema';

// 定义不同练习的奖励积分，使用Record类型
const EXERCISE_POINTS: Record<string, number> = {
  'strengths-alignment': 50,
  // 可以添加其他练习的积分
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('=== 练习完成API请求信息 ===');
  console.log('请求方法:', request.method);
  console.log('请求头:', Object.fromEntries(request.headers.entries()));
  
  try {
    const reqText = await request.clone().text();
    console.log('请求体:', reqText);
  } catch (e) {
    console.log('无法读取请求体');
  }
  console.log('===============================');
  
  try {
    // 验证用户身份
    const session = await auth();
    console.log('用户会话:', JSON.stringify(session?.user));
    
    if (!session?.user?.id) {
      console.error('未授权：没有用户ID');
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    let exerciseId: string;
    let isClaim = false; // 是否是领取奖励的请求
    
    try {
      const body = await request.json();
      exerciseId = body.exerciseId;
      isClaim = !!body.claim; // 检查是否是领取奖励请求
      console.log(`解析请求体: 用户ID=${userId}, 练习ID=${exerciseId}, 领取奖励=${isClaim}`);
    } catch (parseError) {
      console.error('请求体解析错误:', parseError);
      return NextResponse.json(
        { error: '无效的请求格式' },
        { status: 400 }
      );
    }
    
    if (!exerciseId) {
      console.error('缺少练习ID');
      return NextResponse.json(
        { error: '缺少练习ID' },
        { status: 400 }
      );
    }
    
    // 检查该练习是否已完成
    console.log(`查询练习完成记录: userId=${userId}, exerciseId=${exerciseId}`);
    let existingExercise;
    try {
      existingExercise = await db.select()
        .from(userExercises)
        .where(
          and(
            eq(userExercises.userId, userId),
            eq(userExercises.exerciseId, exerciseId)
          )
        )
        .execute();
      
      console.log('现有练习记录查询结果:', existingExercise);
    } catch (dbError: unknown) {
      console.error('查询练习记录失败:', dbError);
      return NextResponse.json(
        { error: '数据库查询失败', details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 }
      );
    }
    
    const now = new Date();
    
    // 在处理完成请求的代码前添加
    console.log('练习完成请求详情:', {
      userId,
      exerciseId,
      isClaim,
      existingRecord: existingExercise?.length > 0
    });
    
    // 如果练习已经被完成过，也给予奖励
    if (existingExercise && existingExercise.length > 0) {
      console.log('练习已被完成过，但仍将给予奖励');
      
      // 安全地获取积分
      const pointsToAdd = exerciseId in EXERCISE_POINTS ? EXERCISE_POINTS[exerciseId] : 50;
      
      try {
        await db.execute(
          sql`UPDATE "User" SET "points" = "points" + ${pointsToAdd}, "updated_at" = ${now.toISOString()} WHERE "id" = ${userId}`
        );
        
        console.log(`积分更新成功: +${pointsToAdd}`);
      } catch (sqlError) {
        console.error('更新积分失败:', sqlError);
        // 继续执行，不阻断流程
      }
      
      // 查询更新后的用户积分
      let updatedUser;
      try {
        updatedUser = await db.select({ points: User.points })
          .from(User)
          .where(eq(User.id, userId))
          .execute();
        
        console.log('更新后的用户数据:', updatedUser);
      } catch (queryError) {
        console.error('查询更新后用户数据失败:', queryError);
        updatedUser = [{ points: 0 }]; // 使用默认值
      }
      
      return NextResponse.json({
        success: true,
        message: '练习重复完成，获得奖励',
        pointsAwarded: pointsToAdd,
        totalPoints: updatedUser[0]?.points || 0,
        eventType: 'POINTS_UPDATED',
        shouldTriggerEvent: true,
        claim: isClaim,
        timestamp: new Date().toISOString()
      });
    } else {
      // 如果未完成，创建新记录并给予奖励
      console.log('创建新的练习完成记录');
      
      try {
        await db.insert(userExercises).values({
          userId,
          exerciseId,
          completedAt: now,
          lastAttemptedAt: now
        }).execute();
        
        console.log('练习完成记录创建成功');
      } catch (insertError) {
        console.error('创建练习完成记录失败:', insertError);
        return NextResponse.json(
          { error: '保存练习记录失败', details: String(insertError) },
          { status: 500 }
        );
      }
      
      // 增加用户积分
      const pointsToAdd = exerciseId in EXERCISE_POINTS ? EXERCISE_POINTS[exerciseId] : 50;
      
      console.log(`添加积分: ${pointsToAdd}`);
      
      try {
        await db.execute(
          sql`UPDATE "User" SET "points" = "points" + ${pointsToAdd}, "updated_at" = ${now.toISOString()} WHERE "id" = ${userId}`
        );
        
        console.log('SQL更新积分成功');
      } catch (sqlError) {
        console.error('SQL执行错误:', sqlError);
      }
      
      // 查询更新后的用户积分
      let updatedUser;
      try {
        updatedUser = await db.select({ points: User.points })
          .from(User)
          .where(eq(User.id, userId))
          .execute();
        
        console.log('更新后的用户数据:', updatedUser);
      } catch (queryError) {
        console.error('查询更新后用户数据失败:', queryError);
        updatedUser = [{ points: pointsToAdd }];
      }
      
      return NextResponse.json({
        success: true,
        message: '练习完成！',
        pointsAwarded: pointsToAdd,
        totalPoints: updatedUser[0]?.points || 0,
        eventType: 'POINTS_UPDATED',
        shouldTriggerEvent: true,
        claim: isClaim,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error: unknown) {
    console.error('保存练习完成状态失败:', error);
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 