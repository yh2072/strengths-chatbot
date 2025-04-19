'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { use } from 'react';
import LottieAnimation from '@/components/ui/lottie-animation';
import ParticleBackground from '@/components/ui/particle-background';

// 角色数据
const CHARACTERS = [
  {
    id: 'einstein',
    name: '爱因斯坦',
    emoji: '👨‍🔬',
    imagePath: '/images/einstein.svg',
    title: '天才物理学家',
    personality: '好奇、深刻、幽默',
    description: '爱因斯坦以创新思维和深刻洞察力著称。他会以清晰的逻辑和比喻帮助你探索优势如何改变工作体验。',
    strengths: ['分析思维', '创新视角', '思想实验'],
    color: 'from-blue-500 to-cyan-500',
    lightColor: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    bgColor: 'from-blue-500/10 to-cyan-500/10',
    animation: '/animations/einstein-thinking.json',
    quote: "发现你的优势就像发现宇宙的奥秘，充满惊奇与启发。",
    useImage: true
  },
  {
    id: 'doraemon',
    name: '哆啦A梦',
    emoji: '🤖',
    imagePath: '/images/Doraemon.webp',
    title: '未来科技猫',
    personality: '友善、耐心、鼓励',
    description: '哆啦A梦总是有各种神奇道具来帮助你。他会用简单易懂的方式和积极鼓励引导你完成练习。',
    strengths: ['创造解决方案', '积极支持', '友好指导'],
    color: 'from-blue-500 to-indigo-500',
    lightColor: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    bgColor: 'from-blue-500/10 to-indigo-500/10',
    animation: '/animations/cute-robot-waving.json',
    quote: "不必担心，我有百宝袋！让我们一起找到你的超能力吧！",
    useImage: true
  },
  {
    id: 'spiderman',
    name: '蜘蛛侠',
    emoji: '🕸️',
    imagePath: '/images/spiderman.svg',
    title: '友好邻居',
    personality: '幽默、责任感、乐观',
    description: '蜘蛛侠相信能力越大责任越大。他会用亲身经历和幽默风格帮助你发现自己的潜能，并负责任地运用它们。',
    strengths: ['创意解决问题', '坚韧不拔', '积极乐观'],
    color: 'from-red-500 to-blue-500',
    lightColor: 'from-red-50 to-blue-50',
    borderColor: 'border-red-200',
    bgColor: 'from-red-500/10 to-blue-500/10',
    animation: '/animations/wizard-magic.json',
    quote: "能力越大，责任越大。发现你的优势，也要明智地运用它们。",
    useImage: true
  }
];

export default function CharacterSelectPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id: exerciseId } = unwrappedParams;
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isHovering, setIsHovering] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showQuote, setShowQuote] = useState(false);

  // 处理选择角色
  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
    // 选择角色时显示名言
    setShowQuote(true);
    setTimeout(() => setShowQuote(false), 3000);
  };

  // 处理开始练习
  const handleStartExercise = () => {
    if (!selectedCharacter) return;
    
    setIsConfirming(true);
    // 模拟网络请求延迟
    setTimeout(() => {
      router.push(`/exercises/${exerciseId}/chat?character=${selectedCharacter.id}`);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-20 px-4 sm:px-6 relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-purple-300/10 mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-96 h-96 rounded-full bg-blue-300/10 mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 rounded-full bg-indigo-300/10 mix-blend-multiply filter blur-3xl"></div>
      </div>
      
      {/* 顶部导航 */}
      <div className="mb-8 relative z-10">
        <Link 
          href={`/exercises/${exerciseId}`} 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 group"
        >
          <span className="bg-indigo-100 p-1.5 rounded-full mr-2 group-hover:bg-indigo-200 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="font-medium">返回练习介绍</span>
        </Link>
      </div>
      
      {/* 标题区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-block mb-3 px-4 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full text-sm font-medium text-indigo-700 border border-indigo-100 shadow-sm">
          选择你的引导者
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          谁将陪伴你完成这次练习？
        </h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          每个角色都有独特的指导风格和专长。选择一位你喜欢的角色，Ta将陪伴你完成整个练习。
        </p>
      </motion.div>
      
      {/* 角色选择区域 - 调整卡片比例为3:4 */}
      <div className="overflow-x-auto pb-10 pt-4 hide-scrollbar">
        <div className="flex justify-center px-4 min-w-max space-x-6 sm:space-x-8">
          {CHARACTERS.map((character, index) => (
            <motion.div
              key={character.id}
              initial={{ scale: 1 }}
              animate={{ 
                scale: selectedCharacter?.id === character.id ? 1.08 : 1,
                zIndex: selectedCharacter?.id === character.id ? 10 : 1
              }}
              whileHover={{ scale: selectedCharacter?.id === character.id ? 1.08 : 1.04 }}
              whileTap={{ scale: selectedCharacter?.id === character.id ? 1.05 : 0.98 }}
              transition={{ duration: 0.3 }}
              className={`relative flex-shrink-0 w-[240px] sm:w-[280px] aspect-[3/4] flex flex-col rounded-xl border-2 cursor-pointer transition-all ${
                selectedCharacter?.id === character.id 
                  ? 'border-indigo-500 bg-gradient-to-b from-indigo-50/90 to-purple-50/90 shadow-lg transform' 
                  : 'border-gray-200 hover:border-indigo-200 bg-white/90'
              } backdrop-blur-sm`}
              onClick={() => handleSelectCharacter(character)}
            >
              {/* 头像和名称放在顶部 */}
              <div className="flex-none p-3 sm:p-4">
                <div className="flex flex-col items-center mb-2 sm:mb-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-indigo-100 mb-2 sm:mb-3 shadow-md">
                    <Image 
                      src={character.imagePath} 
                      alt={character.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 text-center">{character.name}</h3>
                  <div className="text-xs text-indigo-600 font-medium text-center">{character.title}</div>
                </div>
              </div>
              
              {/* 描述放在中间，允许滚动 */}
              <div className="flex-1 px-3 sm:px-4 overflow-y-auto hide-scrollbar">
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {character.description}
                </p>
                
                {/* 显示角色特长 */}
                <div className="mt-2 sm:mt-3 flex flex-wrap gap-1">
                  {character.strengths.slice(0, 2).map((strength, idx) => (
                    <span key={idx} className="inline-block px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 选中指示器放在底部 */}
              <div className="flex-none p-3 sm:p-4 pt-0 flex justify-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  selectedCharacter?.id === character.id 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                    : 'bg-gray-100 border border-gray-200'
                }`}>
                  {selectedCharacter?.id === character.id && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* 底部操作区 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center relative z-10 mt-2"
      >
        <motion.button
          whileHover={selectedCharacter ? { scale: 1.05 } : {}}
          whileTap={selectedCharacter ? { scale: 0.98 } : {}}
          onClick={handleStartExercise}
          disabled={!selectedCharacter || isConfirming}
          className={`px-10 py-4 rounded-xl font-medium text-white shadow-lg transition-all duration-300 ${
            !selectedCharacter 
              ? 'bg-gray-400 cursor-not-allowed' 
              : `bg-gradient-to-r ${selectedCharacter.color} hover:shadow-xl`
          }`}
        >
          {isConfirming ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在准备练习...
            </span>
          ) : !selectedCharacter ? (
            <span>请选择一个角色</span>
          ) : (
            <span className="flex items-center justify-center">
              与 {selectedCharacter.name} 一起开始练习
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </motion.button>
        
        {!selectedCharacter && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 text-sm text-gray-500"
          >
            点击上方卡片选择一个引导角色
          </motion.p>
        )}
        
        {selectedCharacter && !isConfirming && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-sm text-gray-500"
          >
            你选择了 <span className="font-medium text-indigo-600">{selectedCharacter.name}</span>，点击上方按钮开始练习
          </motion.p>
        )}
      </motion.div>
    </div>
  );
} 