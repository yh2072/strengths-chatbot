import { Suspense } from 'react';
import ConversationHistory from '@/components/conversation-history';

export default function HistoryPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">对话历史</h1>
      
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<div className="text-center">加载历史记录...</div>}>
          <ConversationHistory />
        </Suspense>
      </div>
    </div>
  );
} 