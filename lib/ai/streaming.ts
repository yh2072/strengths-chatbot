// // import { streamText } from '@ai-sdk/react';
// // import { OpenAIStream, StreamingTextResponse } from 'openai-edge';
// import { StreamingTextResponse } from 'ai';
// import { streamAdapter } from '@ai-sdk/react';
// import { myProvider } from '@/lib/ai/providers';

// // 流式聊天响应函数
// export async function aiChatStreaming({
//   messages,
//   model,
//   temperature = 0.7,
//   max_tokens = 1000,
//   presence_penalty = 0,
//   frequency_penalty = 0,
//   top_p = 1,
// }: {
//   messages: any[];
//   model: { id?: string };
//   temperature?: number;
//   max_tokens?: number;
//   presence_penalty?: number;
//   frequency_penalty?: number;
//   top_p?: number;
// }) {
//   try {
//     // 使用myProvider
//     const response = await myProvider.chat.completions.create({
//       model: model.id || 'chat-model',
//       messages,
//       temperature,
//       max_tokens,
//       presence_penalty,
//       frequency_penalty,
//       top_p,
//       stream: true,
//     });

//     // 使用StreamingTextResponse直接返回
//     return new StreamingTextResponse(response);
//   } catch (error) {
//     console.error('AI流式处理错误:', error);
//     throw error;
//   }
// } 