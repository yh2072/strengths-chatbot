'use client';

import { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web';

// 定义组件属性类型
interface LottieAnimationProps {
  animationPath: string;
  className?: string;
}

export default function LottieAnimation({ 
  animationPath, 
  className = '' 
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animInstance = useRef<any>(null);
  const [animationLoaded, setAnimationLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  useEffect(() => {
    // 如果已经有动画实例，不要重复创建
    if (animInstance.current || !containerRef.current) return;
    
    console.log('初始化Lottie动画:', animationPath);
    
    // 确保仅在客户端运行
    if (typeof window !== 'undefined') {
      try {
        // 创建动画实例
        const anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: animationPath,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
          }
        });
        
        // 保存实例引用
        animInstance.current = anim;
        
        anim.addEventListener('DOMLoaded', () => {
          console.log('动画已加载:', animationPath);
          setAnimationLoaded(true);
        });
        
        anim.addEventListener('data_ready', () => {
          console.log('动画数据准备完成:', animationPath);
        });
        
        anim.addEventListener('error', (err: any) => {
          console.error('动画加载错误:', err);
          setLoadError(`动画出错: ${err}`);
        });
      } catch (error: any) {
        console.error('Lottie初始化错误:', error);
        setLoadError(error.message);
      }
    }
    
    // 清理函数
    return () => {
      if (animInstance.current) {
        console.log('销毁动画实例');
        animInstance.current.destroy();
        animInstance.current = null;
      }
    };
  }, [animationPath]);
  
  // 显示加载错误
  if (loadError) {
    return (
      <div 
        ref={containerRef}
        className={`lottie-error ${className} bg-red-50 flex items-center justify-center text-red-500 text-sm p-2`}
        style={{minHeight: '100px'}}
      >
        动画加载失败: {loadError}
      </div>
    );
  }
  
  // 返回一个简单的容器
  return (
    <div 
      ref={containerRef} 
      className={`lottie-container ${className} ${animationLoaded ? 'opacity-100' : 'opacity-30'} transition-opacity duration-300`}
      data-testid="lottie-animation"
      data-path={animationPath}
      style={{minHeight: '100px'}}
    />
  );
} 