-- 更彻底的解决方案：完全重置数据库结构
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- 强制删除所有表，不管依赖关系
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

