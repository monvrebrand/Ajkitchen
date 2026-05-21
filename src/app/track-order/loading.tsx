export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] pt-20 md:pt-28 pb-16 md:pb-24">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        <div className="h-2 w-16 bg-white/5 rounded animate-pulse mb-3" />
        <div className="h-12 md:h-16 w-72 bg-white/5 rounded animate-pulse mb-4" />
        <div className="h-4 w-64 bg-white/5 rounded animate-pulse mb-12" />
        <div className="h-14 w-full bg-white/5 rounded animate-pulse" />
      </div>
    </div>
  );
}
