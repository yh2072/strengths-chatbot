// 极验验证的全局类型声明

interface Window {
  initGeetest4: (
    config: {
      captchaId: string;
      product?: 'float' | 'popup' | 'bind';
      [key: string]: any;
    },
    callback: (captchaObj: {
      appendTo: (elementOrSelector: HTMLElement | string) => void;
      destroy: () => void;
      getValidate: () => {
        lot_number: string;
        captcha_output: string;
        pass_token: string;
        gen_time: string;
        [key: string]: any;
      };
      onReady: (callback: () => void) => void;
      onSuccess: (callback: () => void) => void;
      onError: (callback: (error: any) => void) => void;
      onClose: (callback: () => void) => void;
      verify: () => void;
      reset: () => void;
      [key: string]: any;
    }) => void
  ) => void;
} 