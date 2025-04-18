import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('开始更新用户表...');
  
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('错误: 缺少 POSTGRES_URL 环境变量');
    process.exit(1);
  }
  
  // 创建数据库连接
  const client = postgres(connectionString);
  
  try {
    // 向现有用户表添加游戏相关字段
    console.log('添加游戏相关字段...');
    await client`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `;
    
    // 创建用户练习表
    console.log('创建用户练习表...');
    await client`
      CREATE TABLE IF NOT EXISTS user_exercises (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        exercise_id TEXT NOT NULL,
        completed_at TIMESTAMP NOT NULL,
        last_attempted_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT user_exercise_idx UNIQUE (user_id, exercise_id)
      )
    `;
    
    console.log('更新完成!');
    
    // 验证表结构
    const userColumns = await client`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user'
      ORDER BY ordinal_position
    `;
    console.log('用户表结构:', userColumns);
    
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('数据库表:', tables.map(t => t.table_name));
    
  } catch (error) {
    console.error('更新表出错:', error);
  } finally {
    // 关闭连接
    await client.end();
    console.log('数据库连接已关闭');
  }
}

main().catch(console.error); 