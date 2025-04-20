/** @type {import('next').NextConfig} */
const nextConfig = {
  // 其他配置...
  
  // 添加运行时配置
  runtime: {
    // 设置特定路径为客户端组件
    '/login': { 
      runtime: 'edge',
      regions: 'all' 
    }
  },
  output: 'standalone', // 不使用静态导出
  
  // 或设置
  // experimental: {
  //   appDir: true
  // }
}

module.exports = nextConfig 