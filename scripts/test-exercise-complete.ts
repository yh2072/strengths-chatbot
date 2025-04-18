import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('开始测试练习完成功能...');
  
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('错误: 缺少 POSTGRES_URL 环境变量');
    process.exit(1);
  }
  
  // 创建数据库连接
  const client = postgres(connectionString);
  
  try {
    // 1. 读取现有用户列表
    console.log('读取用户列表...');
    const users = await client`SELECT id, email, points FROM "User"`;
    console.log('现有用户:', users);
    
    if (users.length === 0) {
      console.error('没有找到用户');
      return;
    }
    
    // 选择第一个用户
    const testUser = users[0];
    console.log(`选择测试用户: ${testUser.email} (${testUser.id})`);
    
    // 2. 插入练习完成记录
    const now = new Date().toISOString();
    const exerciseId = 'strengths-alignment';
    
    console.log(`插入练习完成记录: userId=${testUser.id}, exerciseId=${exerciseId}`);
    
    try {
      // 检查是否已存在记录
      const existingRecord = await client`
        SELECT * FROM user_exercises 
        WHERE user_id = ${testUser.id} AND exercise_id = ${exerciseId}
      `;
      
      if (existingRecord.length > 0) {
        console.log('练习记录已存在，更新最后尝试时间');
        await client`
          UPDATE user_exercises 
          SET last_attempted_at = ${now}
          WHERE user_id = ${testUser.id} AND exercise_id = ${exerciseId}
        `;
      } else {
        console.log('创建新的练习完成记录');
        await client`
          INSERT INTO user_exercises (user_id, exercise_id, completed_at, last_attempted_at, created_at)
          VALUES (${testUser.id}, ${exerciseId}, ${now}, ${now}, ${now})
        `;
      }
    } catch (error) {
      console.error('插入/更新练习记录失败:', error);
    }
    
    // 3. 更新用户积分
    const pointsToAdd = 50;
    console.log(`更新用户积分: +${pointsToAdd}`);
    
    try {
      await client`
        UPDATE "User" 
        SET points = points + ${pointsToAdd}, 
            updated_at = ${now}
        WHERE id = ${testUser.id}
      `;
    } catch (error) {
      console.error('更新积分失败:', error);
    }
    
    // 4. 验证更新结果
    const updatedUser = await client`SELECT id, email, points FROM "User" WHERE id = ${testUser.id}`;
    console.log('更新后的用户数据:', updatedUser[0]);
    
    const exercises = await client`SELECT * FROM user_exercises WHERE user_id = ${testUser.id}`;
    console.log('用户练习记录:', exercises);
    
  } catch (error) {
    console.error('测试过程出错:', error);
  } finally {
    // 关闭连接
    await client.end();
    console.log('数据库连接已关闭');
  }
}

main().catch(console.error);