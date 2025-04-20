'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from '@/components/toast';
import dynamic from 'next/dynamic';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { register, type RegisterActionState } from '../actions';

const LottieAnimation = dynamic(
  () => import('@/components/lottie-animation'),
  { ssr: false }
);

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: 'idle',
    }
  );

  useEffect(() => {
    if (state.status === 'success') {
      router.push('/');
    }
    
    if (state.status === 'error') {
      toast({
        type: 'error',
        description: state.message || '注册失败',
      });
    }
  }, [state.status, state.message, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-100 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
      {/* 浮动气泡背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-purple-300/20 mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-blue-300/20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-indigo-300/20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-pink-300/20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
      </div>
      
      {/* 主卡片容器 */}
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(91,_33,_182,_0.2)] border border-white/20 z-10">
        <div className="flex flex-col md:flex-row-reverse">
          {/* 动画和标题区 */}
          <div className="w-full md:w-5/12 bg-gradient-to-r from-purple-500 to-blue-600 p-8 flex flex-col items-center justify-center text-white">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm mr-3">
                <span className="text-white text-xl font-bold">夸</span>
              </div>
              <h1 className="text-3xl font-bold">夸夸助手</h1>
            </div>
            
            <div className="relative w-40 h-40 my-4">
              {typeof window !== 'undefined' && (
                <LottieAnimation 
                  animationPath="/animations/register.json" 
                  className="w-full h-full"
                />
              )}
            </div>
            
            <h2 className="text-xl font-bold mb-2 text-center">解锁你的隐藏潜能</h2>
            <p className="text-sm text-white/80 text-center mb-6">每天一点点改变，幸福感蹭蹭上涨</p>
            
            <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-center mb-3">注册后立即获得：</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-white mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">专属性格优势报告，发现你的超能力</span>
                </li>
                <li className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-white mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">每日情绪积极引导练习</span>
                </li>
                <li className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-white mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">AI定制的夸夸话术，拯救社恐星人</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* 注册表单区 */}
          <div className="w-full md:w-7/12 p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">加入夸夸大家庭</h2>
              <p className="text-gray-500 mt-1">来一起做更好的自己吧~</p>
            </div>
            
            <AuthForm action={handleSubmit} defaultEmail={email} isRegister={true}>
              <SubmitButton isSuccessful={isSuccessful} className="w-full mx-auto">注册账户</SubmitButton>
              <p className="text-center text-sm text-gray-600 mt-4">
                已经是夸友了？{' '}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  点击登录
                </Link>
              </p>
            </AuthForm>
            
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>注册即表示您同意我们的<Link href="#" className="text-indigo-600 hover:underline">服务条款</Link>和<Link href="#" className="text-indigo-600 hover:underline">隐私政策</Link></p>
            </div>
            
            <div className="mt-6 flex items-center justify-center">
              <div className="flex -space-x-2 mr-3">
                <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="用户头像" />
                <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2" alt="用户头像" />
                <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" alt="用户头像" />
              </div>
              <p className="text-xs text-gray-500">已有10000+小伙伴加入啦</p>
            </div>
            
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>©2025 日知阁教育科技 版权所有</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
