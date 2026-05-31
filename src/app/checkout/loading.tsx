export default function Loading() {
  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="h-10 w-48 bg-pink-100 rounded animate-pulse mb-12" />
        <div className="grid lg:grid-cols-[1fr_380px] gap-12">
          <div className="space-y-4">
            <div className="h-12 w-full bg-pink-100 rounded animate-pulse" />
            <div className="h-12 w-full bg-pink-100 rounded animate-pulse" />
            <div className="h-12 w-full bg-pink-100 rounded animate-pulse" />
            <div className="h-12 w-full bg-pink-100 rounded animate-pulse" />
          </div>
          <div className="h-64 bg-pink-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
