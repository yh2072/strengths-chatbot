import { NextRequest } from 'next/server';
import GeetestService from '@/lib/geetest';

// 创建极验服务实例
const geetestService = new GeetestService({
  captchaId: process.env.GEETEST_CAPTCHA_ID || '',
  captchaKey: process.env.GEETEST_CAPTCHA_KEY || '',
  apiServer: process.env.GEETEST_API_SERVER || 'http://gcaptcha4.geetest.com'
});

// 验证极验验证码
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { lotNumber, captchaOutput, passToken, genTime } = body;
    
    // 参数验证
    if (!lotNumber || !captchaOutput || !passToken || !genTime) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: '缺少必要的验证参数' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 调用极验验证
    const result = await geetestService.validateCaptcha({
      lotNumber,
      captchaOutput,
      passToken,
      genTime
    });
    
    if (result.result !== 'success') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: '验证失败', 
          reason: result.reason 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 验证通过
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '验证通过' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('极验验证API错误:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: '验证服务异常，请稍后再试' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 