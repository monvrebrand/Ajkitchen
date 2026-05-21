export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-sm">
        <div className="h-2 w-20 bg-white/5 rounded animate-pulse mb-4" />
        <div className="h-10 w-32 bg-white/5 rounded animate-pulse mb-12" />
        <div className="space-y-4">
          <div className="h-12 w-full bg-white/5 rounded animate-pulse" />
          <div className="h-12 w-full bg-white/5 rounded animate-pulse" />
          <div className="h-12 w-full bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
