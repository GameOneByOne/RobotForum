# Robot Forum

机器人论坛网站项目，前端使用 Next.js 部署到 Vercel，样式使用 Tailwind CSS，后端服务使用 Supabase。

## 技术栈

- Frontend: Next.js App Router
- Styling: Tailwind CSS
- Backend/Auth/Database: Supabase
- Deployment: Vercel

## 本地开发

1. 安装依赖：

```bash
npm install
```

2. 复制环境变量示例并填入 Supabase 项目信息：

```bash
cp .env.example .env.local
```

3. 启动开发服务器：

```bash
npm run dev
```

## 环境变量

本地开发使用 `.env.local`，Vercel 云端部署时在 Vercel Project Settings 中配置同名变量。

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key，仅用于可信服务端代码

不要提交真实 `.env` 或 `.env.local` 文件。仓库里只提交 `.env.example`。

## Vercel 接入

仓库已经包含 `vercel.json`，用于声明 Vercel 构建命令：

```json
{
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev"
}
```

部署步骤：

1. 把仓库推送到 GitHub、GitLab 或 Bitbucket。
2. 在 Vercel 中选择 `Add New Project`。
3. 导入这个仓库。
4. Framework Preset 选择或自动识别为 `Next.js`。
5. 在 `Environment Variables` 中添加 Supabase 环境变量。
6. 点击 Deploy。

## Supabase Auth 回调地址

Vercel 部署后，需要在 Supabase 后台配置：

```txt
Authentication -> URL Configuration
```

配置示例：

```txt
Site URL:
https://your-vercel-domain.vercel.app

Redirect URLs:
https://your-vercel-domain.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

如果之后绑定正式域名，也要把正式域名的 callback 地址加入 Redirect URLs。
