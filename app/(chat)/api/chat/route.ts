import {
  UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';

export const maxDuration = 60;

// 定义一个通用类型，包含任何可能的文本属性
type ChatPartWithContent = {
  id?: string;
  type?: string;
  text?: string;
  content?: string | any;
  [key: string]: any; // 允许索引任意字符串属性
};

export async function POST(request: Request) {
  console.log('================== 开始处理聊天请求 ==================');
  const startTime = Date.now();

  try {
    const json = await request.json();
    console.log('收到聊天请求:', JSON.stringify(json, null, 2));

    const {
      id,
      messages,
      selectedChatModel,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = json;

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      await saveChat({ id, userId: session.user.id, title });
    } else {
      if (chat.userId !== session.user.id) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: 'user',
          parts: userMessage.parts,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    console.log('================== 准备发送到SiliconFlow API ==================');

    // 提取消息内容
    let userContent = '';

    // 正确处理parts可能是对象的情况
    if (Array.isArray(userMessage.parts)) {
      userContent = userMessage.parts.map(part => {
        // 详细记录每个part的类型和内容
        console.log('处理消息part:', typeof part, part);
        
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object') {
          // 处理可能的文本对象
          if ('text' in part && part.text) {
            console.log('找到text类型:', part.text);
            return part.text;
          }
          if ((part as ChatPartWithContent).content) {
            console.log('找到content属性:', (part as ChatPartWithContent).content);
            return String((part as ChatPartWithContent).content);
          }
          // 检查其他可能包含文本的属性
          const textKeys = Object.keys(part as ChatPartWithContent).filter(key => 
            typeof (part as any)[key] === 'string' && 
            (part as any)[key].length > 0 &&
            key !== 'id' && key !== 'type'
          );
          
          if (textKeys.length > 0) {
            console.log('找到可能的文本属性:', textKeys[0], (part as any)[textKeys[0]]);
            return (part as any)[textKeys[0]];
          }
          
          // 最后尝试转为JSON
          console.log('无法直接提取文本，尝试JSON转换');
          return JSON.stringify(part);
        }
        return '';
      }).filter(Boolean).join('\n');
    } else if (typeof userMessage.parts === 'string') {
      userContent = userMessage.parts;
    } else {
      // 回退方案
      console.log('无法解析用户消息，使用默认内容');
      userContent = '请帮我回答问题';
    }

    console.log('处理后的用户消息内容:', userContent);

    // 构建消息数组
    const apiMessages = [
      // 添加系统提示
      {
        role: 'system',
        content: systemPrompt({ selectedChatModel })
      },
      // 添加用户消息
      {
        role: 'user',
        content: userContent
      }
    ];

    console.log('发送到API的消息:', JSON.stringify(apiMessages, null, 2));

    // 直接调用SiliconFlow API
    const response = await fetch(`${process.env.SILICONFLOW_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "Qwen/QwQ-32B", // 使用已确认工作的模型
        messages: apiMessages,
        stream: true,
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50
      })
    });

    // 使用最简单的硬编码方式创建响应流
    function createAiSdkStream(apiResponse: any) {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();
      
      (async () => {
        try {
          // 从响应中提取文本
          const responseText = await apiResponse.text();
          console.log('API响应总长度:', responseText.length);
          
          // 提取内容 - 使用正则表达式
          const allContent = extractContentFromResponse(responseText);
          console.log('提取的内容长度:', allContent.length);
          
          // 如果没有提取到内容，使用备用方案
          const finalContent = allContent || "无法从API提取回复内容。";
          
          // 1. 创建消息事件
          const messageId = generateUUID();
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                id: messageId,
                type: 'createMessage',
                role: 'assistant',
                createdAt: new Date().toISOString()
              })}\n\n`
            )
          );
          
          // 等待一小段时间确保createMessage事件被处理
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // 2. 发送文本内容 - 一次性发送
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                id: messageId,
                type: 'textMessagePartContent',
                text: finalContent
              })}\n\n`
            )
          );
          
          // 等待一小段时间确保content事件被处理
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // 3. 发送完成事件
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done'
              })}\n\n`
            )
          );
          
          await writer.close();
        } catch (error) {
          console.error('创建流式响应出错:', error);
          writer.abort(error);
        }
      })();
      
      return readable;
    }

    // 辅助函数：从响应中提取内容
    function extractContentFromResponse(responseText: string) {
      try {
        // 方法1：使用正则表达式提取所有content值
        const contentMatches = responseText.match(/"content":"([^"]*)"/g) || [];
        if (contentMatches.length > 0) {
          return contentMatches
            .map((match: string) => match.replace(/"content":"/, '').replace(/"$/, ''))
            .join('');
        }
        
        // 方法2：尝试解析为JSON并提取内容
        try {
          // 查找可能的JSON对象
          const jsonMatch = responseText.match(/\{.*\}/);
          if (jsonMatch) {
            const json = JSON.parse(jsonMatch[0]);
            if (json.choices && json.choices[0]) {
              if (json.choices[0].message && json.choices[0].message.content) {
                return json.choices[0].message.content;
              }
              if (json.choices[0].text) {
                return json.choices[0].text;
              }
            }
          }
        } catch (e) {
          console.log('JSON解析失败:', e);
        }
        
        // 方法3：作为后备，使用纯文本内容的一部分
        if (responseText.length > 0) {
          return `API返回了响应，但无法解析内容。这是原始响应的前100个字符: ${responseText.substring(0, 100)}...`;
        }
        
        return '';
      } catch (e) {
        console.error('提取内容时出错:', e);
        return '';
      }
    }

    // 改进的AI响应保存函数
    async function saveAIResponse(response: Response, chatId: string, sessionUserId: string) {
      try {
        // 创建一个新的响应副本
        const responseClone = response.clone();
        
        // 读取完整响应内容
        if (!responseClone.body) {
          console.error('响应体为空');
          return false;
        }
        
        const reader = responseClone.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        
        console.log('开始读取AI响应内容');
        
        // 处理流
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('响应读取完成');
            break;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          console.log('收到数据块长度:', chunk.length);
          
          // 分割数据块并处理每一行
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            
            try {
              // 尝试直接解析JSON - 无论是否有data:前缀
              let jsonStr = line;
              
              // 如果行以data:开头，提取JSON部分
              if (line.startsWith('data:')) {
                jsonStr = line.substring(5).trim();
                // 跳过[DONE]标记
                if (jsonStr === '[DONE]') continue;
              }
              
              // 只有当JSON字符串非空时才尝试解析
              if (jsonStr && jsonStr.trim()) {
                const data = JSON.parse(jsonStr);
                
                // 提取内容 - 尝试不同的路径
                let contentChunk = null;
                
                if (data.choices && data.choices[0]) {
                  if (data.choices[0].delta && data.choices[0].delta.content) {
                    contentChunk = data.choices[0].delta.content;
                  } else if (data.choices[0].message && data.choices[0].message.content) {
                    contentChunk = data.choices[0].message.content;
                  }
                }
                
                if (contentChunk) {
                  fullContent += contentChunk;
                }
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
            }
          }
        }
        
        console.log('累积的内容长度:', fullContent.length);
        
        // 保存完整的AI响应到数据库
        if (fullContent) {
          console.log('保存AI响应到数据库，长度:', fullContent.length);
          console.log('内容预览:', fullContent.substring(0, 100) + '...');

                await saveMessages({
                  messages: [
                    {
                chatId,
                id: generateUUID(),
                role: 'assistant',
                parts: [fullContent],
                attachments: [],
                      createdAt: new Date(),
                    },
                  ],
                });
          
          console.log('AI响应已成功保存到数据库');
          return true;
        } else {
          console.log('没有提取到有效内容 - 启用备用方案');
          
          // 尝试备用方案 - 直接从客户端获取
          return false;
        }
      } catch (error) {
        console.error('保存AI响应时出错:', error);
        return false;
      }
    }

    // 获取原始响应的副本用于保存
    const originalResponse = response.clone();

    // 启动一个非阻塞任务来保存响应
    (async () => {
      try {
        await saveAIResponse(originalResponse, id, session.user.id);
        console.log('保存响应任务完成');
      } catch (e) {
        console.error('保存响应任务失败:', e);
        
        // 出错时尝试保存默认消息
        try {
          await saveMessages({
            messages: [
              {
                chatId: id,
                id: generateUUID(),
                role: 'assistant',
                parts: ['AI回复内容保存失败，但您的消息已记录。'],
                attachments: [],
                createdAt: new Date(),
              },
            ],
          });
          console.log('保存了错误提示消息');
        } catch (innerError) {
          console.error('保存错误提示消息也失败了:', innerError);
        }
      }
    })();

    // 使用新的简化函数创建流式响应
    const aiStream = createAiSdkStream(response);

    // 返回流式响应
    return new Response(aiStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('================== 请求处理出错 ==================');
    console.error('错误详情:', error);
    console.error('堆栈:', error.stack);
    return new Response('处理请求时出错', {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
