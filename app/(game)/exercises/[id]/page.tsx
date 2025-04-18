'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import LottieAnimation from '@/components/ui/lottie-animation';

// 模拟练习数据 - 简化版
const EXERCISE_DATA = {
  'strengths-alignment': {
    title: '优势对齐',
    description: '将你的性格优势与日常工作融合，激活能量，创造意义感',
    longDescription: '每天朝九晚五的工作总是很乏味？这个练习将帮助你把"不得不做"变成"想要做"！研究表明，当我们有意识地将自己的核心优势应用到日常工作中，不仅工作效率提高了，幸福感也会随之提升。一项为期6个月的研究显示，每周刻意使用个人优势的员工，工作满意度提高了34%，倦怠感降低了40%。💡 这不是重新设计你的工作，而是重新设计你与工作的关系。',
    steps: [
      '列出你每天必须完成的5项工作任务（例如：回复邮件、参加会议、撰写报告等）',
      '确认你的5大性格优势（可以通过VIA优势问卷或自我反思）',
      '为每项工作任务找到至少一种运用你优势的方式（例如：用创造力让团队会议更有趣）',
      '未来两周内，每天至少刻意运用一次这些策略',
      '记录你的能量水平和工作满足感的变化'
    ],
    insights: [
      '34%：每天运用优势的人工作满意度提升比例',
      '大脑科学显示：使用优势时，大脑会释放多巴胺，带来自然的愉悦感',
      '优势应用可以让普通工作变成"使命感"，即使工作内容没变',
      '研究表明，刻意使用优势的员工比纯粹追求"激情"的员工更容易持续高效'
    ],
    duration: '15-20分钟设计 + 2周实践',
    level: 1,
    completions: 0,
    rating: 4.8,
    ratingCount: 156,
    characters: ['爱因斯坦', '哆啦A梦', '蜘蛛侠'],
    image: '/images/strength-cake.png'
  }
};

export default function ExercisePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const exercise = EXERCISE_DATA[id];
  const [isHovering, setIsHovering] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  if (!exercise) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">练习未找到</h2>
          <p className="text-gray-600 mb-6">抱歉，我们找不到您请求的练习内容</p>
          <Link href="/exercises" 
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
            返回练习列表
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto pt-8 pb-16 px-4 sm:px-6">
      {/* 顶部导航与评分区域 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <Link 
        href="/exercises" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 md:mb-0 group"
      >
          <span className="bg-indigo-100 p-1.5 rounded-full mr-2 group-hover:bg-indigo-200 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
          </span>
          <span className="font-medium">返回练习列表</span>
      </Link>
      
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <div className="flex mr-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 ${star <= Math.round(exercise.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                  viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700 ml-1">{exercise.rating}</span>
            <span className="text-xs text-gray-500 ml-1">({exercise.ratingCount})</span>
          </div>
          
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-sm">
            Lv.{exercise.level}
          </div>
          
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 shadow-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {exercise.completions}次
          </div>
        </div>
      </div>
      
      {/* 简化的练习信息条 */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-md">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">时长:</span>
          <span className="text-sm font-medium text-indigo-600">{exercise.duration}</span>
        </div>
        
        <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
          优质练习
        </div>
      </div>
      
      {/* 主内容区 - 标题、描述和动画 */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden mb-10 p-6 sm:p-8 md:p-10 relative"
      >
        {/* 装饰元素 */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-blue-300/10 to-cyan-300/10 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center relative">
          <div className="lg:flex-1 lg:pr-10">
        <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                {exercise.title}
              </h1>
              
              <p className="text-lg text-gray-700 mb-4">{exercise.description}</p>
              <p className="text-gray-600 mb-6 leading-relaxed">{exercise.longDescription}</p>
              
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onClick={() => router.push(`/exercises/${id}/select`)}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
                >
                  <span className="flex items-center justify-center">
                    <span>开始练习</span>
                    <motion.span
                      initial={{ x: 0 }}
                      animate={{ x: isHovering ? 5 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
                    </motion.span>
            </span>
                </motion.button>
                
                <button 
                  onClick={() => setShowDetails(!showDetails)} 
                  className="flex items-center justify-center px-5 py-3 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors duration-200"
                >
                  <span className="mr-2">研究洞见</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* 折叠式研究洞见面板 */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 mb-6">
                      <h3 className="font-medium text-indigo-800 mb-3">研究洞见:</h3>
                      <ul className="space-y-2">
                        {exercise.insights.map((insight, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <span className="text-indigo-500 mr-2 mt-1">•</span>
                            <span>{insight}</span>
              </li>
            ))}
          </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
        </motion.div>
          </div>
        
          {/* 动画区域 */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 lg:mt-0 flex justify-center items-center"
          >
            <div className="w-64 h-64 md:w-80 md:h-80 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full blur-lg opacity-70 animate-pulse-slow"></div>
              <LottieAnimation 
                animationPath="/animations/cute-rabbit-drinking-tea-at-laptop.json"
                speed={0.7}
                className="drop-shadow-xl relative z-10"
              />
            </div>
        </motion.div>
      </div>
      </motion.div>
      
      {/* 练习步骤 */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-indigo-100 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
      >
        {/* 装饰元素 */}
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-indigo-400/10 to-purple-500/10 rounded-full blur-xl"></div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </span>
          练习步骤
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {exercise.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="flex items-start bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border border-indigo-100"
            >
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                {index + 1}
              </span>
              <span className="text-gray-700 font-medium">{step}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 