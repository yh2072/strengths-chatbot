import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    
    // 插入新用户
    await db.insert(user).values({
      id: userId,
      name,  // 添加名字
      email,
      password: hashedPassword,
      points: 0,
      level: 1,
      created_at: new Date(),
      updated_at: new Date()
    }).execute();
    
    return NextResponse.json({ 
      success: true, 
      message: '注册成功' 
    });
  } catch (error) {
    console.error('注册用户失败:', error);
    return NextResponse.json({ 
      error: '注册失败', 
      details: error.message 
    }, { status: 500 });
  }
} 