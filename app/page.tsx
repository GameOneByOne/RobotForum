import { createClient } from "@/lib/supabase/server";

const forumSections = [
  {
    title: "机器人硬件",
    description: "结构设计、传感器、电机、控制板和装配经验。",
    topics: 128,
  },
  {
    title: "ROS 与算法",
    description: "ROS、SLAM、导航、感知、运动规划与仿真。",
    topics: 86,
  },
  {
    title: "项目展示",
    description: "分享机器人作品、比赛记录、开源项目和演示视频。",
    topics: 42,
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#18191f]">
      <header className="border-b border-[#d9dde5] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#2f6f73]">
              Robot Forum
            </p>
            <h1 className="text-2xl font-bold">机器人开发者论坛</h1>
          </div>
          <div className="rounded-md border border-[#cfd6df] px-3 py-2 text-sm text-[#4f5968]">
            {user ? user.email : "未登录"}
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-lg border border-[#d9dde5] bg-white p-5">
            <h2 className="text-xl font-semibold">版块</h2>
            <p className="mt-2 text-sm leading-6 text-[#5b6472]">
              Supabase 客户端已经在服务端初始化。配置环境变量后，这里就可以读取真实用户、帖子和版块数据。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {forumSections.map((section) => (
              <article
                key={section.title}
                className="rounded-lg border border-[#d9dde5] bg-white p-5"
              >
                <h3 className="font-semibold">{section.title}</h3>
                <p className="mt-2 min-h-16 text-sm leading-6 text-[#5b6472]">
                  {section.description}
                </p>
                <p className="mt-4 text-sm font-medium text-[#2f6f73]">
                  {section.topics} 个主题
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-[#d9dde5] bg-white p-5">
          <h2 className="text-lg font-semibold">部署接入状态</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#5b6472]">前端</dt>
              <dd className="font-medium">Next.js / Vercel</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#5b6472]">样式</dt>
              <dd className="font-medium">Tailwind CSS</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#5b6472]">后端</dt>
              <dd className="font-medium">Supabase</dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
