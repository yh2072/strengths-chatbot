'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// 添加调试日志
console.log('加载游戏页面');

// 练习分类
const CATEGORIES = [
  { id: 'popular', name: '热门练习' },
  { id: 'positive-emotions', name: '积极情绪' },
  { id: 'relationships', name: '人际关系' },
  { id: 'meaning', name: '意义感' },
  { id: 'accomplishment', name: '成就感' },
  { id: 'engagement', name: '全情投入' }
];

// 模拟练习数据
const EXERCISES = [
  {
    id: 'strengths-alignment',
    title: '优势对齐',
    description: '将你的性格优势与工作任务相结合',
    tags: ['自我认知', '成就感', '意义感'],
    level: 1,
    duration: '15-20分钟',
    completionCount: 0,
    category: 'popular'
  },
  {
    id: 'gratitude-letter',
    title: '感恩信',
    description: '写一封感谢信给曾经帮助过你的人',
    tags: ['积极情绪', '人际关系', '意义感'],
    level: 1,
    duration: '20-30分钟',
    completionCount: 0,
    category: 'positive-emotions'
  },
  {
    id: 'three-good-things',
    title: '三件好事',
    description: '每天记录三件好事和它们的原因',
    tags: ['积极情绪', '专注力', '韧性'],
    level: 1,
    duration: '5-10分钟',
    completionCount: 0,
    category: 'positive-emotions'
  },
  {
    id: 'active-listening',
    title: '积极倾听',
    description: '练习深入倾听他人的感受和需求',
    tags: ['人际关系', '沟通', '专注力'],
    level: 2,
    duration: '15-20分钟',
    completionCount: 0,
    category: 'relationships'
  },
  {
    id: 'goal-visualization',
    title: '目标可视化',
    description: '想象并描述你成功实现目标的画面',
    tags: ['成就感', '专注力', '创造力'],
    level: 2,
    duration: '10-15分钟',
    completionCount: 0,
    category: 'accomplishment'
  },
  {
    id: 'flow-activities',
    title: '心流体验',
    description: '识别并规律参与让你沉浸其中的活动',
    tags: ['专注力', '创造力', '全情投入'],
    level: 3,
    duration: '15-45分钟',
    completionCount: 0,
    category: 'engagement'
  }
];

export const dynamic = 'force-dynamic';

export default function ExercisesPage() {
  const [activeCategory, setActiveCategory] = useState('popular');
  
  const filteredExercises = EXERCISES.filter(
    exercise => exercise.category === activeCategory
  );
  
  return (
    <div className="max-w-6xl mx-auto pt-8 pb-16 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-4">夸夸星球 - 成长乐园</h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          通过有趣的互动练习发现自我，培养积极心态，提升幸福感。每完成一项练习都会获得积分奖励！
        </p>
      </motion.div>
      
      {/* 分类选项卡 */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeCategory === category.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>
      
      {/* 练习卡片网格 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link 
              href={`/exercises/${exercise.id}`}
              className="block h-full bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
            >
              <div className="h-36 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center p-6">
                <h3 className="text-2xl font-bold text-white text-center">{exercise.title}</h3>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
                    难度: Lv.{exercise.level}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {exercise.duration}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{exercise.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {exercise.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {exercise.completionCount > 0 
                      ? `完成${exercise.completionCount}次` 
                      : '未完成'}
                  </div>
                  <div className="bg-indigo-50 text-indigo-600 rounded-lg px-3 py-1 text-xs font-medium">
                    开始练习
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 