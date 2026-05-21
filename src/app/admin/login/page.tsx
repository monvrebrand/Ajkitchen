"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setTimeout(() => {
      if (password === "MonvreAdmin#8842") {
        sessionStorage.setItem("monvre_admin", "true");
        router.push("/admin");
      } else {
        setError(true);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-12 text-center">
          <p className="text-xl font-black tracking-[0.35em] uppercase text-white mb-1">MONVRE</p>
          <p className="text-[9px] tracking-[0.35em] uppercase text-white/30">Admin Console</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[9px] tracking-[0.3em] uppercase text-white/30 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoFocus
              className="w-full bg-white/5 border border-white/10 text-white text-sm px-5 py-4 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors font-mono tracking-widest"
            />
          </div>
          {error && (
            <p className="text-[10px] tracking-widest uppercase text-red-400">Incorrect password.</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-white text-black text-xs font-bold tracking-[0.25em] uppercase py-4 hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Access Console"}
          </button>
        </form>
        <p className="text-center text-[9px] text-white/20 tracking-widest mt-10">
          MONVRE Admin Console
        </p>
      </div>
    </div>
  );
}
