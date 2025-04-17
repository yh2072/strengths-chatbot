'use client';

import { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web';

export default function LottieAnimation({ animationPath, className = '' }) {
  const container = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    let anim;
    if (container.current) {
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
    }
    
    return () => {
      if (anim) anim.destroy();
    };
  }, [animationPath]);
  
  return (
    <div 
      ref={container} 
      className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
    ></div>
  );
} 