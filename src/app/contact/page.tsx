"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const topics = ["General Inquiry", "Order Support", "Weekend Delivery", "Catering", "Special Requests"];

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
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-pink-400 mb-4">Get in Touch</p>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-pink-600 uppercase leading-none">
            Contact Us
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
              <div className="w-14 h-14 rounded-full border border-pink-200 flex items-center justify-center text-pink-500">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-pink-600 uppercase mb-3">Message Sent</h2>
                <p className="text-sm text-pink-400 leading-relaxed max-w-sm">
                  Thanks for reaching out! We&apos;ll get back to you as soon as possible, usually within a few hours.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setForm({ name: "", email: "", topic: topics[0], message: "" }); }}
                className="text-xs tracking-widest uppercase text-pink-400 hover:text-pink-600 border-b border-pink-100 pb-0.5 hover:border-pink-500 transition-all"
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
                  className="bg-white border border-pink-100 text-pink-700 text-xs px-5 py-4 placeholder:text-pink-300 focus:outline-none focus:border-pink-500 transition-colors"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  className="bg-white border border-pink-100 text-pink-700 text-xs px-5 py-4 placeholder:text-pink-300 focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>
              <div className="relative w-full">
                <select
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  className="w-full bg-white border border-pink-100 text-pink-700 text-xs px-5 py-4 focus:outline-none focus:border-pink-500 transition-colors appearance-none cursor-pointer pr-12"
                >
                  {topics.map((t) => (
                    <option key={t} value={t} className="bg-white text-pink-700">{t}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-pink-300">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
              <textarea
                name="message"
                required
                rows={7}
                placeholder="How can we help you? Tell us about your order or inquiry…"
                value={form.message}
                onChange={handleChange}
                className="w-full bg-white border border-pink-100 text-pink-700 text-xs px-5 py-4 placeholder:text-pink-300 focus:outline-none focus:border-pink-500 transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-500 text-white text-xs font-bold tracking-[0.25em] uppercase py-4 hover:bg-pink-600 transition-colors disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}

          {/* Side info */}
          <div className="space-y-12">
            {/* Direct contacts */}
            <div>
              <p className="text-[9px] tracking-[0.4em] uppercase text-pink-400 mb-6">Connect With Us</p>
              <div className="space-y-5">
                {[
                  { label: "Orders & Delivery", email: "orders@ajkitchen.com" },
                  { label: "General Questions", email: "hello@ajkitchen.com" },
                  { label: "Catering Inquiries", email: "catering@ajkitchen.com" },
                ].map((c) => (
                  <div key={c.label}>
                    <p className="text-[9px] tracking-widest uppercase text-pink-400 mb-1 font-black">{c.label}</p>
                    <a href={`mailto:${c.email}`} className="text-sm text-pink-600 hover:text-pink-800 transition-colors font-bold">
                      {c.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Area */}
            <div className="border-t border-pink-100 pt-10">
              <p className="text-[9px] tracking-[0.4em] uppercase text-pink-400 mb-6">Location & Hours</p>
              <div className="space-y-4">
                <div>
                   <p className="text-[9px] tracking-widest uppercase text-pink-400 mb-1 font-black">Serving</p>
                   <p className="text-sm text-pink-500 font-bold">Columbus, Ohio & Surrounding Areas</p>
                </div>
                <div>
                   <p className="text-[9px] tracking-widest uppercase text-pink-400 mb-1 font-black">Delivery Days</p>
                   <p className="text-sm font-bold text-pink-600">Saturday & Sunday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
