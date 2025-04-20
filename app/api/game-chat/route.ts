import { NextRequest } from 'next/server';

// 角色提示模板
const CHARACTER_PROMPTS = {
  einstein: `你是爱因斯坦博士，一位既有天才头脑又充满温暖幽默感的科学家。你在帮助人们发现自己内在优势的同时，会用你标志性的口头禅"想象力比知识更重要"和偶尔冒出的物理学笑话来活跃气氛。

当用户完成当前步骤的任务后，请明确表示该步骤已完成，并使用"接下来"或"下一步"等词语引导用户进入下一阶段。例如："太棒了！你已经完成了列出工作任务的步骤。接下来，让我们来探索你的性格优势..."

回答要简洁、温暖、鼓励性，并适时引导用户思考更深层次的问题。

请保持以下风格特点：
1. 使用科学类比和思想实验来解释概念
2. 偶尔引用你的相对论或其他物理学成就
3. 温暖而幽默，但同时又富有智慧
4. 鼓励好奇心和创造性思考
5. 请始终使用中文回复

所有回复必须是中文，不要使用英文。
`,
  doraemon: `你是来自22世纪的机器猫哆啦A梦，带着神奇的四次元口袋来到现在，目的是帮助用户发掘内在优势并活出更精彩的人生。

当用户完成当前步骤的任务后，请明确表示该步骤已完成，并使用"接下来"或"下一步"等词语引导用户进入下一阶段。例如："很好，你已经完成了这个步骤。接下来，我们要..."

请保持以下风格特点：
1. 活泼可爱的语气，经常使用"哇"、"啊"等语气词
2. 提到你的四次元口袋和各种神奇道具作为比喻
3. 简单易懂的解释方式，适合所有年龄层
4. 乐观积极，始终相信问题都有解决方案
5. 请始终使用中文回复

所有回复必须是中文，不要使用英文。
`,
  dumbledore: `你是霍格沃茨的邓布利多教授，一位充满智慧、幽默且深谙人性的魔法导师。你善于发现每个人内在的"魔法"并引导他们发挥潜能。

当用户完成当前步骤的任务后，请明确表示该步骤已完成，并使用"接下来"或"下一步"等词语引导用户进入下一阶段。例如："很好，你已经完成了这个步骤。接下来，我们要..."

请保持以下风格特点：
1. 语气温和但充满力量，像是对待珍视的学生
2. 偶尔提到魔法世界的典故和柠檬雪宝糖
3. 使用隐喻和谜语般的表达方式
4. 强调选择的重要性和内在价值
5. 请始终使用中文回复

所有回复必须是中文，不要使用英文。
`
};

// 练习内容提示
const EXERCISE_PROMPTS = {
  'strengths-alignment': `当前练习是"优势对齐"，目的是帮助用户将自己的性格优势与日常工作任务结合，创造更多能量和意义。

当用户完成当前步骤的任务后，请明确表示该步骤已完成，并使用"接下来"或"下一步"等词语引导用户进入下一阶段。例如："很好，你已经完成了这个步骤。接下来，我们要..."

练习步骤：
1. 引导用户列出5项工作中最常执行的任务
2. 帮助用户确认自己的5大性格优势
3. 引导用户为每项任务找到应用优势的方式
4. 鼓励用户在日常工作中实践这些新方法
5. 引导用户观察能量和满足感的变化

请根据用户当前所处的步骤，提供适当的引导和回应。
`
};

// 定义类型
type CharacterId = keyof typeof CHARACTER_PROMPTS;
type ExerciseId = keyof typeof EXERCISE_PROMPTS;
type Message = {
  role: string;
  content: string;
  [key: string]: any;
};

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { messages, characterId, exerciseId, currentStep } = await request.json() as {
      messages: Message[];
      characterId: string;
      exerciseId: string;
      currentStep: number;
    };
    
    if (!characterId || !exerciseId) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 使用类型断言保证类型安全
    const characterPrompt = CHARACTER_PROMPTS[characterId as CharacterId] || CHARACTER_PROMPTS.einstein;
    const exercisePrompt = EXERCISE_PROMPTS[exerciseId as ExerciseId] || '';
    
    // 构建系统提示
    const systemPrompt = `${characterPrompt}\n\n${exercisePrompt}\n\n当前用户正在练习的第${currentStep + 1}步。

当前步骤内容:
${currentStep === 0 ? "引导用户列出5项工作中最常执行的任务" : ""}
${currentStep === 1 ? "帮助用户确认自己的5大性格优势" : ""}
${currentStep === 2 ? "引导用户为每项任务找到应用优势的方式" : ""}
${currentStep === 3 ? "鼓励用户在日常工作中实践这些新方法" : ""}
${currentStep === 4 ? "引导用户观察能量和满足感的变化" : ""}

重要提示：当用户完成当前步骤时，请在你的回复中使用"接下来"或"下一步"等词语来引导用户。这将帮助系统自动进入下一个练习步骤。

请根据当前步骤引导用户，但保持自然对话风格，允许用户自由表达。不要强制限制用户必须完全按照步骤进行，可以根据对话流程适当调整。以对应角色身份回应，保持风格一致性。始终使用中文回复用户。`;
    
    // 使用硅基流动API
    const requestBody = {
      model: "deepseek-ai/DeepSeek-V3", // 使用DeepSeek-V3模型
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...messages.map((m: Message) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content
        }))
      ],
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      frequency_penalty: 0.5,
      max_tokens: 1000,
      stream: true // 启用流式响应
    };
    
    console.log("发送到硅基流动的请求:", JSON.stringify(requestBody, null, 2));
    
    // 发送请求到硅基流动API
    const response = await fetch(`${process.env.SILICONFLOW_API_BASE_URL || "https://api.siliconflow.cn/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SILICONFLOW_API_KEY || process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API请求失败:", response.status, errorData);
      throw new Error(`硅基流动API请求失败: ${response.status}`);
    }
    
    // 创建响应流
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 检查响应体是否存在
          if (!response.body) {
            throw new Error('硅基流动API响应没有响应体');
          }
          
          // 读取流
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          let buffer = '';
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // 发送结束信号
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              break;
            }
            
            // 解码收到的数据
            buffer += decoder.decode(value, { stream: true });
            
            // 处理行
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留最后一个不完整的行
            
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue;
              
              if (trimmedLine.startsWith('data: ')) {
                try {
                  // 处理数据行
                  const data = trimmedLine.substring(6);
                  if (data === '[DONE]') {
                    // 流结束
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    continue;
                  }
                  
                  const parsed = JSON.parse(data);
                  if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                    // 提取文本内容
                    const text = parsed.choices[0].delta.content;
                    // 发送文本片段
                    const message = {
                      type: 'textMessagePartContent',
                      text
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
                  }
                } catch (e) {
                  console.error("解析硅基流动响应错误:", e);
                }
              }
            }
          }
        } catch (error) {
          console.error("处理流时出错:", error);
          // 提供更好的错误信息给客户端
          try {
            const errorMessage = {
              type: 'error',
              message: error instanceof Error ? error.message : '未知错误'
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
          } catch (e) {
            // 忽略在错误处理中发生的错误
          }
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });
    
    const encoder = new TextEncoder();
    
    // 返回流式响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
    
  } catch (error) {
    console.error('游戏聊天API错误:', error);
    
    // 提供友好的错误信息
    return new Response(
      JSON.stringify({ error: '与AI服务连接失败，请稍后再试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 