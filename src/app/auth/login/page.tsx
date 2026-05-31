"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/* ── Eye icon components ─────────────────────────────── */
const EyeOpen = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeClosed = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showPw, setShowPw]   = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      setError(data.error || "Login failed. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  };

  const inputCls = "w-full bg-white border border-pink-100 text-pink-700 text-xs px-5 py-4 placeholder:text-pink-300 focus:outline-none focus:border-pink-500 transition-colors rounded-sm";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <p className="text-[9px] tracking-[0.35em] uppercase text-pink-400 mb-4 font-black">Welcome Back</p>
        <h1 className="text-4xl font-black tracking-tighter text-pink-600 uppercase mb-12">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className={inputCls}
          />

          {/* Password with eye toggle */}
          <div className="relative">
            <input
              name="password"
              type={showPw ? "text" : "password"}
              required
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={inputCls + " pr-12"}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-500 transition-colors"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeClosed /> : <EyeOpen />}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 border border-red-100 px-4 py-3 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white text-xs font-black tracking-[0.25em] uppercase py-4 hover:bg-pink-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-3 rounded-sm shadow-md"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing In…
              </>
            ) : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-pink-400 mt-8 font-medium">
          No account?{" "}
          <Link href="/auth/signup" className="text-pink-600 hover:text-pink-800 transition-colors underline underline-offset-4 font-black">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
