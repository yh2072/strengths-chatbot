'use client';

import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LottieAnimationProps {
  animationPath: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
}

export default function LottieAnimation({
  animationPath,
  width = '100%',
  height = '100%',
  className = '',
  loop = true,
  autoplay = true,
  speed = 1
}: LottieAnimationProps) {
  const animationContainer = useRef<HTMLDivElement>(null);
  const anim = useRef<any>(null);

  useEffect(() => {
    if (animationContainer.current) {
      anim.current = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
        loop,
        autoplay,
        path: animationPath,
      });

      anim.current.setSpeed(speed);

      return () => anim.current?.destroy();
    }
  }, [animationPath, loop, autoplay, speed]);

  return (
    <div 
      ref={animationContainer} 
      style={{ width, height }}
      className={className}
    />
  );
} 