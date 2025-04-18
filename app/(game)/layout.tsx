import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { GameSidebar } from '@/components/game/exercises-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/app/(auth)/auth';
import { ClientGameLayout } from '@/components/game/client-game-layout';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { user } from '@/lib/db/schema';

export const metadata = {
  title: '夸夸星球 - 成长乐园',
  description: '通过有趣的互动游戏发现自我，培养积极心态',
};

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  // 未登录则重定向到登录页
  if (!session?.user) {
    redirect('/login?from=/exercises');
  }
  
  // 从数据库获取最新用户数据
  let userData = session.user;
  
  try {
    // 尝试获取最新用户数据包括积分
    const dbUser = await db.select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .execute();
    
    if (dbUser.length > 0) {
      userData = {
        ...session.user,
        points: dbUser[0].points || 0,
        level: dbUser[0].level || 1
      };
    }
  } catch (error) {
    console.error('获取最新用户数据失败:', error);
  }

  return (
    <ClientGameLayout 
      session={{user: userData}} 
      isCollapsed={isCollapsed}
    >
      {children}
      {/* 领取奖励按钮脚本 */}
      <script src="/scripts/reward-button.js" async></script>
    </ClientGameLayout>
  );
} 