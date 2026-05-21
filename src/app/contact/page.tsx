"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const topics = ["General Inquiry", "Order Support", "Returns & Exchanges", "Press & Media", "Wholesale", "Repair Request"];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", topic: topics[0], message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1400);
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 md:pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-4">Get in Touch</p>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white/90 uppercase leading-none">
            Contact
          </h1>
        </div>

        <div className="grid md:grid-cols-[1fr_420px] gap-16 md:gap-24">

          {/* Form */}
          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-start gap-6 py-8"
            >
              <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white/90 uppercase mb-3">Message Sent</h2>
                <p className="text-sm text-white/50 leading-relaxed max-w-sm">
                  Thanks for reaching out. We respond to all inquiries within 1–2 business days.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setForm({ name: "", email: "", topic: topics[0], message: "" }); }}
                className="text-xs tracking-widest uppercase text-white/40 hover:text-white border-b border-white/20 pb-0.5 hover:border-white transition-all"
              >
                Send Another
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="name"
                  required
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/10 text-white text-xs px-5 py-4 placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/10 text-white text-xs px-5 py-4 placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="relative w-full">
                <select
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white/70 text-xs px-5 py-4 focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer pr-12"
                >
                  {topics.map((t) => (
                    <option key={t} value={t} className="bg-[#111] text-white">{t}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-white/30">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
              <textarea
                name="message"
                required
                rows={7}
                placeholder="Your message…"
                value={form.message}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 text-white text-xs px-5 py-4 placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black text-xs font-bold tracking-[0.25em] uppercase py-4 hover:bg-white/90 transition-colors disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}

          {/* Side info */}
          <div className="space-y-12">
            {/* Direct contacts */}
            <div>
              <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-6">Direct Contact</p>
              <div className="space-y-5">
                {[
                  { label: "General", email: "hello@monvre.com" },
                  { label: "Orders & Returns", email: "returns@monvre.com" },
                  { label: "Press & Media", email: "press@monvre.com" },
                  { label: "Wholesale", email: "wholesale@monvre.com" },
                ].map((c) => (
                  <div key={c.label}>
                    <p className="text-[9px] tracking-widest uppercase text-white/25 mb-1">{c.label}</p>
                    <a href={`mailto:${c.email}`} className="text-sm text-white/55 hover:text-white transition-colors">
                      {c.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Response times */}
            <div className="border-t border-white/5 pt-10">
              <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-6">Response Times</p>
              <div className="space-y-3">
                {[
                  { type: "General Inquiries", time: "1–2 business days" },
                  { type: "Order Support", time: "Same day (Mon–Fri)" },
                  { type: "Press & Media", time: "2–3 business days" },
                ].map((r) => (
                  <div key={r.type} className="flex justify-between text-xs">
                    <span className="text-white/40">{r.type}</span>
                    <span className="text-white/60">{r.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
