import { StreamingTextResponse } from 'ai';
import { OpenAIStream } from 'ai';
import { OpenAI } from '@/lib/ai/providers';

// 流式聊天响应函数
export async function aiChatStreaming({
  messages,
  model,
  temperature = 0.7,
  max_tokens = 1000,
  presence_penalty = 0,
  frequency_penalty = 0,
  top_p = 1,
}) {
  try {
    // 使用提供的模型信息构建请求
    const response = await OpenAI.chat.completions.create({
      model: model.id || 'gpt-3.5-turbo',
      messages,
      temperature,
      max_tokens,
      presence_penalty,
      frequency_penalty,
      top_p,
      stream: true,
    });

    // 创建流式响应
    return OpenAIStream(response);
  } catch (error) {
    console.error('AI流式处理错误:', error);
    throw error;
  }
} 