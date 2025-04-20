import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { OpenAI } from 'openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// 定义API错误类型接口
interface ApiError {
  message: string;
  response?: {
    status: number;
    headers: Record<string, string>;
    data: any;
  };
  request?: any;
  [key: string]: any;
}

// 定义消息内容类型
interface MessageContent {
  type?: string;
  text?: string;
  content?: string | any;
  [key: string]: any;
}

// 定义API请求类型
interface ApiRequest {
  messages?: Array<{role: string, content: string | MessageContent[]}>; 
  system?: string;
  prompt?: string;
  [key: string]: any;
}

// 修复方法1: 定义更详细的类型来包含tools属性
interface SiliconFlowRequestData {
  n: number;
  response_format: { type: string };
  stop: null;
  tools?: any[]; // 添加tools属性
  [key: string]: any; // 允许其他属性
}

// 配置SiliconFlow API适配器
const siliconFlowClient = new OpenAI({
  baseURL: process.env.SILICONFLOW_API_BASE_URL || 'https://api.siliconflow.cn/v1',
  apiKey: process.env.SILICONFLOW_API_KEY || '',
});

// 修正SiliconFlow API调用函数
const siliconFlowApiCall = async (endpoint: string, data: Record<string, any>) => {
  // 确保完全匹配示例格式，包括所有必需的参数
  const completeData = {
    ...data,
    n: 1,
    response_format: { type: "text" },
    stop: null
  } as any; // 使用any类型断言
  
  // 如果未指定tools且API需要，添加空tools数组
  if (!completeData.tools) {
    completeData.tools = [];
  }
  
  console.log('发送到SiliconFlow的完整请求:', JSON.stringify(completeData, null, 2));
  
  const response = await fetch(`${process.env.SILICONFLOW_API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(completeData)
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => '无错误详情');
    throw new Error(`API返回错误: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response;
};

// SiliconFlow适配器 - 使用原生fetch实现
const createSiliconFlowAdapter = (model: string) => {
  // 使用文档中支持的模型
  const actualModel = "Qwen/QwQ-32B"; // 默认模型
  
  return {
    doStream: async ({ messages, system, prompt, ...options }: ApiRequest) => {
      try {
        console.log('发送到SiliconFlow API的消息:', JSON.stringify(messages, null, 2));
        console.log('使用模型:', model);
        
        // 构建简单的消息数组 - 只包含标准角色
        const formattedMessages: Array<{role: string, content: string}> = [];
        
        // 添加系统消息
        if (system) {
          formattedMessages.push({
            role: 'system',
            content: system
          });
        }
        
        // 简化消息处理逻辑
        if (messages && Array.isArray(messages)) {
          // 扁平化处理所有消息
          messages.forEach(msg => {
            let role = msg.role;
            let content = '';
            
            // 标准化角色
            if (role === 'system' || role === 'user' || role === 'assistant') {
              // 保持原样
            } else {
              // 默认为用户
              role = 'user';
            }
            
            // 提取内容
            if (typeof msg.content === 'string') {
              content = msg.content;
            } else if (Array.isArray(msg.content)) {
              // 展平数组内容
              const contentArray = msg.content as MessageContent[];
              content = contentArray.map((item: MessageContent) => {
                if (typeof item === 'string') return item;
                if (item && typeof item === 'object') {
                  if (item.type === 'text' && item.text) return item.text;
                  if (item.content) return String(item.content);
                }
                return '';
              }).filter((text: string) => text).join('\n');
            }
            
            // 确保内容不为空
            if (content.trim()) {
              formattedMessages.push({ role, content });
            }
          });
        }
        
        // 添加提示消息
        if (prompt && formattedMessages.length === 0) {
          formattedMessages.push({
            role: 'user',
            content: prompt
          });
        }
        
        // 确保至少有一条用户消息
        if (formattedMessages.length === 0) {
          formattedMessages.push({
            role: 'user',
            content: '请帮我回答问题'
          });
        }
        
        console.log('简化后的消息格式:', JSON.stringify(formattedMessages, null, 2));
        
        const requestBody = {
          model: actualModel,
          messages: formattedMessages,
          stream: true,
          max_tokens: 512,
          stop: null,
          temperature: 0.7,
          top_p: 0.7,
          top_k: 50,
          frequency_penalty: 0.5,
          n: 1,
          response_format: { type: "text" },
          tools: []
        };
        
        // 请求发送前记录
        console.log('================== 发送聊天请求 ==================');
        console.log('请求体:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(`${process.env.SILICONFLOW_API_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        // 检查响应
        const checkResponseValidity = (response: Response) => {
          console.log('================== 检查响应有效性 ==================');
          
          // 检查响应头
          const contentType = response.headers.get('content-type');
          console.log('Content-Type:', contentType);
          
          if (!contentType || !contentType.includes('text/event-stream')) {
            console.warn('警告: 响应不是event-stream格式');
          }
          
          return response;
        };
        
        // 响应检查
        if (!response.body) {
          throw new Error('响应体为空');
        }
        
        checkResponseValidity(response);
        
        // 响应接收后立即记录
        const responseStatus = response.status;
        const responseHeaders = Object.fromEntries(response.headers.entries());
        console.log('================== 收到初始响应 ==================');
        console.log('状态码:', responseStatus);
        console.log('响应头:', responseHeaders);
        
        // 创建一个ReadableStream来处理响应
        const stream = new ReadableStream({
          async start(controller) {
            // 使用可选链和短路评估
            const reader = response.body?.getReader();
            if (!reader) {
              controller.error(new Error('无法获取响应流'));
              return;
            }
            
            const decoder = new TextDecoder();
            let buffer = '';
            
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  // 确保在流结束时发送剩余的所有内容
                  if (buffer.length > 0) {
                    console.log('[流结束] 发送剩余内容:', buffer);
                    controller.enqueue(new TextEncoder().encode(buffer));
                    buffer = '';
                  }
                  break;
                }
                
                // 解码数据
                const chunk = decoder.decode(value, { stream: true });
                console.log('================== 收到数据块 ==================');
                console.log('原始数据:', chunk);
                
                // 处理SSE格式的数据
                chunk.split('\n\n').forEach((line, index) => {
                  console.log(`[块 ${index}] 数据行:`, line);
                  
                  if (line.startsWith('data: ')) {
                    if (line === 'data: [DONE]') {
                      console.log('[SSE] 收到结束标记');
                      return;
                    }
                    
                    try {
                      const rawData = line.substring(6);
                      console.log('[SSE] 提取的JSON:', rawData);
                      
                      const data = JSON.parse(rawData);
                      console.log('[SSE] 解析后数据:', JSON.stringify(data, null, 2));
                      
                      // 检查choices和delta字段
                      if (!data.choices || !data.choices[0]) {
                        console.log('[SSE] 缺少choices字段');
                        return;
                      }
                      
                      if (!data.choices[0].delta) {
                        console.log('[SSE] 缺少delta字段');
                        return;
                      }
                      
                      const content = data.choices[0].delta.content;
                      if (content) {
                        console.log('[SSE] 提取的内容:', content);
                        buffer += content;
                        
                        // 每积累一定量的文本就输出一次
                        if (buffer.length > 10 || buffer.includes('\n')) {
                          console.log('[流输出] 发送缓冲区内容:', buffer);
                          controller.enqueue(new TextEncoder().encode(buffer));
                          buffer = '';
                        }
                      } else {
                        console.log('[SSE] 此消息无内容');
                      }
                    } catch (e) {
                      const parseError = e as Error;
                      console.error('[SSE] 解析错误:', parseError.message);
                      console.error('问题数据:', line.substring(6));
                    }
                  } else {
                    console.log('[SSE] 忽略非data行');
                  }
                });
              }
              
              // 确保发送最后的缓冲区内容
              if (buffer.length > 0) {
                controller.enqueue(new TextEncoder().encode(buffer));
              }
              
              controller.close();
            } catch (error) {
              const err = error as ApiError;
              console.error('流处理错误:', err.message);
              
              // 尝试发送错误消息给客户端
              try {
                controller.enqueue(new TextEncoder().encode('处理流时出错，请稍后再试。'));
              } catch (e) {
                // 忽略控制器已关闭的错误
              }
              
              controller.close();
            }
          }
        });
        
        return {
          stream,
          rawCall: { rawPrompt: null, rawSettings: {} },
        };
      } catch (error) {
        const err = error as ApiError;
        console.error('SiliconFlow API错误:', err.message);
        
        // 详细输出错误信息
        if (err.response) {
          console.error('响应状态:', err.response.status);
          console.error('响应头:', err.response.headers);
          console.error('响应体:', err.response.data);
        } else if (err.request) {
          console.error('请求未收到响应:', err.request);
        } else {
          console.error('错误消息:', err.message);
        }
        
        // 用一个基本响应替代，避免整个应用崩溃
        return {
          stream: new ReadableStream({
            start(controller) {
              const encoder = new TextEncoder();
              controller.enqueue(encoder.encode('无法连接到AI服务，请稍后再试。'));
              controller.close();
            }
          }),
          rawCall: { rawPrompt: null, rawSettings: {} },
        };
      }
    },
    
    // 为非流式生成添加doGenerate方法
    doGenerate: async ({ messages, system, prompt, ...options }: ApiRequest) => {
      try {
        console.log('SiliconFlow生成标题，使用模型:', model);
        
        // 构建简单的消息数组
        const formattedMessages: Array<{role: string, content: string}> = [];
        
        // 添加系统消息
        if (system) {
          formattedMessages.push({
            role: 'system',
            content: system
          });
        }
        
        // 处理提示消息
        if (prompt) {
          try {
            const parsedPrompt = JSON.parse(prompt);
            if (parsedPrompt && typeof parsedPrompt === 'object') {
              // 提取实际文本内容
              let userContent = '';
              
              // 尝试从不同可能的字段提取内容
              if (typeof parsedPrompt.content === 'string') {
                userContent = parsedPrompt.content;
              } else if (Array.isArray(parsedPrompt.parts)) {
                // 处理parts数组
                userContent = parsedPrompt.parts
                  .map((part: any) => {
                    if (typeof part === 'string') return part;
                    if (part && typeof part === 'object' && 'text' in part) return part.text;
                    return '';
                  })
                  .filter((text: string) => text)
                  .join('\n');
              } else if (typeof parsedPrompt.text === 'string') {
                userContent = parsedPrompt.text;
              } else {
                // 回退到字符串化整个对象
                userContent = "提取标题: " + JSON.stringify(parsedPrompt).substring(0, 200);
              }
              
              formattedMessages.push({
                role: 'user',
                content: userContent
              });
            } else {
              formattedMessages.push({
                role: 'user',
                content: prompt
              });
            }
          } catch (e) {
            // JSON解析失败，直接使用prompt
            formattedMessages.push({
              role: 'user',
              content: prompt
            });
          }
        }
        
        console.log('简化后的消息格式:', JSON.stringify(formattedMessages, null, 2));
        
        if (formattedMessages.length === 0) {
          // 如果没有有效消息，创建一个默认消息
          formattedMessages.push({
            role: 'user',
            content: '生成一个默认标题'
          });
        }
        
        const requestBody = {
          model: actualModel,
          messages: formattedMessages,
          stream: false,
          max_tokens: 512,
          stop: null,
          temperature: 0.5,
          top_p: 0.7,
          top_k: 50,
          frequency_penalty: 0.5,
          n: 1,
          response_format: { type: "text" },
          tools: []
        };
        
        const response = await fetch(`${process.env.SILICONFLOW_API_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        return {
          text: data.choices[0]?.message?.content || '新对话',
          usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          rawTask: null,
          rawSettings: {},
          rawCompletion: data,
        };
      } catch (error) {
        const err = error as Error;
        console.error('SiliconFlow生成标题时出错:', err.message);
        // 出错时返回默认标题，避免阻止创建聊天
        return {
          text: '新对话',
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          rawTask: null,
          rawSettings: {},
          rawCompletion: null,
        };
      }
    }
  };
};

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': createSiliconFlowAdapter('deepseek-ai/DeepSeek-V3') as any,
        'chat-model-reasoning': wrapLanguageModel({
          model: createSiliconFlowAdapter('deepseek-ai/DeepSeek-V3') as any,
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': createSiliconFlowAdapter('deepseek-ai/DeepSeek-V3') as any,
        'artifact-model': createSiliconFlowAdapter('deepseek-ai/DeepSeek-V3') as any,
      },
    });

// 移除这些空壳函数，避免导入冲突
// export function useChat(options: { 
//   id: string, 
//   body: any,
//   api?: string 
// }) {
//   // ...
// }

// export function useChatWithFallback(options: {
//   id: string,
//   body: any
// }) {
//   // ...
// }
