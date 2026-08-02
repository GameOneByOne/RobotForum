# Robot Forum

机器人论坛网站项目，前端使用 Next.js 部署到 Vercel，样式使用 Tailwind CSS，后端服务使用 Supabase。

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

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key，仅用于可信服务端代码

Vercel 部署时，在 Project Settings 的 Environment Variables 中配置同名变量。
