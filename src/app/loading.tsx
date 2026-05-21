export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="w-6 h-6 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
        <p className="text-[9px] tracking-[0.4em] uppercase text-white/20">Loading</p>
      </div>
    </div>
  );
}
