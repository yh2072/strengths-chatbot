-- 步骤1: 先禁用约束检查以便操作
SET session_replication_role = 'replica';

-- 步骤2: 先尝试删除约束(两种可能的约束名称都尝试)
ALTER TABLE IF EXISTS "user_exercises" 
  DROP CONSTRAINT IF EXISTS "user_exercises_user_id_users_id_fk";
  
ALTER TABLE IF EXISTS "user_exercises" 
  DROP CONSTRAINT IF EXISTS "user_exercises_user_id_User_id_fk";

-- 步骤3: 修改外键列类型(如果需要)
ALTER TABLE IF EXISTS "user_exercises" 
  ALTER COLUMN "user_id" TYPE uuid USING "user_id"::uuid;

-- 步骤4: 删除问题表
DROP TABLE IF EXISTS "users" CASCADE;

-- 步骤5: 确保user_exercises表指向正确的User表
DO $$ 
BEGIN
  -- 检查User表是否存在
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User') THEN
    -- 尝试添加新的外键约束
    ALTER TABLE IF EXISTS "user_exercises" 
      ADD CONSTRAINT "user_exercises_user_id_User_id_fk" 
      FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN others THEN
  -- 捕获任何错误但继续执行
  RAISE NOTICE 'Error adding constraint: %', SQLERRM;
END $$;

-- 步骤6: 恢复约束检查
SET session_replication_role = 'origin';

