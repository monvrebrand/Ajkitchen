"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Step 1: Create user via server API (auto-confirmed, no email verification needed)
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email:     form.email,
        password:  form.password,
        firstName: form.firstName,
        lastName:  form.lastName,
      }),
    });

    const result = await res.json();

    if (!res.ok || result.error) {
      setError(result.error || "Signup failed. Please try again.");
      setLoading(false);
      return;
    }

    // Step 2: Sign them in immediately — no email confirmation required
    const supabase = createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: form.password,
    });

    if (signInErr) {
      // Account created but auto-login failed — send to login page
      setLoading(false);
      setDone(true);
      return;
    }

    // Signed in — go straight to account
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
        <p className="text-[9px] tracking-[0.35em] uppercase text-white/30 mb-4">Join the Void</p>
        <h1 className="text-4xl font-black tracking-tighter text-white/90 uppercase mb-12">Sign Up</h1>

        {done ? (
          <div className="text-center space-y-6">
            <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center mx-auto">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-white/60">Account created. Check your email to confirm.</p>
            <Link href="/auth/login" className="block bg-white text-black text-xs font-bold tracking-widest uppercase py-4 text-center hover:bg-white/90 transition-colors">
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input name="firstName" type="text" required placeholder="First Name" value={form.firstName} onChange={handleChange}
                className="bg-white/5 border border-white/10 text-white text-xs px-4 py-4 placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors" />
              <input name="lastName" type="text" required placeholder="Last Name" value={form.lastName} onChange={handleChange}
                className="bg-white/5 border border-white/10 text-white text-xs px-4 py-4 placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors" />
            </div>
            <input name="email" type="email" required placeholder="Email Address" value={form.email} onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 text-white text-xs px-5 py-4 placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors" />
            <input name="password" type="password" required minLength={8} placeholder="Password (min 8 characters)" value={form.password} onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 text-white text-xs px-5 py-4 placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors" />

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-4 py-3">
                {error}
              </p>
            )}

            <p className="text-[10px] text-white/25 leading-relaxed pt-1">
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
            <button type="submit" disabled={loading}
              className="w-full bg-white text-black text-xs font-bold tracking-[0.25em] uppercase py-4 hover:bg-white/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Creating Account…
                </>
              ) : "Create Account"}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-white/30 mt-8">
          Have an account?{" "}
          <Link href="/auth/login" className="text-white/60 hover:text-white transition-colors underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
