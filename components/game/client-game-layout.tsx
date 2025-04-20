'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/ui/logout-button';

// 定义会话和用户类型
interface UserData {
  id?: string;
  name?: string;
  email?: string;
  points?: number;
  level?: number;
  [key: string]: any;
}

interface SessionData {
  user?: UserData;
}

// 定义点数更新事件的类型
interface PointsUpdateEvent extends CustomEvent {
  detail: {
    points: number;
  };
}

export default function ClientGameLayout({ 
  children, 
  session 
}: { 
  children: React.ReactNode;
  session: SessionData;
}) {
  const pathname = usePathname();
  const [userPoints, setUserPoints] = useState<number>(session?.user?.points || 0);
  
  // 处理积分更新事件
  function handlePointsUpdate(event: PointsUpdateEvent) {
    if (event.detail && typeof event.detail.points === 'number') {
      setUserPoints(event.detail.points);
    }
  }
  
  // 添加和移除事件监听器
  useEffect(() => {
    window.addEventListener('pointsUpdate', handlePointsUpdate as EventListener);
    return () => {
      window.removeEventListener('pointsUpdate', handlePointsUpdate as EventListener);
    };
  }, [userPoints]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* 左侧Logo */}
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  夸夸星球
                </span>
                <span className="text-sm text-indigo-600 ml-1 hidden sm:inline">StrengthPlanet</span>
              </Link>
            </div>
            
            {/* 中间导航链接 */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/exercises" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname?.startsWith('/exercises') 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                练习库
              </Link>
              <Link 
                href="/dashboard" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname?.startsWith('/dashboard') 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                我的进度
              </Link>
              <Link 
                href="/about" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname?.startsWith('/about') 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                关于我们
              </Link>
            </nav>
            
            {/* 右侧用户栏 */}
            <div className="flex items-center space-x-4">
              {/* 积分展示 */}
              <div className="hidden sm:flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                <span className="ml-1.5 font-medium text-amber-700">{userPoints}</span>
              </div>
              
              {/* 用户头像和登出按钮 */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
                <LogoutButton className="text-sm text-gray-500 hover:text-red-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* 主内容区 */}
      <main className="flex-1 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {children}
        </div>
      </main>
      
      {/* 底部导航栏 - 移动端 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20">
        <div className="grid grid-cols-3 h-16">
          <Link 
            href="/exercises" 
            className={`flex flex-col items-center justify-center ${
              pathname?.startsWith('/exercises') 
                ? 'text-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs mt-1">练习</span>
          </Link>
          
          <Link 
            href="/dashboard" 
            className={`flex flex-col items-center justify-center ${
              pathname?.startsWith('/dashboard') 
                ? 'text-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs mt-1">进度</span>
          </Link>
          
          <Link 
            href="/profile" 
            className={`flex flex-col items-center justify-center ${
              pathname?.startsWith('/profile') 
                ? 'text-indigo-600' 
                : 'text-gray-500'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">我的</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 