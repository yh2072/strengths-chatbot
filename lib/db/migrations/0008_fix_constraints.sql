-- 先删除外键约束
ALTER TABLE "user_exercises" DROP CONSTRAINT IF EXISTS "user_exercises_user_id_users_id_fk";

-- 然后删除表
DROP TABLE IF EXISTS "users" CASCADE;

-- 最后再添加正确的外键约束
DO $$ BEGIN
 ALTER TABLE "user_exercises" ADD CONSTRAINT "user_exercises_user_id_User_id_fk" 
   FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$; 