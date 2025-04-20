"use client";

// 定义用户类型接口
interface User {
  id?: string;
  name?: string;
  email?: string;
  points?: number;
  level?: number;
  [key: string]: any; // 允许其他属性
}

export const storeUserInfo = (user: User) => {
  if (typeof window !== 'undefined') {
    console.log('存储用户信息:', user);
    
    // 添加name字段检查
    const userName = user?.name || '';
    
    // 用安全的方式访问name字段
    localStorage.setItem('userName', userName);
    localStorage.setItem('userEmail', user?.email || '');
    localStorage.setItem('userId', user?.id || '');
    
    if (user?.name) {
      console.log('用户名已保存到localStorage:', user.name);
    } else {
      console.warn('用户信息中没有名字字段:', user);
    }
  }
} 