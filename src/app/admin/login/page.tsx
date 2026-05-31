"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";


export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/auth/admin", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-5" suppressHydrationWarning>
      <div className="w-full max-w-sm bg-white p-8 md:p-12 border border-pink-100 shadow-xl rounded-sm">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-pink-100 mb-4">
            <Image src="/logo.jpg" alt="AJ Kitchen" width={80} height={80} className="w-full h-full object-cover" priority />
          </div>
          <p className="text-xl font-black tracking-[0.35em] uppercase text-pink-600 mb-0.5">AJ KITCHEN</p>
          <p className="text-[9px] tracking-[0.35em] uppercase text-pink-300 font-bold">Super Admin Console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-2 font-black">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoFocus
              className="w-full bg-white border border-pink-100 text-pink-700 text-sm px-5 py-4 placeholder:text-pink-300 focus:outline-none focus:border-pink-500 transition-colors font-mono tracking-widest rounded-sm"
            />
          </div>

          {error && (
            <p className="text-[10px] tracking-widest uppercase text-red-500 font-black">
              Incorrect password. Access denied.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-pink-600 text-white text-xs font-black tracking-[0.25em] uppercase py-4 hover:bg-pink-700 transition-all disabled:opacity-50 rounded-sm shadow-md"
          >
            {loading ? "Verifying…" : "Access Console"}
          </button>
        </form>

        <p className="text-center text-[9px] text-pink-200 font-bold tracking-widest mt-10">
          AJ KITCHEN — Restricted Access
        </p>
      </div>
    </div>
  );
}
