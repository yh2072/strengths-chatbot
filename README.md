<a href="https://chat.vercel.ai/">
  <img alt="基于 Next.js 14 和 App Router 的性格优势聊天机器人。" src="app/(chat)/opengraph-image.png">
  <h1 align="center">Character Strengths Chatbot</h1>
</a>

<p align="center">
    Character Strengths Chatbot 是一个免费、开源的应用，基于 Next.js 和 AI SDK 构建，帮助用户探索和发展自己的性格优势。
</p>

<p align="center">
  <a href="https://chat-sdk.dev"><strong>阅读文档</strong></a> ·
  <a href="#features"><strong>特性</strong></a> ·
  <a href="#model-providers"><strong>模型提供商</strong></a> ·
  <a href="#deploy-your-own"><strong>部署自己的版本</strong></a> ·
  <a href="#running-locally"><strong>本地运行</strong></a>
</p>
<br/>

## 特性

- 性格优势评估与探索
  - 基于积极心理学的 24 种性格优势分析
  - 个性化的优势发展建议和练习
  - 追踪个人优势成长的进度
- [Next.js](https://nextjs.org) App Router
  - 先进的路由系统，提供无缝导航和高性能体验
  - React 服务器组件（RSCs）和服务器操作，用于服务器端渲染和提高性能
- [AI SDK](https://sdk.vercel.ai/docs)
  - 统一的 API，用于生成文本、结构化对象和工具调用
  - 用于构建动态聊天和生成式用户界面的钩子
  - 支持 xAI（默认）、OpenAI、Fireworks 和其他模型提供商
- [shadcn/ui](https://ui.shadcn.com)
  - 使用 [Tailwind CSS](https://tailwindcss.com) 进行样式设计
  - 来自 [Radix UI](https://radix-ui.com) 的组件原语，确保可访问性和灵活性
- 数据持久化
  - [Neon Serverless Postgres](https://vercel.com/marketplace/neon) 用于保存聊天历史和用户数据
  - [Vercel Blob](https://vercel.com/storage/blob) 用于高效文件存储
- [Auth.js](https://authjs.dev)
  - 简单且安全的身份验证



## 部署自己的版本

您可以通过一键点击将 Character Strengths Chatbot 的自己版本部署到 Vercel：

[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot&env=AUTH_SECRET&envDescription=Generate%20a%20random%20secret%20to%20use%20for%20authentication&envLink=https%3A%2F%2Fgenerate-secret.vercel.app%2F32&project-name=character-strengths-chatbot&repository-name=character-strengths-chatbot&demo-title=Character%20Strengths%20Chatbot&demo-description=一个基于%20Next.js%20和%20AI%20SDK%20构建的开源性格优势聊天机器人模板&demo-url=https%3A%2F%2Fchat.vercel.ai&products=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22ai%22%2C%22productSlug%22%3A%22grok%22%2C%22integrationSlug%22%3A%22xai%22%7D%2C%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D)

## 本地运行

您需要使用[`.env.example`](.env.example)中定义的环境变量来运行 Character Strengths Chatbot。建议使用 [Vercel 环境变量](https://vercel.com/docs/projects/environment-variables)，但`.env`文件也足够了。

> 注意：不应提交`.env`文件，否则会暴露允许他人控制您的各种 AI 和身份验证提供商账户的密钥。

1. 安装 Vercel CLI：`npm i -g vercel`
2. 将本地实例与 Vercel 和 GitHub 账户关联（创建`.vercel`目录）：`vercel link`
3. 下载您的环境变量：`vercel env pull`

```bash
pnpm install
pnpm dev
```

您的应用模板现在应该在 [localhost:3000](http://localhost:3000) 上运行。
