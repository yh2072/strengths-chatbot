import React from 'react';

export interface ChatUIProps {
  key?: string;
  id: string;
  initialMessages: any[];
  selectedChatModel: string;
  selectedVisibilityType: string;
  isReadonly: boolean;
  messages: any[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ChatUI({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading
}: ChatUIProps) {
  // 基本聊天UI的实现
  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div 
            key={message.id || index}
            className={`my-2 p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-indigo-100 ml-auto mr-2 max-w-[80%]' 
                : 'bg-white mr-auto ml-2 max-w-[80%] border border-gray-200'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="my-2 p-3 bg-gray-100 rounded-lg mr-auto ml-2 max-w-[80%]">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="输入消息..."
            className="flex-1 border border-gray-300 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading || isReadonly}
          />
          <button
            type="submit"
            className={`bg-indigo-600 text-white py-2 px-4 rounded-r-lg ${
              isLoading || !input.trim() || isReadonly
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-indigo-700'
            }`}
            disabled={isLoading || !input.trim() || isReadonly}
          >
            发送
          </button>
        </div>
      </form>
    </div>
  );
} 