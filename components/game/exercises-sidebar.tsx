'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// 练习标签类型
const TAGS = [
  '积极情绪', '人际关系', '意义感', '成就感', '专注力', 
  '创造力', '韧性', '自我认知', '沟通', '领导力'
];

// 模拟的练习数据
const EXERCISES = [
  {
    id: 'strengths-alignment',
    title: '优势对齐',
    description: '将你的性格优势与工作任务相结合',
    tags: ['自我认知', '成就感', '意义感'],
    level: 1,
    duration: '15-20分钟',
    completionCount: 0,
  },
  // ... 其他69个练习
];

export function GameSidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 筛选练习
  const filteredExercises = EXERCISES.filter(exercise => {
    if (searchQuery && !exercise.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedTags.length > 0 && !selectedTags.some(tag => exercise.tags.includes(tag))) {
      return false;
    }
    return true;
  });
  
  // 切换标签选择
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white border-r border-indigo-100">
      {/* 顶部搜索 */}
      <div className="p-4 border-b border-indigo-100">
        <div className="text-lg font-bold text-gray-800 mb-4">成长乐园</div>
        <div className="relative">
          <input
            type="text"
            placeholder="搜索练习..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      {/* 标签筛选 */}
      <div className="p-4 border-b border-indigo-100">
        <div className="text-sm font-medium text-gray-700 mb-2">按标签筛选</div>
        <div className="flex flex-wrap gap-2">
          {TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                "text-xs rounded-full px-2.5 py-1 transition-colors",
                selectedTags.includes(tag)
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      
      {/* 练习列表 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-1">练习列表</div>
          
          {filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <div>没有找到符合条件的练习</div>
            </div>
          ) : (
            filteredExercises.map(exercise => (
              <Link
                key={exercise.id}
                href={`/exercises/${exercise.id}`}
                className={cn(
                  "block p-3 rounded-lg border hover:shadow-md transition-all",
                  pathname.includes(`/exercises/${exercise.id}`)
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-200"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">{exercise.title}</div>
                  <div className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5">
                    Lv.{exercise.level}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {exercise.duration} · {exercise.completionCount > 0 ? `完成${exercise.completionCount}次` : '未完成'}
                </div>
                <div className="flex flex-wrap gap-1">
                  {exercise.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      
      {/* 历史记录入口 */}
      <div className="p-4 border-t border-indigo-100">
        <Link
          href="/history"
          className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>历史记录</span>
        </Link>
      </div>
    </div>
  );
} 