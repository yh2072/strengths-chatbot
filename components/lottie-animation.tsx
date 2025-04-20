'use client';

import { useEffect, useRef, useState } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

// 定义组件属性类型
interface LottieAnimationProps {
  animationPath: string;
  className?: string;
}

export default function LottieAnimation({ 
  animationPath, 
  className = '' 
}: LottieAnimationProps) {
  const container = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // 安全检查：确保在浏览器环境中
    if (typeof window === 'undefined') return;
    
    let anim: AnimationItem | undefined;
    if (container.current) {
      try {
        anim = lottie.loadAnimation({
          container: container.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: animationPath,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
          }
        });
        
        anim.addEventListener('DOMLoaded', () => {
          setIsLoaded(true);
        });
      } catch (error) {
        console.error('Lottie animation error:', error);
      }
    }
    
    return () => {
      if (anim) anim.destroy();
    };
  }, [animationPath]);
  
  // 安全返回：在服务器端不渲染内容
  if (typeof window === 'undefined') return null;
  
  return (
    <div 
      ref={container} 
      className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
    ></div>
  );
} 