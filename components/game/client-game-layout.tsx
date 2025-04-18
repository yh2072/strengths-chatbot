'use client';

import { useState, useEffect } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { GameSidebar } from '@/components/game/exercises-sidebar';

// 定义接口
interface ClientGameLayoutProps {
  children: React.ReactNode;
  session: {
    user?: {
      id?: string;
      email?: string;
      points?: number;
      level?: number;
    }
  } | null;
  isCollapsed: boolean;
}

export function ClientGameLayout({ 
  children, 
  session, 
  isCollapsed 
}: ClientGameLayoutProps) {
  const [userPoints, setUserPoints] = useState(session?.user?.points || 0);

  // 添加刷新用户数据的功能
  const refreshUserData = async () => {
    try {
      console.log('开始刷新用户数据...');
      const response = await fetch('/api/auth/refresh-session');
      console.log('刷新请求响应状态:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('刷新响应数据:', data);
        
        if (data.success && data.user) {
          console.log('更新用户积分:', data.user.points);
          // 使用函数形式确保使用最新状态
          setUserPoints((prevPoints: number) => {
            console.log(`积分更新: ${prevPoints} -> ${data.user.points || 0}`);
            return data.user.points || 0;
          });
        } else {
          console.warn('刷新响应成功但数据结构不符合预期:', data);
        }
      } else {
        console.error('刷新响应失败:', response.status);
        try {
          const errorData = await response.json();
          console.error('错误详情:', errorData);
        } catch (e) {
          console.error('无法解析错误响应');
        }
      }
    } catch (error) {
      console.error('刷新用户数据失败:', error);
    }
  };

  // 添加到现有的useEffect中
  useEffect(() => {
    console.log('初始化事件监听，当前积分:', userPoints);
    
    // 立即刷新用户数据
    refreshUserData();
    
    // 更明确的事件处理函数
    function handlePointsUpdate(event) {
      console.log('收到积分更新事件:', event.detail);
      if (event.detail && typeof event.detail.points === 'number') {
        console.log(`更新积分: ${userPoints} -> ${event.detail.points}`);
        setUserPoints(event.detail.points);
        
        // 额外确认刷新
        setTimeout(refreshUserData, 500);
      } else {
        console.log('收到无效积分更新事件，执行手动刷新');
        refreshUserData();
      }
    }
    
    // 添加事件监听
    window.addEventListener('pointsUpdated', handlePointsUpdate);
    
    // 周期性刷新数据（每60秒）
    const refreshInterval = setInterval(refreshUserData, 60000);
    
    // 清理
    return () => {
      window.removeEventListener('pointsUpdated', handlePointsUpdate);
      clearInterval(refreshInterval);
    };
  }, []);

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
                      <div className="font-medium text-gray-700">{session?.user?.email || '冒险者'}</div>
                      <div className="text-xs text-gray-500">积分: {userPoints}</div>
                    </div>
                    
                    {/* 添加刷新按钮 */}
                    <button 
                      onClick={refreshUserData}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                      title="刷新积分"
                    >
                      ↻
                    </button>
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