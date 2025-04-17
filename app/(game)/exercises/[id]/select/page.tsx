'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// 角色数据
const CHARACTERS = [
  {
    id: 'einstein',
    name: '爱因斯坦',
    avatar: '/characters/einstein.png',
    description: '天才物理学家，充满智慧和幽默感。他会用物理学比喻和思想实验来引导你思考人生问题。',
    style: '智慧型 | 幽默型 | 学术型',
    specialty: '擅长通过类比和思考实验帮你解决困难问题'
  },
  {
    id: 'doraemon',
    name: '哆啦A梦',
    avatar: '/characters/doraemon.png',
    description: '来自22世纪的机器猫，带着神奇道具来帮助你。活泼可爱的风格，特别适合寻找创新解决方案。',
    style: '活泼型 | 创新型 | 鼓励型',
    specialty: '擅长用简单易懂的方式解释复杂概念'
  },
  {
    id: 'dumbledore',
    name: '邓布利多教授',
    avatar: '/characters/dumbledore.png',
    description: '霍格沃茨的智者，深谙人性，充满魔法般的智慧。他善于发现每个人内在的"魔法"并引导你发挥潜能。',
    style: '睿智型 | 鼓舞型 | 神秘型',
    specialty: '擅长在困境中带来希望和新视角'
  }
];

export default function CharacterSelectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  
  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
  };
  
  const handleStartChat = () => {
    if (selectedCharacter) {
      router.push(`/exercises/${id}/chat?character=${selectedCharacter.id}`);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto pt-8 pb-16 px-4">
      {/* 返回按钮 */}
      <Link 
        href={`/exercises/${id}`} 
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        返回练习介绍
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-3">选择你的引导角色</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          不同的角色有不同的风格和专长。选择一个你喜欢的角色，他们将以独特的方式引导你完成练习。
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {CHARACTERS.map((character, index) => (
          <motion.div
            key={character.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`bg-white rounded-xl overflow-hidden shadow-md border transition-all duration-200 hover:shadow-lg ${
              selectedCharacter?.id === character.id 
                ? 'border-indigo-400 ring-2 ring-indigo-400 transform scale-[1.02]' 
                : 'border-gray-200 hover:border-indigo-200'
            }`}
            onClick={() => handleSelectCharacter(character)}
          >
            <div className="h-48 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden">
                <img 
                  src={character.avatar || `https://ui-avatars.com/api/?name=${character.name}&background=random`} 
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{character.name}</h3>
              <div className="text-xs text-gray-500 mb-3">{character.style}</div>
              <p className="text-gray-600 text-sm mb-4">{character.description}</p>
              <div className="bg-indigo-50 rounded-lg p-3">
                <div className="text-xs text-indigo-700 font-medium mb-1">特长:</div>
                <div className="text-sm text-gray-700">{character.specialty}</div>
              </div>
            </div>
            
            <div className="px-5 pb-5 pt-2">
              <button
                className={`w-full py-2 rounded-lg transition-colors ${
                  selectedCharacter?.id === character.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleSelectCharacter(character)}
              >
                {selectedCharacter?.id === character.id ? '已选择' : '选择'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center"
      >
        <button
          onClick={handleStartChat}
          disabled={!selectedCharacter}
          className={`px-8 py-3 font-medium rounded-lg shadow-md transition-all duration-200 ${
            selectedCharacter
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          开始对话
        </button>
        {!selectedCharacter && (
          <p className="text-sm text-gray-500 mt-2">请先选择一个角色</p>
        )}
      </motion.div>
    </div>
  );
} 