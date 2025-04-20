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
}

module.exports = nextConfig 