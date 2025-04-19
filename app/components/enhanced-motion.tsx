'use client';

import React, { useEffect, useRef } from 'react';
import { motion as framerMotion, AnimatePresence as framerAnimatePresence, useMotionValue } from 'framer-motion';
import { forwardRef } from 'react';

// 安全的动画元素包装器
export const SafeMotionDiv = forwardRef(({ children, ...props }, ref) => {
  const elementRef = useRef(null);
  
  useEffect(() => {
    // 确保元素有 __complete 属性
    if (elementRef.current && !elementRef.current.__complete) {
      Object.defineProperty(elementRef.current, '__complete', {
        value: true,
        writable: true,
        configurable: true
      });
    }
  }, []);
  
  return (
    <div ref={(el) => {
      elementRef.current = el;
      // 处理转发的 ref
      if (ref) {
        if (typeof ref === 'function') {
          ref(el);
        } else {
          ref.current = el;
        }
      }
    }} {...props}>
      {children}
    </div>
  );
});

SafeMotionDiv.displayName = 'SafeMotionDiv';

// 创建安全的动画代理
function createSafeProxy(target) {
  return new Proxy(target, {
    get: function(obj, prop) {
      // 如果是普通组件类型
      if (typeof obj[prop] === 'function' && prop[0] === prop[0].toLowerCase()) {
        return function(props) {
          if (!props) return null;
          
          // 获取原始组件
          const OriginalComponent = obj[prop];
          const { children, ...rest } = props;
          
          // 添加安全属性
          return <OriginalComponent {...rest} data-safe-motion>{children}</OriginalComponent>;
        };
      }
      
      return obj[prop];
    }
  });
}

// 安全的动画版本
export const motion = createSafeProxy(framerMotion);

// 安全的 AnimatePresence 组件
export function AnimatePresence({ children, ...props }) {
  // 在客户端渲染
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }
  
  return (
    <framerAnimatePresence {...props}>
      {children}
    </framerAnimatePresence>
  );
}

// 动画辅助函数 - 安全版本
export function useSafeMotionValue(initialValue) {
  const value = useMotionValue(initialValue);
  
  // 确保值对象有所有需要的属性
  useEffect(() => {
    if (value && !value.__complete) {
      Object.defineProperty(value, '__complete', {
        value: true,
        writable: true,
        configurable: true
      });
    }
  }, [value]);
  
  return value;
} 