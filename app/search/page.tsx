import { ContentCard } from "@/components/content-card";
import { PostCard } from "@/components/post-card";
import { SiteHeader } from "@/components/site-header";
import { searchForumPosts } from "@/lib/forum/posts";
import { searchPlatformContent } from "@/lib/platform/queries";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.q ?? "";
  const [posts, platformResults] = await Promise.all([
    searchForumPosts(query),
    searchPlatformContent(query),
  ]);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#171a20]">
      <SiteHeader />
      <section className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto w-[80vw] max-w-none px-5 py-10">
          <p className="text-sm font-semibold text-[#24706f]">Search</p>
          <h1 className="mt-2 text-4xl font-bold">鍏ㄧ珯鎼滅储</h1>
          <form className="mt-5 flex max-w-2xl gap-3">
            <input
              name="q"
              defaultValue={query}
              placeholder="鎼滅储鐭ヨ瘑銆佽璁恒€侀」鐩€佽祫婧愭垨鏍囩"
              className="min-w-0 flex-1 rounded-md border border-[#cfd6df] px-3 py-2 text-sm outline-none focus:border-[#24706f] focus:ring-2 focus:ring-[#b7cfcd]"
            />
            <button
              type="submit"
              className="rounded-md bg-[#24706f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1f6867]"
            >
              鎼滅储
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto w-[80vw] max-w-none space-y-8 px-5 py-8">
        <section>
          <h2 className="text-xl font-bold">璁ㄨ</h2>
          <div className="mt-4 space-y-4">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
            {!posts.length && (
              <p className="rounded-lg border border-[#d8dee6] bg-white p-5 text-sm text-[#667085]">
                娌℃湁鍖归厤鐨勮璁恒€?              </p>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {platformResults.knowledge.map((item) => (
            <ContentCard
              key={item.slug}
              title={item.title}
              description={item.summary}
              meta={`Knowledge / ${item.type}`}
              tags={item.tags}
            />
          ))}
          {platformResults.projects.map((project) => (
            <ContentCard
              key={project.slug}
              title={project.title}
              description={project.description}
              meta="Project"
              tags={project.tags}
            />
          ))}
          {platformResults.resources.map((resource) => (
            <ContentCard
              key={resource.slug}
              title={resource.title}
              description={resource.description}
              href={resource.url}
              meta={`Resource / ${resource.type}`}
              tags={resource.tags}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
