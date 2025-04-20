import { sql } from 'drizzle-orm';

// 使用DrizzleDB类型别名
type DrizzleDB = {
  execute: (query: any) => Promise<any>;
  [key: string]: any;
};

export async function addNameField(db: any) {
  console.log('正在添加name字段到User表...');
  
  try {
    // 添加name字段
    await db.execute(sql`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "name" VARCHAR(255)
    `);
    
    console.log('成功添加name字段');
    return true;
  } catch (error) {
    console.error('添加name字段失败:', error);
    return false;
  }
} 