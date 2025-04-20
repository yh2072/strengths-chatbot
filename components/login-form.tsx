'use client';

import { useEffect, useState } from 'react';

export default function LoginForm() {
  const [mounted, setMounted] = useState(false);
  
  // 将访问document的代码移到useEffect中
  useEffect(() => {
    setMounted(true);
    // 现在可以安全访问document
    const tag = document.createElement('script');
    // ...其他使用document的代码
  }, []);
  
  // 在组件挂载前不渲染依赖document的部分
  if (!mounted) {
    return <div>加载中...</div>;
  }
  
  return (
    // 组件UI
  );
} 