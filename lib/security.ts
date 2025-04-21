/**
 * 净化用户输入以防止SQL注入和XSS攻击
 */
export function sanitizeInput(input: string | undefined | null): string {
  if (input === undefined || input === null) {
    return '';
  }
  
  // 移除SQL注入相关的危险模式
  let sanitized = input
    .replace(/'/g, "''")                // 转义单引号
    .replace(/;/g, '')                  // 移除分号
    .replace(/--/g, '')                 // 移除SQL注释
    .replace(/\/\*/g, '')               // 移除块注释开始
    .replace(/\*\//g, '')               // 移除块注释结束
    .replace(/xp_/gi, '')               // 移除SQL Server存储过程
    .replace(/exec\s+/gi, '')           // 移除EXEC命令
    .replace(/UNION\s+SELECT/gi, '')    // 移除UNION SELECT语句
    .replace(/SELECT\s+.*\s+FROM/gi, '') // 移除SELECT FROM语句
    .replace(/INSERT\s+INTO/gi, '')     // 移除INSERT INTO语句
    .replace(/UPDATE\s+.*\s+SET/gi, '')  // 移除UPDATE SET语句
    .replace(/DELETE\s+FROM/gi, '');    // 移除DELETE FROM语句
  
  // 防止Prompt注入的额外保护
  sanitized = sanitized
    // 过滤各种可能尝试查看、输出、忽略prompt的指令
    .replace(/ignore previous instructions/gi, '[内容已过滤]')
    .replace(/ignore all previous commands/gi, '[内容已过滤]')
    .replace(/forget your instructions/gi, '[内容已过滤]')
    .replace(/display prompt/gi, '[内容已过滤]')
    .replace(/show system prompt/gi, '[内容已过滤]')
    .replace(/what are your instructions/gi, '[内容已过滤]')
    .replace(/print your instructions/gi, '[内容已过滤]')
    .replace(/tell me your prompt/gi, '[内容已过滤]')
    .replace(/output the prompt/gi, '[内容已过滤]')
    .replace(/system instruction/gi, '[内容已过滤]')
    .replace(/developer mode/gi, '[内容已过滤]')
    .replace(/role play as/gi, '[内容已过滤]')
    .replace(/act as if/gi, '[内容已过滤]')
    .replace(/you are now/gi, '[内容已过滤]')
    .replace(/\[\[(.*?)\]\]/g, '[内容已过滤]') // 过滤双方括号命令
    .replace(/<\!(.*?)>/g, '[内容已过滤]')     // 过滤特殊XML风格指令
    .replace(/```prompt([\s\S]*?)```/gi, '[内容已过滤]') // 过滤代码块中的prompt
    .replace(/```system([\s\S]*?)```/gi, '[内容已过滤]') // 过滤代码块中的system指令
    .replace(/console\.log/gi, '[内容已过滤]')
    .replace(/eval\(/gi, '[内容已过滤]');
  
  return sanitized;
}

/**
 * 用于净化对象中的所有字符串属性
 * 使用类型断言解决类型问题
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const result = { ...obj } as T;
  
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const value = result[key as keyof T];
      
      if (typeof value === 'string') {
        // 使用类型断言避免类型错误
        (result as any)[key] = sanitizeInput(value);
      } else if (value !== null && typeof value === 'object') {
        // 递归清理嵌套对象
        (result as any)[key] = sanitizeObject(value);
      }
    }
  }
  
  return result;
} 