-- 强制删除所有表
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- 重新创建所有必要的表结构
CREATE TABLE "User" (
  "id" VARCHAR(255) PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL,
  "password" VARCHAR(255),
  "name" VARCHAR(255),
  "points" INTEGER DEFAULT 0,
  "level" INTEGER DEFAULT 1,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP
);

-- 其他表的创建语句...

-- 最后创建user_exercises表
CREATE TABLE "user_exercises" (
  "id" SERIAL PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "exercise_id" TEXT NOT NULL,
  "completed_at" TIMESTAMP NOT NULL,
  "last_attempted_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "user_exercises_user_id_User_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE
); 