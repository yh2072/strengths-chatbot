import { ReactNode } from 'react';
import Form from 'next/form';

import { Input } from './ui/input';
import { Label } from './ui/label';

interface AuthFormProps {
  action: (formData: FormData) => void;
  children: ReactNode;
  defaultEmail?: string;
  isRegister?: boolean;
}

export function AuthForm({ action, children, defaultEmail = '', isRegister = false }: AuthFormProps) {
  return (
    <Form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          邮箱地址
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={defaultEmail}
          required
          placeholder="请输入您的邮箱"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="请输入您的密码"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>
      
      {isRegister && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            确认密码
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            placeholder="请再次输入密码"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      )}
      
      {children}
    </Form>
  );
}
