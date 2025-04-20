'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState, Suspense } from 'react';
import { toast } from '@/components/toast';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import LottieAnimation from '@/components/lottie-animation';

import { login, type LoginActionState } from '../actions';
import { storeUserInfo } from '@/app/actions/auth';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    if (state.status === 'failed') {
      toast({
        type: 'error',
        description: '账号或密码错误!',
      });
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: '输入数据验证失败!',
      });
    } else if (state.status === 'success') {
      setIsSuccessful(true);
      toast({
        type: 'success',
        description: '登录成功!',
      });
      router.refresh();
      // @ts-ignore - 先忽略类型错误，需要更新LoginActionState类型
      storeUserInfo(state.user);
    }
  }, [state.status, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
      {/* 浮动气泡背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-indigo-300/20 mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-pink-300/20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-purple-300/20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 rounded-full bg-blue-300/20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
      </div>
      
      {/* 主卡片容器 */}
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] border border-white/20 z-10">
        <div className="flex flex-col md:flex-row">
          {/* 动画和标题区 */}
          <div className="w-full md:w-5/12 bg-gradient-to-r from-indigo-500 to-purple-600 p-8 flex flex-col items-center justify-center text-white">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm mr-3">
                <span className="text-white text-xl font-bold">夸</span>
              </div>
              <h1 className="text-3xl font-bold">夸夸星球</h1>
            </div>
            
            <div className="relative w-40 h-40 my-4">
              <Suspense fallback={<div className="w-40 h-40 bg-indigo-300/50 rounded-full animate-pulse"></div>}>
                <LottieAnimation 
                  animationPath="/animations/easter.json" 
                  className="w-full h-full"
                />
              </Suspense>
            </div>
            
            <h2 className="text-xl font-bold mb-2 text-center">治愈系成长助手</h2>
            <p className="text-sm text-white/80 text-center mb-6">每天一点点夸夸，心情美美哒</p>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-white mb-1">性格探索</div>
                <div className="text-xs text-white/70">发现你的闪光点</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-white mb-1">智能对话</div>
                <div className="text-xs text-white/70">和AI一起变强大</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-white mb-1">打卡成长</div>
                <div className="text-xs text-white/70">记录每天小确幸</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-white mb-1">社区互动</div>
                <div className="text-xs text-white/70">找到同频好友</div>
              </div>
            </div>
          </div>
          
          {/* 登录表单区 */}
          <div className="w-full md:w-7/12 p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">嗨，欢迎回来</h2>
              <p className="text-gray-500 mt-1">继续你的成长之旅吧~</p>
            </div>
            
            <AuthForm action={handleSubmit} defaultEmail={email}>
              <SubmitButton isSuccessful={isSuccessful} className="w-full mx-auto">登录</SubmitButton>
              <p className="text-center text-sm text-gray-600 mt-4">
                还没有账号？{' '}
                <Link
                  href="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  速速注册
                </Link>
              </p>
            </AuthForm>
            
            <div className="mt-8 flex items-center justify-center space-x-4">
              <Link href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">忘记密码?</Link>
              <span className="text-gray-300">|</span>
              <Link href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">联系客服</Link>
            </div>
            
            <div className="mt-10 text-center text-xs text-gray-500">
              <p>©2025 上海日知阁教育科技有限公司 版权所有</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
