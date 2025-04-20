'use client';

import { useEffect, useState } from 'react';

export default function LoginForm() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 将访问document的代码移到useEffect中
  useEffect(() => {
    setMounted(true);
    // 现在可以安全访问document
    const tag = document.createElement('script');
    // ...其他使用document的代码
  }, []);
  
  // 表单提交处理函数
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 表单提交逻辑
    console.log('登录表单提交:', { email, password });
  };
  
  // 在组件挂载前不渲染依赖document的部分
  if (!mounted) {
    return <div>加载中...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          电子邮箱
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        登录
      </button>
      
      <p className="text-center text-sm text-gray-600 mt-4">
        还没有账号？{' '}
        <a
          href="/register"
          className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          速速注册
        </a>
      </p>
    </form>
  );
} 