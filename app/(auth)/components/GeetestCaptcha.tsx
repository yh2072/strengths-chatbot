'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface GeetestCaptchaProps {
  onSuccess: (data: any) => void;
  captchaId: string;
}

export default function GeetestCaptcha({ onSuccess, captchaId }: GeetestCaptchaProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [initStarted, setInitStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const captchaRef = useRef<any>(null);
  
  // 使用useId hook来生成稳定的ID，避免服务器/客户端不匹配
  const stableId = useRef(`geetest-captcha-${Math.floor(Math.random() * 1000000)}`).current;

  // 使用原生DOM方式初始化极验
  const initGeetest = () => {
    if (!scriptLoaded || !containerRef.current || initStarted) return;
    
    setInitStarted(true);
    console.log("初始化极验验证...", captchaId);
    
    // 创建一个新的div作为极验容器，使用稳定ID
    const captchaContainer = document.createElement('div');
    captchaContainer.id = stableId;
    
    // 清空React引用的容器并添加新创建的div
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(captchaContainer);
    }
    
    // 使用setTimeout确保DOM已完全准备好
    setTimeout(() => {
      try {
        console.log("极验初始化参数:", {
          captchaId,
          windowHasInitGeetest4: typeof window.initGeetest4 === 'function'
        });
        
        if (typeof window.initGeetest4 === 'function') {
          window.initGeetest4({
            captchaId: captchaId || '',
            product: 'popup',
            language: 'zho',
          }, (captchaObj) => {
            captchaRef.current = captchaObj;
            
            captchaObj.onReady(() => {
              console.log("极验已准备好");
              captchaObj.showCaptcha();
            });
            
            captchaObj.onSuccess(() => {
              console.log("极验验证成功");
              const result = captchaObj.getValidate();
              console.log("验证结果:", result);
              
              onSuccess({
                lotNumber: result.lot_number,
                captchaOutput: result.captcha_output,
                passToken: result.pass_token, 
                genTime: result.gen_time
              });
            });
            
            captchaObj.onError((error: any) => {
              console.error("极验错误:", error);
            });
            
            // 使用容器的ID
            captchaObj.appendTo(`#${stableId}`);
          });
        } else {
          console.error("initGeetest4函数未找到");
        }
      } catch (error) {
        console.error("初始化极验出错:", error);
      }
    }, 100);
  };

  // 使用useEffect进行客户端初始化，避免服务器端执行
  useEffect(() => {
    // 确保是客户端环境
    if (typeof window === 'undefined') return;
    
    if (scriptLoaded) {
      initGeetest();
    }
  }, [scriptLoaded]);

  return (
    <div className="geetest-wrapper">
      <Script
        src="https://static.geetest.com/v4/gt4.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("极验脚本加载完成");
          setScriptLoaded(true);
        }}
        onError={(e) => console.error("极验脚本加载失败:", e)}
      />
      
      <div
        ref={containerRef}
        className="border border-gray-300 rounded-lg p-4 min-h-[100px] flex justify-center items-center"
      >
        <div className="flex items-center text-gray-400">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          加载验证中...
        </div>
      </div>
    </div>
  );
} 