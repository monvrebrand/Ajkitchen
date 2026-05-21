"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <p className="text-[9px] tracking-[0.35em] uppercase text-white/30 mb-4">Welcome Back</p>
        <h1 className="text-4xl font-black tracking-tighter text-white/90 uppercase mb-12">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 text-white text-xs px-5 py-4 placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 text-white text-xs px-5 py-4 placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
          />

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black text-xs font-bold tracking-[0.25em] uppercase py-4 hover:bg-white/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Signing In…
              </>
            ) : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-white/30 mt-8">
          No account?{" "}
          <Link href="/auth/signup" className="text-white/60 hover:text-white transition-colors underline underline-offset-4">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
