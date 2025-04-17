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
    <div className="flex flex-col h-screen bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50">
      {/* 顶部导航 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 p-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-sm mr-3">
              <span className="text-white text-sm font-bold">夸</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">夸夸星球</h1>
          </div>
          <div className="text-sm text-gray-600">
            使用模型: <span className="font-medium text-indigo-600">{selectedModel || 'Claude 3'}</span>
          </div>
        </div>
      </div>
      
      {/* 消息区域 */}
      <div className="flex-1 overflow-auto p-6 bg-transparent">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-indigo-100/50 p-8 fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">开始一段对话</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                可以询问任何问题，AI助手将为您提供帮助。
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`relative max-w-xl rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : msg.role === 'system' 
                      ? 'bg-red-100 text-red-700 mx-auto text-center' 
                      : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-indigo-100/50 shadow-sm'
                  } ${msg.error ? 'border-red-500 border-2' : ''}`}
                >
                  {/* 角色图标 */}
                  {msg.role !== 'system' && (
                    <div 
                      className={`absolute top-0 ${msg.role === 'user' ? '-right-2' : '-left-2'} -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center ${
                        msg.role === 'user' ? 'bg-indigo-700' : 'bg-white border border-indigo-100'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          
          {/* 加载指示器 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/90 backdrop-blur-sm border border-indigo-100/50 rounded-2xl px-4 py-3 max-w-xl shadow-sm">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="border-t border-indigo-100 bg-white/80 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            {/* 表情选择器 */}
            {showEmojis && (
              <div className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-indigo-100 p-2 grid grid-cols-5 gap-1">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="text-xl hover:bg-indigo-50 rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex rounded-xl border border-indigo-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 bg-white shadow-sm">
              {/* 表情按钮 */}
              <button
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                className="px-3 text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              {/* 输入框 */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入问题..."
                className="flex-1 py-3 px-2 outline-none"
                disabled={isLoading}
              />
              
              {/* 发送按钮 */}
              <button 
                type="submit" 
                className={`px-4 flex items-center justify-center ${
                  isLoading || !input.trim() ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white transition-colors`}
                disabled={isLoading || !input.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* 功能提示 */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              提示：使用 Enter 发送，按表情图标可添加表情
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 