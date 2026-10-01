export default function Loading() {
  return <main aria-busy="true" aria-label="正在加载内容" className="mx-auto min-h-[70vh] w-full max-w-7xl px-5 py-16"><p role="status" className="eyebrow">LOADING KNOWLEDGE</p><div className="mt-6 h-12 w-64 rounded-lg bg-raised motion-safe:animate-pulse" /><div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[0,1,2].map(index=><div key={index} className="h-80 rounded-xl border border-line bg-panel motion-safe:animate-pulse" />)}</div></main>;
}
