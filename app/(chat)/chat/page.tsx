'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateUUID } from '@/lib/utils';

export default function ChatRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace(`/chat/${generateUUID()}`);
  }, [router]);
  
  return null;
} 