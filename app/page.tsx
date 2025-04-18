import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LottieAnimation from '@/components/ui/lottie-animation';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 sm:p-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 overflow-hidden relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-purple-300/10 mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-blue-300/10 mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-indigo-300/10 mix-blend-multiply filter blur-3xl"></div>
      </div>
      
      {/* 顶部装饰 */}
      <div className="text-center relative z-10 mb-6 md:mb-0">
        <span className="inline-block px-4 py-1 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium text-indigo-700 shadow-sm mb-4">
          欢迎！
        </span>
      </div>
      
      {/* 中间内容 */}
      <div className="flex flex-col items-center justify-center flex-grow relative z-20 max-w-3xl mx-auto">
        <div className="w-full max-w-md mb-8">
          <LottieAnimation 
            animationPath="/animations/easter-bunny-hugging-easter-egg.json"
            loop={true}
            autoplay={true}
            speed={1}
            className="w-full max-w-md mx-auto"
          />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-6">
          夸夸星球
        </h1>
        <p className="text-lg text-gray-700 max-w-md text-center mb-8">
          发现你的品格优势，释放内在潜能
        </p>
        
        <Link href="/exercises" className="w-full max-w-xs">
          <Button className="w-full h-14 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            开始探索
          </Button>
        </Link>
        
        <p className="mt-4 text-sm text-gray-500">
          基于积极心理学的品格优势干预平台
        </p>
      </div>
      
      {/* 底部信息 */}
      <div className="w-full text-center relative z-10 mt-8 md:mt-0">
        <p className="text-xs text-gray-500">
          上海日知阁教育科技有限公司 © {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
} 