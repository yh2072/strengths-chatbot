// 为常见的函数参数添加全局类型
interface Window {
  showToast: (message: string) => void;
}

// 声明模块
declare module '*.json' {
  const value: any;
  export default value;
} 