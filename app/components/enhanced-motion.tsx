'use client';

import React, { useEffect, useRef } from 'react';
import { motion as framerMotion, AnimatePresence as framerAnimatePresence, useMotionValue } from 'framer-motion';
import { forwardRef } from 'react';

// 定义SafeMotionDiv的属性类型
interface SafeMotionDivProps {
  children?: React.ReactNode;
  [key: string]: any; // 允许传递其他属性
}

// 使用泛型定义forwardRef类型
export const SafeMotionDiv = forwardRef<HTMLDivElement, SafeMotionDivProps>(
  ({ children, ...props }, ref) => {
    const elementRef = useRef<HTMLDivElement | null>(null);
    
    useEffect(() => {
      // 确保元素有 __complete 属性
      if (elementRef.current && !('__complete' in elementRef.current)) {
        Object.defineProperty(elementRef.current, '__complete', {
          value: true,
          writable: true,
          configurable: true
        });
      }
    }, []);
    
    // 处理ref的逻辑
    const handleRef = (el: HTMLDivElement | null) => {
      elementRef.current = el;
      
      // 处理转发的ref
      if (ref) {
        if (typeof ref === 'function') {
          ref(el);
        } else {
          ref.current = el;
        }
      }
    };
    
    return (
      <div ref={handleRef} {...props}>
        {children}
      </div>
    );
  }
);

// 确保组件有displayName
SafeMotionDiv.displayName = 'SafeMotionDiv';

// 创建安全的动画代理
function createSafeProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get: function(obj: T, prop: string | symbol) {
      // 如果是普通组件类型
      if (typeof obj[prop as keyof T] === 'function' && 
          typeof prop === 'string' && 
          prop.length > 0 && 
          prop[0] === prop[0].toLowerCase()) {
        return function(props: Record<string, any> | undefined) {
          if (!props) return null;
          
          // 获取原始组件
          const OriginalComponent = obj[prop as keyof T] as any;
          const { children, ...rest } = props;
          
          // 添加安全属性
          return <OriginalComponent {...rest} data-safe-motion>{children}</OriginalComponent>;
        };
      }
      
      return obj[prop as keyof T];
    }
  });
}

// 安全的动画版本
export const motion = createSafeProxy(framerMotion);

// 同样为其他组件添加类型
interface AnimatePresenceProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export function AnimatePresence({ children, ...props }: AnimatePresenceProps) {
  // 在客户端渲染
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }
  
  const { AnimatePresence: FramerAnimatePresence } = require('framer-motion');
  
  return (
    <FramerAnimatePresence {...props}>
      {children}
    </FramerAnimatePresence>
  );
}

// Motion值钩子也需要类型
export function useSafeMotionValue<T>(initialValue: T) {
  if (typeof window === 'undefined') {
    return { get: () => initialValue, set: () => {} };
  }
  
  const { useMotionValue } = require('framer-motion');
  const value = useMotionValue(initialValue);
  
  // 确保值对象有所有需要的属性
  useEffect(() => {
    if (value && !('__complete' in value)) {
      Object.defineProperty(value, '__complete', {
        value: true,
        writable: true,
        configurable: true
      });
    }
  }, [value]);
  
  return value;
} 