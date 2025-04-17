import { cookies } from 'next/headers';
import { GameSidebar } from '@/components/game/exercises-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '../(auth)/auth';

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

  return (
    <>
      {/* 装饰性气泡背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-purple-300/20 mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-blue-300/20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-indigo-300/20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-pink-300/20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
      </div>
      
      <SidebarProvider defaultOpen={!isCollapsed}>
        <GameSidebar user={session?.user} />
        <SidebarInset className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
          {/* 顶部导航 */}
          <nav className="bg-white/80 backdrop-blur-sm border-b border-indigo-100/50 shadow-sm relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">夸</span>
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">夸夸星球</h1>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* 用户信息和菜单 */}
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                      <span className="text-xs font-medium">Lv.2</span>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-700">{session?.user?.name || '冒险者'}</div>
                      <div className="text-xs text-gray-500">积分: 125</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
} 