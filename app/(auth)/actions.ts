'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { hash } from 'bcrypt-ts';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createUser as createUserInDb, getUser } from '@/lib/db/queries';

import { signIn } from './auth';
import GeetestService from '@/lib/geetest';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginActionState = 
  | { status: 'idle' }
  | { status: 'failed' }
  | { status: 'invalid_data' }
  | { status: 'success'; user: any };

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success', user: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

// 定义注册表单验证模式
const RegisterSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
  confirmPassword: z.string().min(6, '确认密码至少需要6个字符')
}).refine(data => data.password === data.confirmPassword, {
  message: '两次输入的密码不匹配',
  path: ['confirmPassword']
});

// 类型定义
export type RegisterActionState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
};

// 创建极验服务实例
const geetestService = new GeetestService({
  captchaId: process.env.GEETEST_CAPTCHA_ID || '',
  captchaKey: process.env.GEETEST_CAPTCHA_KEY || '',
  apiServer: process.env.GEETEST_API_SERVER || 'http://gcaptcha4.geetest.com'
});

// 注册处理
export async function register(prevState: RegisterActionState, formData: FormData): Promise<RegisterActionState> {
  try {
    // 获取表单数据
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // 处理极验验证数据
    const geetestDataString = formData.get('geetestData') as string;
    
    // 在生产环境中验证极验数据
    if (process.env.NODE_ENV === 'production' && geetestDataString) {
      try {
        const geetestData = JSON.parse(geetestDataString);
        const { lotNumber, captchaOutput, passToken, genTime } = geetestData;
        
        // 验证极验数据
        if (lotNumber && captchaOutput && passToken && genTime) {
          const verifyResult = await geetestService.validateCaptcha({
            lotNumber,
            captchaOutput,
            passToken,
            genTime
          });
          
          if (verifyResult.result !== 'success') {
            return {
              status: 'error',
              message: '验证码验证失败，请刷新页面重试'
            };
          }
        } else {
          return {
            status: 'error',
            message: '验证码数据不完整，请刷新页面重试'
          };
        }
      } catch (error) {
        console.error('极验验证解析错误:', error);
        return {
          status: 'error',
          message: '验证码数据解析失败，请刷新页面重试'
        };
      }
    }
    
    // 检查邮箱是否已被使用
    const existingUser = await getUser(email);
    if (existingUser && existingUser.length > 0) {
      return { status: 'error', message: '该邮箱已被注册' };
    }
    
    // 创建用户
    await createUserInDb(email, password);
    
    // 自动登录
    await signIn('credentials', { email, password, redirect: false });
    
    // 返回成功状态 - 不要在这里重定向！
    return { status: 'success' };
    
  } catch (error) {
    console.error('注册失败:', error);
    return { 
      status: 'error', 
      message: error instanceof Error ? error.message : '注册过程中发生错误，请稍后再试' 
    };
  }
}

export async function createUserAction(formData: FormData) {
  // 解析并验证表单数据
  const validatedFields = authFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '注册信息有误，请检查输入。'
    };
  }

  const { email, password } = validatedFields.data;
  
  try {
    // 检查邮箱是否已经存在
    const user = await sql`SELECT * FROM users WHERE email=${email}`;
    if (user.rows.length > 0) {
      return {
        message: '该邮箱已被注册。'
      };
    }

    // 对密码进行哈希处理
    const hashedPassword = await hash(password, 10);
    
    // 创建当前时间的ISO字符串，而不是Date对象
    const createdAt = new Date().toISOString();
    
    // 插入新用户
    await sql`
      INSERT INTO users (name, email, password, created_at)
      VALUES (${null}, ${email}, ${hashedPassword}, ${createdAt})
    `;
    
    // 注册成功后自动登录
    await signIn('credentials', { email, password, redirect: false });
    
    revalidatePath('/');
    redirect('/');
    
  } catch (error) {
    console.error('创建用户失败:', error);
    return {
      message: '创建用户时出错，请稍后再试。'
    };
  }
}
