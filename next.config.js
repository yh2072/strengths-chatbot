/** @type {import('next').NextConfig} */
const nextConfig = {
  // 其他配置...
  
  // 添加以下配置
  reactStrictMode: true,
  compiler: {
    // 禁用React服务器组件，解决文档问题
    // 仅在遇到问题的路由上禁用SSR
    styledComponents: true,
  }
}

module.exports = nextConfig 