export function storeUserInfo(user) {
  // 检查输出，看看用户对象
  console.log('存储用户信息:', user);
  
  // 添加name字段检查
  const userName = user?.name || '';
  
  // 用安全的方式访问name字段
  localStorage.setItem('userName', userName);
  localStorage.setItem('userEmail', user?.email || '');
  localStorage.setItem('userId', user?.id || '');
  
  // 其他处理...
} 