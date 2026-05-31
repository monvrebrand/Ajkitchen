export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
           <span className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin block" />
           <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs">🍲</span>
           </div>
        </div>
        <p className="text-[10px] tracking-[0.4em] uppercase text-pink-300 font-black animate-pulse">Loading Kitchen…</p>
      </div>
    </div>
  );
}
