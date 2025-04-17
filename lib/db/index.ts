import { drizzle } from 'drizzle-orm/postgres-js'; // 修改为正确的适配器
import postgres from 'postgres';
import * as schema from './schema';

// 初始化数据库连接
const client = postgres(process.env.POSTGRES_URL || '');

// 测试数据库连接
export async function testConnection() {
  try {
    // 执行简单查询测试连接
    const result = await db.query.chat.findFirst();
    console.log('数据库连接成功', result ? '找到记录' : '未找到记录');
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return false;
  }
}

// 导出数据库实例
export const db = drizzle(client, { schema }); 