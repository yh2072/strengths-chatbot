'use client';

import { useState, useRef, useEffect } from 'react';

export default function TestChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: '您好，我是AI助手。请问有什么可以帮您?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 添加用户消息
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 直接调用API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'test-' + Date.now(),
          messages: [userMessage],
          selectedChatModel: 'Qwen/QwQ-32B'
        })
      });

      if (!response.ok) throw new Error('API请求失败');

      // 使用ReadableStream处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 处理流片段
        const chunk = decoder.decode(value, { stream: true });
        console.log('收到数据:', chunk);
        
        // 提取文本内容
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.type === 'textMessagePartContent') {
                aiResponse += data.text;
                // 更新UI
                setMessages(prev => [
                  ...prev.slice(0, -1), 
                  ...(prev.length > 0 && prev[prev.length - 1].role === 'assistant' 
                    ? [] 
                    : [{ role: 'assistant', content: aiResponse }])
                ]);
              }
            } catch (e) {
              console.error('解析错误:', e);
            }
          }
        }
      }

      // 确保最终消息被添加
      if (aiResponse) {
        setMessages(prev => {
          if (prev.length > 0 && prev[prev.length - 1].role === 'assistant') {
            return [...prev.slice(0, -1), { role: 'assistant', content: aiResponse }];
          } else {
            return [...prev, { role: 'assistant', content: aiResponse }];
          }
        });
      }
    } catch (error) {
      console.error('错误:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，发生了错误。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col h-screen">
      <div className="flex-1 overflow-auto mb-4 space-y-4">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
            } max-w-[80%] whitespace-pre-wrap`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
            <div className="animate-pulse">思考中...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
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