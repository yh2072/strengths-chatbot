'use client';

import { useEffect, useState } from 'react';

// 定义事件类型接口
interface DebugEvent {
  type?: string;
  id?: string;
  content?: string;
  raw?: string;
  [key: string]: any;
}

export default function DebugChat({ id }: { id: string }) {
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // 测试直接连接到chat API
    const eventSource = new EventSource(`/api/chat?id=${id}`);
    setIsConnected(true);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setEvents(prev => [...prev, data]);
        console.log('接收到SSE事件:', data);
      } catch (e) {
        console.log('接收到非JSON格式事件:', event.data);
        setEvents(prev => [...prev, { raw: event.data }]);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE连接错误:', error);
      setIsConnected(false);
      eventSource.close();
    };
    
    return () => {
      console.log('关闭SSE连接');
      eventSource.close();
      setIsConnected(false);
    };
  }, [id]);
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg opacity-90 max-w-sm max-h-60 overflow-auto">
      <h3>调试信息 ({isConnected ? '已连接' : '未连接'})</h3>
      <div>
        {events.map((event, i) => (
          <div key={i} className="text-xs mb-1 opacity-75">
            {JSON.stringify(event)}
          </div>
        ))}
      </div>
    </div>
  );
} 