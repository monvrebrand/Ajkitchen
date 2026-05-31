export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="mb-16 md:mb-24">
          <div className="h-2 w-20 bg-pink-50 rounded animate-pulse mb-4" />
          <div className="h-12 md:h-20 w-72 bg-pink-50 rounded animate-pulse mb-3" />
          <div className="h-12 md:h-20 w-48 bg-pink-50 rounded animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 gap-12 md:gap-24">
          <div className="space-y-4">
            <div className="h-4 w-full max-w-lg bg-pink-50 rounded animate-pulse" />
            <div className="h-4 w-full max-w-md bg-pink-50 rounded animate-pulse" />
            <div className="h-4 w-full max-w-sm bg-pink-50 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
