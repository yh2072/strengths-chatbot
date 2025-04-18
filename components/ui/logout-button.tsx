'use client';

import { signOut } from 'next-auth/react';
import { Button } from './button';

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <Button
      className={className}
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      退出登录
    </Button>
  );
} 