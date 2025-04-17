'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function UserNav({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!user) return null;
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm"
      >
        <span className="hidden md:inline-block">{user.name || user.email}</span>
        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
          {(user.name?.charAt(0) || user.email?.charAt(0) || '?').toUpperCase()}
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white z-10">
          <div className="py-1">
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 