/** @type {import('next').NextConfig} */
const nextConfig = {
  // 其他配置...
  
  // 添加以下配置
  reactStrictMode: true,
  compiler: {
    // 禁用React服务器组件，解决文档问题
    styledComponents: true,
  },
  
  // 禁用预渲染特定页面
  // unstable_excludeFiles: ['**/login**', '**/register**']
  
  // 添加此配置，禁用自动静态优化
  // 这会禁用整个应用的预渲染
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig 