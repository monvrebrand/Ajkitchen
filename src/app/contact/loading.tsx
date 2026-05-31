export default function Loading() {
  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="mb-16 md:mb-24">
          <div className="h-2 w-20 bg-pink-100 rounded animate-pulse mb-4" />
          <div className="h-12 md:h-20 w-56 bg-pink-100 rounded animate-pulse" />
        </div>
        <div className="grid md:grid-cols-[1fr_420px] gap-16">
          <div className="space-y-4">
            <div className="h-12 w-full bg-pink-100 rounded animate-pulse" />
            <div className="h-12 w-full bg-pink-100 rounded animate-pulse" />
            <div className="h-32 w-full bg-pink-100 rounded animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-4 w-32 bg-pink-100 rounded animate-pulse" />
            <div className="h-4 w-48 bg-pink-100 rounded animate-pulse" />
            <div className="h-4 w-40 bg-pink-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
