import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { User } from '@/lib/db/schema';
import { UserFormData, mapToUserInsert } from '@/lib/db/mappers';
import crypto from 'crypto';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 解析请求体为已知类型
    const formData = await request.json() as UserFormData;
    
    // 创建用户ID和密码哈希
    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(formData.password, 10);
    
    // 重置哈希后的密码
    formData.password = hashedPassword;
    
    // 使用映射函数创建数据库插入对象
    const userData = mapToUserInsert(formData, userId);
    
    // 类型安全的数据库插入
    await db.insert(User).values(userData);
    
    return NextResponse.json({ 
      success: true, 
      message: '注册成功' 
    });
  } catch (error: unknown) {
    console.error('注册用户失败:', error);
    return NextResponse.json({ 
      error: '注册失败', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 