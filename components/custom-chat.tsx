'use client';

import { useState, useRef, useEffect } from 'react';
import { generateUUID } from '@/lib/utils';

// 添加消息类型接口
interface Message {
  id?: string;
  role: string;
  content: string;
  parts?: string[];
  createdAt?: string;
  incomplete?: boolean;
  error?: boolean;
  [key: string]: any;
}

// 创建一个简单的聊天UI
export default function CustomChat({ 
  id, 
  selectedModel 
}: { 
  id: string; 
  selectedModel: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 从数据库加载历史消息 - 优化消息格式处理
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/messages?chatId=${id}`);
        if (response.ok) {
          const data = await response.json();
          
          // 处理各种可能的消息格式
          const formattedMessages = data.map((msg: any) => {
            let content = '';
            
            // 尝试从parts中获取内容
            if (Array.isArray(msg.parts) && msg.parts.length > 0) {
              // 如果parts是对象数组，尝试提取text属性
              if (typeof msg.parts[0] === 'object') {
                content = msg.parts
                  .map((part: any) => part.text || part.content || JSON.stringify(part))
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
          formattedMessages.sort((a: Message, b: Message) => 
            new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // 关闭之前的连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // 创建用户消息
    const userMessage: Message = {
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
      };
      
      // 处理完成和错误
      eventSource.addEventListener('done', () => {
        eventSource.close();
        setIsLoading(false);
        
        // 将不完整标记移除
        setMessages(prev => 
          prev.map(msg => 
            msg.incomplete ? { ...msg, incomplete: false } : msg
          )
        );
        
        // 保存AI响应
        fetch('/api/save-ai-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: id,
            messageId: aiMessageId,
            content: aiContent
          })
        }).then(response => {
          if (response.ok) {
            console.log('AI响应保存成功');
            
            // 可选：重新加载所有消息确保一致性
            // 如果性能是问题，可以省略这一步
            fetch(`/api/messages?chatId=${id}`)
              .then(res => res.json())
              .then(data => {
                // 处理消息格式并更新state
                // ...
              })
              .catch(err => console.error('重新加载消息失败:', err));
          }
        }).catch(err => console.error('保存AI响应失败:', err));
      });
      
      eventSource.onerror = () => {
        eventSource.close();
        setIsLoading(false);
        
        // 将不完整标记移除，但添加错误标记
        setMessages(prev => 
          prev.map(msg => 
            msg.incomplete ? { ...msg, incomplete: false, error: true } : msg
          )
        );
      };
    } catch (error: unknown) {
      console.error('发送消息错误:', error);
      setIsLoading(false);
      
      // 添加错误提示
      setMessages(prev => [
        ...prev,
        { 
          role: 'system', 
          content: `发送失败: ${error instanceof Error ? error.message : '连接错误'}`, 
          error: true 
        }
      ]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col h-[90vh] relative">
      {/* 添加清空聊天按钮 */}
      {messages.length > 0 && !isLoading && (
        <button 
          onClick={() => setMessages([])} 
          className="absolute top-2 left-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded text-sm"
        >
          清空对话
        </button>
      )}
      
      {/* 添加状态提示 */}
      {isLoading && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white py-1 px-3 rounded text-sm">
          正在处理...
        </div>
      )}
      
      <div className="flex-1 overflow-auto mb-4 space-y-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            开始新的对话吧！
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`p-4 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-100 ml-auto max-w-[80%]' : 
              msg.role === 'system' ? 'bg-red-100 text-center mx-auto max-w-[90%]' :
              'bg-gray-100 max-w-[85%]'
            } ${msg.error ? 'border-red-500 border' : ''}`}
          >
            {msg.content}
          </div>
        ))}
        
        {isLoading && (
          <div className="bg-gray-100 p-4 rounded-lg max-w-[85%]">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="发送消息..."
          className="flex-1 p-2 border rounded"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          发送
        </button>
      </form>
    </div>
  );
} 