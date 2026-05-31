export default function Loading() {
  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="mb-16 md:mb-24">
          <div className="h-2 w-20 bg-pink-100 rounded animate-pulse mb-4" />
          <div className="h-12 md:h-20 w-64 bg-pink-100 rounded animate-pulse mb-3" />
          <div className="h-12 md:h-20 w-52 bg-pink-100 rounded animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-4 w-full max-w-lg bg-pink-100 rounded animate-pulse" />
          <div className="h-4 w-full max-w-md bg-pink-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
