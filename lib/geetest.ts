import crypto from 'crypto';
import axios from 'axios';

// 极验配置
interface GeetestConfig {
  captchaId: string;
  captchaKey: string;
  apiServer: string;
}

export default class GeetestService {
  private config: GeetestConfig;

  constructor(config: GeetestConfig) {
    this.config = config;
  }

  // 生成HMAC-SHA256签名
  private generateSignToken(lotNumber: string): string {
    return crypto
      .createHmac('sha256', this.config.captchaKey)
      .update(lotNumber)
      .digest('hex');
  }

  // 验证极验参数
  async validateCaptcha(params: {
    lotNumber: string;
    captchaOutput: string;
    passToken: string;
    genTime: string;
  }): Promise<{ result: string; reason: string }> {
    try {
      const { lotNumber, captchaOutput, passToken, genTime } = params;
      
      // 生成签名
      const signToken = this.generateSignToken(lotNumber);
      
      // 构建验证请求参数
      const requestData = {
        lot_number: lotNumber,
        captcha_output: captchaOutput,
        pass_token: passToken,
        gen_time: genTime,
        sign_token: signToken,
      };
      
      // 发送验证请求
      const url = `${this.config.apiServer}/validate?captcha_id=${this.config.captchaId}`;
      const response = await axios.post(url, requestData, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (response.status !== 200) {
        console.warn('极验服务异常:', response.status);
        // 服务异常时默认放行
        return { result: 'success', reason: 'geetest_service_error' };
      }
      
      return {
        result: response.data.result,
        reason: response.data.reason || ''
      };
    } catch (error) {
      console.error('极验验证请求失败:', error);
      // 请求异常时默认放行，避免阻碍业务
      return { result: 'success', reason: 'geetest_request_error' };
    }
  }
} 