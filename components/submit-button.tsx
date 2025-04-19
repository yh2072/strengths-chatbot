'use client';

import { useFormStatus } from 'react-dom';
import { ReactNode } from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { useActionState } from 'react';

import { LoaderIcon } from '@/components/icons';

import { Button } from './ui/button';

interface SubmitButtonProps {
  children: ReactNode;
  isSuccessful: boolean;
  className?: string;
}

export function SubmitButton({ children, isSuccessful, className = '' }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type={pending ? 'button' : 'submit'}
      aria-disabled={pending || isSuccessful}
      disabled={pending || isSuccessful}
      className={`flex items-center justify-center h-11 px-6 py-3 
                 bg-gradient-to-r from-indigo-600 to-purple-600 
                 hover:from-indigo-700 hover:to-purple-700
                 text-white font-medium rounded-lg transition-all 
                 shadow-md hover:shadow-lg focus:outline-none
                 relative ${isSuccessful ? 'bg-green-500' : ''} ${className}`}
    >
      <div className="flex items-center justify-center">
        {isSuccessful ? (
          <>
            <CheckIcon className="h-5 w-5 mr-2" />
            <span>成功</span>
          </>
        ) : (
          children
        )}
      </div>

      {(pending || isSuccessful) && (
        <span className="animate-spin absolute right-4">
          <LoaderIcon />
        </span>
      )}

      <output aria-live="polite" className="sr-only">
        {pending || isSuccessful ? '加载中' : '提交表单'}
      </output>
    </Button>
  );
}
