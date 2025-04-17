'use client';

import { useState, useRef, useEffect } from 'react';
import { generateUUID } from '@/lib/utils';
import Link from 'next/link';

export default function EnhancedChat({ id, selectedModel }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);
  const inputRef = useRef(null);

  // 常用表情符号
  const emojis = ['😊', '👍', '🤔', '❤️', '🔥', '👏', '😂', '🙏', '🎉', '🚀'];

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 自动聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading]);

  // 从数据库加载历史消息
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/messages?chatId=${id}`);
        if (response.ok) {
          const data = await response.json();
          
          // 处理各种可能的消息格式
          const formattedMessages = data.map(msg => {
            let content = '';
            
            // 尝试从parts中获取内容
            if (Array.isArray(msg.parts) && msg.parts.length > 0) {
              // 如果parts是对象数组，尝试提取text属性
              if (typeof msg.parts[0] === 'object') {
                content = msg.parts
                  .map(part => part.text || part.content || JSON.stringify(part))
                  .join('\n');
              } else {
                // 如果parts是字符串数组，直接连接
                content = msg.parts.join('\n');
              }
            } else if (msg.parts && typeof msg.parts === 'string') {
              content = msg.parts;
            } else if (msg.content) {
              content = msg.content;
            }
            
            return {
              role: msg.role,
              content: content,
              id: msg.id,
              createdAt: msg.createdAt
            };
          });
          
          // 按时间排序
          formattedMessages.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          setMessages(formattedMessages);
        }
      } catch (err) {
        console.error('加载消息失败:', err);
      }
    };
    
    loadMessages();
  }, [id]);

  // 处理提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // 关闭之前的连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // 关闭表情选择器
    setShowEmojis(false);
    
    // 创建用户消息
    const userMessage = {
      id: generateUUID(),
      role: 'user',
      content: input,
      parts: [input]
    };
    
    // 添加到UI
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsLoading(true);
    
    try {
      // 保存用户消息
      const saveResponse = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: id,
          message: userMessage
        })
      });
      
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(`保存消息失败: ${errorData.error || saveResponse.statusText}`);
      }
      
      // 开始SSE连接
      const aiMessageId = generateUUID();
      let aiContent = '';
      
      const eventSource = new EventSource(`/api/direct-chat?id=${id}`);
      eventSourceRef.current = eventSource;
      
      eventSource.onmessage = (event) => {
        const chunk = event.data;
        aiContent += chunk;
        
        // 更新UI，保持显示最新的内容
        setMessages(prev => {
          const newMessages = [...prev];
          const assistantMsgIndex = newMessages.findIndex(m => m.role === 'assistant' && m.incomplete);
          
          if (assistantMsgIndex >= 0) {
            // 更新现有的不完整消息
            newMessages[assistantMsgIndex].content = aiContent;
          } else {
            // 添加新的AI消息
            newMessages.push({ 
              role: 'assistant', 
              content: aiContent,
              incomplete: true 
            });
          }
          
          return newMessages;
        });
        
        // 滚动到最新消息
        scrollToBottom();
      };
      
      eventSource.onerror = () => {
        eventSource.close();
        
        // 将不完整标记移除
        setMessages(prev => 
          prev.map(msg => 
            msg.incomplete ? { ...msg, incomplete: false } : msg
          )
        );
        
        // 保存AI响应
        const aiMessage = {
          id: aiMessageId,
          role: 'assistant',
          content: aiContent,
          parts: [aiContent],
          chatId: id
        };
        
        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: id,
            message: aiMessage
          })
        }).catch(err => {
          console.error('保存AI回复失败:', err);
        });
        
        setIsLoading(false);
      };
    } catch (error) {
      console.error('发送消息失败:', error);
      setIsLoading(false);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: '发送消息失败，请重试', 
        error: true 
      }]);
    }
  };
  
  // 添加表情
  const addEmoji = (emoji) => {
    setInput(prev => prev + emoji);
    setShowEmojis(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen bg-transparent relative">
      {/* 顶部导航，已经被移到layout.tsx，这里可以保留一些具体到聊天的信息 */}
      <div className="bg-white/70 backdrop-blur-sm py-3 px-4 border-b border-indigo-100/50 shadow-sm z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
              {selectedModel || 'Claude 3'}
            </span>
            <span className="text-xs text-gray-500">|</span>
            <span className="text-xs text-gray-600">
              对话ID: <span className="font-mono text-indigo-600">{id?.substring(0, 8) || 'New'}</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>刷新</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* 消息区域 - 加入平滑滚动和背景图案 */}
      <div className="flex-1 overflow-auto p-6 bg-transparent">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-indigo-100/50 p-8 transition-all duration-300 hover:shadow-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">开始一段新对话</h3>
              <p className="text-gray-600 mb-6">与AI助手聊天，探索自我成长的旅程</p>
              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                <div className="text-left p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h4 className="font-medium text-sm text-indigo-700 mb-1">🔍 性格探索</h4>
                  <p className="text-xs text-gray-600">「请分析我的优势和潜力」</p>
                </div>
                <div className="text-left p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="font-medium text-sm text-purple-700 mb-1">🌱 成长规划</h4>
                  <p className="text-xs text-gray-600">「如何培养积极思维？」</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={msg.id || index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'} animate-fadeIn`}
              >
                <div 
                  className={`relative max-w-xl rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-sm' 
                      : msg.role === 'system' 
                      ? 'bg-red-100 text-red-700 mx-auto text-center' 
                      : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-indigo-100/50 shadow-sm'
                  } ${msg.error ? 'border-red-500 border-2' : ''} transition-all duration-200 hover:shadow-md`}
                >
                  {/* 角色图标 - 更时尚的设计 */}
                  {msg.role !== 'system' && (
                    <div 
                      className={`absolute top-0 ${msg.role === 'user' ? '-right-2' : '-left-2'} -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-700 to-purple-800 ring-2 ring-white' 
                        : 'bg-white border border-indigo-100 shadow-sm'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                  )}
                  
                  {/* 消息内容 - 支持换行 */}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))
          )}
          
          {/* 加载指示器 - 更漂亮的动画 */}
          {isLoading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-white/90 backdrop-blur-sm border border-indigo-100/50 rounded-2xl px-4 py-3 max-w-xl shadow-sm">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 - 更现代的设计 */}
      <div className="border-t border-indigo-100 bg-white/80 backdrop-blur-sm p-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            {/* 表情选择器 - 更好的视觉效果 */}
            {showEmojis && (
              <div className="absolute bottom-full mb-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-indigo-100 p-2 grid grid-cols-5 gap-1 transition-all animate-fadeIn">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="text-xl hover:bg-indigo-50 rounded-lg p-1 transition-all duration-200 hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex rounded-xl border border-indigo-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
              {/* 表情按钮 - 添加动画效果 */}
              <button
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                className="px-3 text-gray-500 hover:text-indigo-600 transition-colors duration-200 hover:bg-indigo-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              {/* 输入框 - 改进的样式 */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入问题..."
                className="flex-1 py-3 px-2 outline-none text-gray-700"
                disabled={isLoading}
              />
              
              {/* 发送按钮 - 添加动画效果 */}
              <button 
                type="submit" 
                className={`px-4 flex items-center justify-center ${
                  isLoading || !input.trim() 
                  ? 'bg-indigo-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-105'
                } text-white transition-colors`}
                disabled={isLoading || !input.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* 功能提示 - 更精致的设计 */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              <span className="px-2 py-1 rounded-full bg-gray-100 inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                使用 Enter 发送，按表情图标添加表情
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 