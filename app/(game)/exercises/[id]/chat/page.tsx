'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { generateUUID } from '@/lib/utils';
import { toast } from 'sonner';

// 角色数据
const CHARACTERS = {
  einstein: {
    name: '爱因斯坦',
    avatar: '/characters/einstein.png',
    greeting: "啊哈！我是爱因斯坦博士。相对论告诉我们，时间是相对的——但你的优势却是绝对的！今天我们要进行一个奇妙的思想实验：将你的核心优势与工作任务融合，就像我把质量与能量统一在E=mc²中一样！准备好了吗？",
    promptTemplate: `你是爱因斯坦博士，一位既有天才头脑又充满温暖幽默感的科学家。你在帮助人们发现自己内在优势的同时，会用你标志性的口头禅"想象力比知识更重要"和偶尔冒出的物理学笑话来活跃气氛。现在你正在引导用户完成"优势对齐"练习，请根据用户的回答继续这个对话。`
  },
  doraemon: {
    name: '哆啦A梦',
    avatar: '/characters/doraemon.png', 
    greeting: "哇！你好啊！我是哆啦A梦，从未来世界来帮助你的！今天我要从四次元口袋里拿出一个超棒的道具——'优势放大镜'！这个道具可以帮你看清自己的闪光点，然后把它们用在工作中，让工作变得超有趣！准备好一起探险了吗？",
    promptTemplate: `你是来自22世纪的机器猫哆啦A梦，带着神奇的四次元口袋来到现在，目的是帮助用户发掘内在优势并活出更精彩的人生。你说话风格活泼可爱，经常使用"哇"、"啊"等语气词，并会适时提到你的四次元口袋里的道具来比喻学习工具。现在你正在引导用户完成"优势对齐"练习，请根据用户的回答继续这个对话。`
  },
  dumbledore: {
    name: '邓布利多教授',
    avatar: '/characters/dumbledore.png',
    greeting: "亲爱的同学，欢迎来到霍格沃茨优势学院。我是阿不思·邓布利多教授。正如我常说，'我们的选择，远比我们的能力更能展现我们是谁。'今天，我们将探索你内在的魔法优势，并学习如何在日常工作中施展这些魔法。你准备好开始这段奇妙的旅程了吗？或许来颗柠檬雪宝？",
    promptTemplate: `你是霍格沃茨的邓布利多教授，一位充满智慧、幽默且深谙人性的魔法导师。你善于发现每个人内在的"魔法"(即优势)，并教导他们如何运用这些魔法面对生活挑战。你说话时会引用魔法世界的典故，偶尔提到柠檬雪宝糖，语气温和却充满力量。现在你正在引导用户完成"优势对齐"练习，请根据用户的回答继续这个对话。`
  }
};

// 练习引导步骤
const EXERCISE_STEPS = [
  {
    id: 'intro',
    title: '介绍',
    description: '欢迎和练习概览'
  },
  {
    id: 'workTasks',
    title: '工作任务',
    description: '列出5项最常执行的工作任务'
  },
  {
    id: 'strengths',
    title: '个人优势',
    description: '确认你的5大性格优势'
  },
  {
    id: 'alignment',
    title: '优势对齐',
    description: '将优势与工作任务结合'
  },
  {
    id: 'practice',
    title: '实践计划',
    description: '制定具体行动计划'
  }
];

// 练习数据
const EXERCISE_DATA = {
  'strengths-alignment': {
    title: '优势对齐',
    description: '将你的性格优势与工作任务相结合，创造更多能量和意义'
  }
};

// 添加接口定义
interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

// 定义步骤状态接口
interface StepStatus {
  index: number;
  completed: boolean;
  startTime: Date;
  minTimeRequired: number;
  aiResponseCount: number;
  processedMessageIds: Set<string>;
}

// 使用浏览器原生alert或创建一个简单的提示函数
const showToast = (message) => {
  // 可以使用alert作为简单替代
  // alert(message);
  
  // 或者创建一个临时提示元素
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-md z-50';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // 3秒后自动移除
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
  
  console.warn(message);
};

export default function GameChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params.id as string;
  const characterId = searchParams.get('character');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepStatus>({ 
    index: 0, 
    completed: false, 
    startTime: new Date(),
    minTimeRequired: 30,
    aiResponseCount: 0,
    processedMessageIds: new Set()
  });
  const [showEmojis, setShowEmojis] = useState(false);
  const [showStepAdvanceHint, setShowStepAdvanceHint] = useState(false);
  const [hasReceivedAiResponse, setHasReceivedAiResponse] = useState(false);
  
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);
  const inputRef = useRef(null);
  
  const exercise = EXERCISE_DATA[id as keyof typeof EXERCISE_DATA];
  const character = characterId ? CHARACTERS[characterId as keyof typeof CHARACTERS] : null;
  
  // 自动滚动到底部
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 初始欢迎消息
  useEffect(() => {
    if (character) {
      setMessages([{
        id: generateUUID(),
        role: 'assistant',
        content: character.greeting,
        createdAt: new Date().toISOString()
      }]);
    }
  }, [character]);
  
  // 在AI回复解析完成后检查是否包含步骤完成的提示
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        setHasReceivedAiResponse(true);
        
        // 检查该消息是否已在当前步骤中处理过
        if (!currentStep.processedMessageIds.has(lastMessage.id)) {
          // 更新步骤状态，增加计数并记录消息ID
          setCurrentStep(prev => {
            const updatedProcessedIds = new Set(prev.processedMessageIds);
            updatedProcessedIds.add(lastMessage.id);
            
            const newCount = prev.aiResponseCount + 1;
            console.log(`步骤${prev.index+1}的AI响应计数: ${prev.aiResponseCount} -> ${newCount}`);
            
            // 如果AI响应次数达到2次或以上，自动将步骤标记为完成
            const shouldAutoComplete = newCount >= 5;
            if (shouldAutoComplete && !prev.completed) {
              console.log(`基于响应次数自动完成步骤${prev.index+1}`);
              setShowStepAdvanceHint(true);
            }
            
            return {
              ...prev,
              aiResponseCount: newCount,
              processedMessageIds: updatedProcessedIds,
              completed: prev.completed || shouldAutoComplete // 保持已完成状态或设为完成
            };
          });
        }
        
        // 检查是否包含自动进入下一步的关键词
        const content = lastMessage.content.toLowerCase();
        const autoAdvanceKeywords = ['下一步', '接下来', '继续下一步', '前进到下一步'];
        const shouldAutoAdvance = autoAdvanceKeywords.some(keyword => 
          content.includes(keyword)
        );
        
        // 关键词检测，标记步骤完成
        const stepCompleteKeywords = [
          '完成了这一步', '这一步已完成', '进入下一步', 
          '准备好进入下一步', '可以进入下一步', '下一步',
          '完成这一步', '这一步已经完成', '已经完成这一步',
          '接下来'
        ];
        
        const hasStepCompleteHint = stepCompleteKeywords.some(keyword => 
          content.includes(keyword)
        );
        
        if (hasStepCompleteHint) {
          setCurrentStep(prev => ({...prev, completed: true}));
          setShowStepAdvanceHint(true);
          
          // 如果包含自动进入下一步的关键词，且当前步骤不是最后一步，则自动进入下一步
          if (shouldAutoAdvance && currentStep.index < 4) {
            // 为了确保状态更新先完成，使用setTimeout延迟执行
            setTimeout(() => {
              console.log('检测到自动进入下一步关键词，自动前进...');
              advanceToNextStep();
            }, 1500); // 延迟1.5秒，给用户时间阅读当前消息
          }
        }
      }
    }
  }, [isLoading, messages, currentStep.processedMessageIds]);
  
  // 在步骤变化时显示指引
  useEffect(() => {
    // 当步骤改变时添加指引消息
    const stepGuides = [
      "请列出你工作中最常执行的5项任务，每项任务用简短的一句话描述。",
      "基于你的经历和性格，你认为自己的5大优势是什么？可以是具体技能或性格特质。",
      "让我们将你的优势与任务结合。对于之前列出的每项任务，你如何应用你的优势？",
      "制定一个为期一周的计划，将这些优势应用到工作中。具体到每天要做什么。",
      "反思一下，应用优势后你的工作感受有什么变化？能量和满足感是否提升？"
    ];
    
    if (currentStep.index >= 0 && currentStep.index < stepGuides.length) {
      // 添加系统引导消息
      setMessages(prev => [...prev, {
        id: generateUUID(),
        role: 'system',
        content: `## 步骤 ${currentStep.index + 1}: ${stepGuides[currentStep.index]}`,
        createdAt: new Date().toISOString(),
        isGuide: true // 标记为指引消息，可用于特殊样式
      }]);
    }
  }, [currentStep.index]);
  
  // 修改shouldShowNextStepButton的判断，添加日志
  console.log(`步骤${currentStep.index+1}当前状态: 已完成=${currentStep.completed}, AI响应=${currentStep.aiResponseCount}, 显示下一步按钮=${useMemo(() => {
    const result = currentStep.completed && currentStep.aiResponseCount >= 2;
    console.log(`步骤${currentStep.index+1}当前状态: 已完成=${currentStep.completed}, AI响应=${currentStep.aiResponseCount}, 显示下一步按钮=${result}`);
    return result;
  }, [currentStep.completed, currentStep.aiResponseCount, currentStep.index])}`);
  const shouldShowNextStepButton = useMemo(() => {
    const result = currentStep.completed && currentStep.aiResponseCount >= 2;
    console.log(`步骤${currentStep.index+1}当前状态: 已完成=${currentStep.completed}, AI响应=${currentStep.aiResponseCount}, 显示下一步按钮=${result}`);
    return result;
  }, [currentStep.completed, currentStep.aiResponseCount, currentStep.index]);
  
  // 处理发送消息
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // 创建用户消息
    const userMessage = {
      id: generateUUID(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString()
    };
    
    // 更新UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // 创建AI消息ID和空内容
      const aiMessageId = generateUUID();
      
      // 添加空的AI消息到UI
      const aiMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString()
      };
      
      // 更新UI
      setMessages(prev => [...prev, aiMessage]);
      
      // 发送请求到API
      const response = await fetch('/api/game-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage),
          characterId,
          exerciseId: id,
          currentStep: currentStep.index
        })
      });
      
      if (!response.ok) {
        throw new Error('请求失败');
      }
      
      // 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // 解码收到的数据
        const chunk = decoder.decode(value, { stream: true });
        console.log('收到数据块:', chunk);
        
        // 处理行
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'textMessagePartContent') {
                aiContent += parsed.text;
                
                // 更新UI中的AI消息
                setMessages(prev => {
                  const updatedMessages = [...prev];
                  const aiIndex = updatedMessages.findIndex(m => m.id === aiMessageId);
                  
                  if (aiIndex >= 0) {
                    updatedMessages[aiIndex] = {
                      ...updatedMessages[aiIndex],
                      content: aiContent
                    };
                  }
                  
                  return updatedMessages;
                });
              }
            } catch (e) {
              console.error('解析响应错误:', e);
            }
          }
        }
      }
      
      // 移除自动步骤增加，改为在用户确认后进行
      setIsLoading(false);
    } catch (err) {
      console.error('发送消息错误:', err);
      setIsLoading(false);
    }
  };
  
  // 添加主动前进到下一步的功能
  const advanceToNextStep = () => {
    // 只有满足继续条件时才能前进
    if (!shouldShowNextStepButton) {
      console.log('条件不满足，无法继续下一步');
      // 使用替代提示方法
      toast.error('需要与AI多交流才能继续');
      return;
    }
    
    if (currentStep.index < 4) {
      setCurrentStep({
        index: currentStep.index + 1,
        completed: false,
        startTime: new Date(),
        minTimeRequired: 30,
        aiResponseCount: 0,
        processedMessageIds: new Set()
      });
      setShowStepAdvanceHint(false);
      setHasReceivedAiResponse(false);
    } else {
      // 最后一步完成，保存练习状态
      saveExerciseCompletion();
      router.push(`/exercises/${id}/complete`);
    }
  };
  
  // 添加表情
  const addEmoji = (emoji) => {
    setInput(prev => prev + emoji);
    setShowEmojis(false);
    inputRef.current?.focus();
  };
  
  // 常用表情符号
  const emojis = ['😊', '👍', '🤔', '❤️', '🔥', '👏', '😂', '🙏', '🎉', '🚀'];
  
  if (!character || !exercise) {
    return <div className="text-center py-10 text-gray-600">加载中...</div>;
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-indigo-100 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Link 
            href={`/exercises/${id}/select`}
            className="text-indigo-600 hover:text-indigo-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{exercise.title}</h2>
            <p className="text-xs text-gray-500">{exercise.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full">
            <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
              <img 
                src={character.avatar || `https://ui-avatars.com/api/?name=${character.name}`}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-medium text-indigo-700">{character.name}</span>
          </div>
        </div>
      </div>
      
      {/* 进度指示器 */}
      <div className="bg-white px-6 py-3 border-b border-indigo-100">
        {/* 步骤提示 */}
        <div className="text-xs text-gray-500 mb-2">
          步骤 {currentStep.index + 1}/5: 
          {currentStep.index === 0 && "列出工作任务"}
          {currentStep.index === 1 && "确认性格优势"}
          {currentStep.index === 2 && "将优势与任务结合"}
          {currentStep.index === 3 && "制定实践计划"}
          {currentStep.index === 4 && "反思与总结"}
        </div>
        
        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${((currentStep.index + 1) / 5) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${
              message.role === 'user' 
                ? 'justify-end' 
                : message.role === 'system' && message.isGuide 
                  ? 'justify-center' 
                  : 'justify-start'
            }`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : message.role === 'system' && message.isGuide
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm'
                    : 'bg-white border border-indigo-100 shadow-sm rounded-tl-none'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                    <img 
                      src={character.avatar || `https://ui-avatars.com/api/?name=${character.name}`}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-indigo-700">{character.name}</span>
                </div>
              )}
              
              <div className={`${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                {message.content || (
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-indigo-300 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="h-2 w-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 添加在消息列表底部，步骤导航控制 */}
      {!isLoading && messages.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center my-4"
        >
          <div className="bg-white border border-indigo-100 rounded-lg shadow-sm p-4 max-w-md text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {currentStep.index === 0 && "正在列出工作任务"}
              {currentStep.index === 1 && "正在确认性格优势"}
              {currentStep.index === 2 && "正在将优势与任务结合"}
              {currentStep.index === 3 && "正在制定实践计划"}
              {currentStep.index === 4 && "正在反思与总结"}
            </h3>
            
            <p className="text-xs text-gray-500 mb-3">
              {currentStep.index === 0 && "列出5项你在工作中最常执行的任务"}
              {currentStep.index === 1 && "确认你的5大性格优势"}
              {currentStep.index === 2 && "为每项任务找到应用优势的方式"}
              {currentStep.index === 3 && "制定在日常工作中实践这些新方法的计划"}
              {currentStep.index === 4 && "观察能量和满足感的变化"}
            </p>
            
            <div className="flex space-x-2 justify-center">
              {currentStep.index > 0 && (
                <button
                  onClick={() => setCurrentStep(prevStep => ({
                    ...prevStep,
                    index: prevStep.index - 1
                  }))}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors"
                >
                  上一步
                </button>
              )}
              
              {currentStep.index < 4 && (
                <button
                  onClick={advanceToNextStep}
                  className={`px-3 py-1.5 rounded-lg ${
                    shouldShowNextStepButton 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } transition-colors`}
                  disabled={!shouldShowNextStepButton}
                >
                  继续下一步
                  {!shouldShowNextStepButton && currentStep.aiResponseCount > 0 && 
                    <span className="text-xs ml-1">
                      (需要再交流{Math.max(0, 2 - currentStep.aiResponseCount)}次)
                    </span>
                  }
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* 输入区域 */}
      <div className="border-t border-indigo-100 bg-white p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex">
            <button
              type="button"
              onClick={() => setShowEmojis(!showEmojis)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
              </svg>
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的回复..."
              className="flex-1 py-3 pl-10 pr-16 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder-gray-400"
              disabled={isLoading}
              ref={inputRef}
            />
            
            <button 
              type="submit" 
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 rounded-lg px-3 py-1.5 ${
                isLoading || !input.trim() 
                  ? 'bg-indigo-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white transition-colors`}
              disabled={isLoading || !input.trim()}
            >
              发送
            </button>
          </div>
          
          {/* 表情选择器 */}
          {showEmojis && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-0 mb-2 bg-white shadow-lg border border-gray-200 rounded-lg p-2 flex flex-wrap max-w-xs"
            >
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addEmoji(emoji)}
                  className="p-1.5 text-xl hover:bg-indigo-50 rounded"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </form>
      </div>
      
      {/* 显示步骤推进提示 */}
      {showStepAdvanceHint && shouldShowNextStepButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-lg shadow-md"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium">步骤已完成</p>
          </div>
        </motion.div>
      )}
      
      {/* 如果AI响应数不足也使用相同色系 */}
      {showStepAdvanceHint && currentStep.completed && hasReceivedAiResponse && currentStep.aiResponseCount < 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 right-6 bg-gradient-to-r from-indigo-400 to-purple-500 text-white p-3 rounded-lg shadow-md"
        >
          <p className="text-sm font-medium">再多交流一次就可以进入下一步啦</p>
        </motion.div>
      )}
      
      {/* 在最后步骤时显示完成奖励 */}
      {currentStep.index === 4 && messages.length > 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-24 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg shadow-lg"
        >
          <div className="text-center">
            <h3 className="font-bold mb-1">恭喜完成练习!</h3>
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-sm">获得50积分奖励</p>
          </div>
        </motion.div>
      )}
    </div>
  );
} 