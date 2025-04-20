'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 定义对话类型接口
interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages?: Array<any>;
  [key: string]: any;
}

export default function ConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/chat-history?limit=20');
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error('加载对话历史失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">历史对话</h3>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-[70vh] overflow-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">加载中...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">暂无历史对话</div>
        ) : (
          conversations.map((convo: Conversation) => (
            <Link 
              href={`/chat/${convo.id}`}
              key={convo.id}
              className="block p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {convo.title || '未命名对话'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {convo.messages?.length || 0} 条消息
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(convo.createdAt)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => router.push('/')}
          className="w-full py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md"
        >
          开始新对话
        </button>
      </div>
    </div>
  );
} 