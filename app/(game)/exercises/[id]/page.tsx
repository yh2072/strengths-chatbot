'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';

// 模拟练习数据
const EXERCISE_DATA = {
  'strengths-alignment': {
    title: '优势对齐',
    description: '将你的性格优势与工作任务相结合，创造更多能量和意义',
    longDescription: '这个练习基于积极心理学研究，帮助你将个人优势有意识地应用到日常工作中。研究表明，当我们在工作中使用自己的核心优势时，会提升工作满意度、工作表现和幸福感。',
    benefits: [
      '提升工作参与度',
      '增强工作意义感',
      '提高工作效率',
      '降低职业倦怠风险',
      '培养工作使命感'
    ],
    steps: [
      '列出你在工作中最常执行的5项任务',
      '确认你的5大性格优势',
      '为每项任务找到应用优势的方式',
      '在日常工作中实践这些新方法',
      '观察能量和满足感的变化'
    ],
    duration: '15-20分钟',
    level: 1,
    completions: 0,
    characters: ['爱因斯坦', '哆啦A梦', '邓布利多教授']
  }
};

export default function ExercisePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const exercise = EXERCISE_DATA[id];
  
  if (!exercise) {
    return <div className="text-center py-10 text-gray-600">找不到该练习</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto pt-8 pb-16 px-4">
      {/* 返回按钮 */}
      <Link 
        href="/exercises" 
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        返回练习列表
      </Link>
      
      {/* 练习标题和介绍 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{exercise.title}</h1>
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
            难度: Lv.{exercise.level}
          </div>
          <div className="text-gray-600 text-sm">
            预计时间: {exercise.duration}
          </div>
          <div className="text-gray-600 text-sm">
            完成次数: {exercise.completions}
          </div>
        </div>
        <p className="text-lg text-gray-700 mb-6">{exercise.description}</p>
        <p className="text-gray-600">{exercise.longDescription}</p>
      </motion.div>
      
      {/* 练习内容卡片 */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 border border-indigo-100"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            练习收益
          </h2>
          <ul className="space-y-3">
            {exercise.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 border border-indigo-100"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </span>
            练习步骤
          </h2>
          <ol className="space-y-3">
            {exercise.steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
      
      {/* 开始练习按钮 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        <button
          onClick={() => router.push(`/exercises/${id}/select`)}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          开始练习
        </button>
        <p className="text-sm text-gray-500 mt-3">
          点击开始，选择你喜欢的AI角色引导
        </p>
      </motion.div>
    </div>
  );
} 