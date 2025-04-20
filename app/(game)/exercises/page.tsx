'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// 标签数据
const TAGS = [
  { id: 'work', name: '工作' },
  { id: 'relationships', name: '人际关系' },
  { id: 'personal-growth', name: '个人成长' },
  { id: 'wellbeing', name: '幸福感' },
  { id: 'strengths', name: '品格优势' },
  { id: 'mindfulness', name: '正念' }
];

// 练习数据
const EXERCISES = [
  {
    id: 'strengths-alignment',
    title: '优势对齐',
    description: '将你的性格优势与工作任务相结合，创造更多能量和意义',
    tags: ['work', 'strengths', 'personal-growth'],
    level: 1,
    duration: '15-20分钟',
    image: '/images/strength-cake.png',
    rating: 4.8,
    popularity: 156
  },
  // 添加更多练习...
];

export default function ExercisesPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 处理标签选择
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };
  
  // 过滤练习
  const filteredExercises = EXERCISES.filter(exercise => {
    // 搜索过滤
    const matchesSearch = searchQuery === '' || 
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    // 标签过滤
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => exercise.tags.includes(tag));
      
    return matchesSearch && matchesTags;
  });
  
  return (
    <div className="max-w-6xl mx-auto pt-8 pb-16 px-4 sm:px-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          探索练习
        </h1>
        <p className="text-gray-600 mt-2">
          发现能帮助你培养品格优势的实用练习
        </p>
      </div>
      
      {/* 标签筛选器 */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-3">按类别浏览</h2>
        <div className="flex flex-wrap gap-2">
          {TAGS.map(tag => (
            <button 
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                selectedTags.includes(tag.id)
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* 搜索框 */}
      <div className="relative mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索练习..."
          className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {/* 练习卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map(exercise => (
          <motion.div 
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <Link href={`/exercises/${exercise.id}`}>
              <div className="h-32 sm:h-40 bg-gradient-to-br from-indigo-100 to-purple-100 relative">
                {exercise.image ? (
                  <img 
                    src={exercise.image} 
                    alt={exercise.title} 
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl">✨</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg text-xs font-medium text-indigo-700">
                  {exercise.duration}
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{exercise.title}</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 ml-1">{exercise.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{exercise.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {exercise.tags.map(tagId => {
                    const tag = TAGS.find(t => t.id === tagId);
                    return (
                      <span key={tagId} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {tag?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {/* 空状态 */}
      {filteredExercises.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">未找到匹配的练习</h3>
          <p className="text-gray-600 mb-4">请尝试不同的搜索词或标签</p>
          <button 
            onClick={() => {
              setSelectedTags([]);
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            清除筛选器
          </button>
        </div>
      )}
    </div>
  );
} 