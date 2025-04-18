"use client";

export const storeUserInfo = (user) => {
  if (typeof window !== 'undefined') {
    console.log('存储用户信息:', user);
    
    if (user?.name) {
      localStorage.setItem('userName', user.name);
      console.log('用户名已保存到localStorage:', user.name);
    } else {
      console.warn('用户信息中没有名字字段:', user);
    }
  }
} 