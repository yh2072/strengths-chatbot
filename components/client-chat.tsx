'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatUI } from '@/components/chat-ui/index';
import { generateUUID } from '@/lib/utils';

export default function ClientChat({ id, selectedModel }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // EventSource对象的引用，用于关闭连接
  const eventSourceRef = useRef(null);
  
  // 加载历史消息
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/messages?chatId=${id}`);
        if (response.ok) {
          const data = await response.json();
          // 转换消息格式
          const uiMessages = data.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content || (Array.isArray(msg.parts) ? msg.parts.join('\n') : msg.parts),
            parts: Array.isArray(msg.parts) ? msg.parts : [msg.parts || msg.content],
            createdAt: msg.createdAt
          }));
          
          // 排序
          uiMessages.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          setMessages(uiMessages);
        }
      } catch (err) {
        console.error('加载历史消息失败:', err);
        setError('加载历史消息失败');
      }
    };
    
    loadMessages();
  }, [id]);
  
  // 处理输入变化
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  // 发送消息
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // 关闭之前的连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // 创建用户消息
    const userMessage = {
      id: generateUUID(),
      role: 'user',
      content: input,
      parts: [input],
      createdAt: new Date().toISOString()
    };
    
    // 更新UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      // 保存用户消息到数据库
      const saveResponse = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: id,
          message: userMessage
        })
      });
      
      if (!saveResponse.ok) {
        throw new Error('保存消息失败');
      }
      
      // 创建AI响应的消息ID和空内容
      const aiMessageId = generateUUID();
      let aiContent = '';
      
      // 创建空的AI消息添加到UI
      const aiMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: '...',
        parts: ['...'],
        createdAt: new Date().toISOString()
      };
      
      // 添加空的AI消息到UI
      setMessages(prev => [...prev, aiMessage]);
      
      // 创建EventSource连接接收流式响应
      const eventSource = new EventSource(`/api/direct-chat?id=${id}`);
      eventSourceRef.current = eventSource;
      
      // 接收消息
      eventSource.onmessage = (event) => {
        const chunk = event.data;
        aiContent += chunk;
        
        // 更新UI中AI消息的内容
        setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            const lastIndex = newMessages.length - 1;
            
            if (lastIndex >= 0 && newMessages[lastIndex].id === aiMessageId) {
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: aiContent,
                parts: [aiContent]
              };
            }
            
            return newMessages;
        });
      };
      
      // 处理结束事件
      eventSource.addEventListener('end', async () => {
        eventSource.close();
        
        // 保存AI响应到数据库
        const aiMessageComplete = {
          id: aiMessageId,
          role: 'assistant',
          content: aiContent,
          parts: [aiContent],
          createdAt: new Date().toISOString()
        };
        
        try {
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: id,
              message: aiMessageComplete
            })
          });
        } catch (err) {
          console.error('保存AI响应失败:', err);
        }
        
        setIsLoading(false);
      });
      
      // 处理错误
      eventSource.onerror = () => {
        eventSource.close();
        setIsLoading(false);
        setError('连接中断，请重试');
      };
    } catch (err) {
      console.error('发送消息错误:', err);
      setIsLoading(false);
      setError('发送消息失败');
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50">
      <ChatUI
        key={id}
        id={id}
        initialMessages={messages}
        selectedChatModel={selectedModel}
        selectedVisibilityType="private"
        isReadonly={false}
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
} 