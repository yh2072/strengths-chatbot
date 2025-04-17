'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TestPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/exercises');
  }, [router]);
  
  return <div>正在重定向到游戏页面...</div>;
} 