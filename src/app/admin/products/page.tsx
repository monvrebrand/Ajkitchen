"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Product = {
  id: string; name: string; category: string; description: string;
  price: number; sizes: string[]; image: string; in_stock: boolean; quantity: number; featured: boolean;
};

const EMPTY_FORM = { name: "", category: "Tops", description: "", price: "", image: "/products/placeholder.jpg", in_stock: true, quantity: "0", featured: false };
const CATEGORIES = ["Tops"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<"add" | "edit" | null>(null);
  const [editing, setEditing]   = useState<Product | null>(null);
  const [form, setForm]         = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{ text: string; ok: boolean } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load products:", e);
    }
    if (initial) setLoading(false);
  };

  useEffect(() => {
    load(true);
    const interval = setInterval(() => load(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setMsg(null); setModal("add"); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, category: p.category, description: p.description || "", price: String(p.price), image: p.image, in_stock: p.in_stock, quantity: String(p.quantity ?? 0), featured: p.featured ?? false });
    setMsg(null); setModal("edit");
  };
  const close = () => { setModal(null); setEditing(null); setMsg(null); };
  const setF = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = {
      ...(editing ? { id: editing.id } : {
        id: form.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()
      }),
      name: form.name, category: form.category, description: form.description,
      price: Number(form.price), image: form.image,
      quantity: Number((form as any).quantity ?? 0),
      featured: (form as any).featured ?? false,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    };

    const res = await fetch("/api/admin/products", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok || data.error) {
      setMsg({ text: data.error || "Failed to save.", ok: false });
    } else {
      setMsg({ text: editing ? "Product updated." : "Product added.", ok: true });
      load();
      setTimeout(close, 1500);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(id);
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    load();
  };

  const handleToggleStock = async (p: Product) => {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, in_stock: !p.in_stock }),
    });
    load();
  };

  const inp = "w-full bg-white/5 border border-white/10 text-white text-xs px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white/90 uppercase">Products</h1>
          <p className="text-xs text-white/30 mt-0.5">
            {loading ? "Loading…" : (
              <>
                {products.filter(p => p.in_stock).length} active
                {" · "}{products.filter(p => !p.in_stock).length} out of stock
                {" · "}{products.reduce((sum, p) => sum + (p.quantity ?? 0), 0)} total units
              </>
            )}
          </p>
        </div>
        <button onClick={openAdd}
          className="bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase px-5 py-2.5 hover:bg-white/90 transition-colors flex items-center gap-2">
          <span>+</span> Add Product
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-72 bg-white/[0.03] animate-pulse border border-white/5" />)}
        </div>
      )}

      {/* Product grid */}
      {!loading && products.length === 0 && (
        <div className="border border-white/5 py-20 text-center">
          <p className="text-white/30 text-sm mb-4">No products yet</p>
          <button onClick={openAdd} className="bg-white text-black text-xs font-bold tracking-widest uppercase px-8 py-3">
            Add First Product
          </button>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className={`bg-white/[0.03] border border-white/5 overflow-hidden transition-opacity ${!p.in_stock ? "opacity-50" : ""}`}>
              <div className="relative h-44 bg-[#0d0d0d]">
                <Image src={p.image} alt={p.name} fill className="object-cover"
                  onError={() => {}} />
                <span className={`absolute top-3 right-3 text-[8px] font-bold tracking-widest uppercase px-2 py-1 ${
                  p.in_stock ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {p.in_stock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <div className="p-4">
                <p className="text-[9px] tracking-widest uppercase text-white/30 mb-1">{p.category}</p>
                <p className="text-sm font-semibold text-white/85 mb-1 truncate">{p.name}</p>
                <p className="text-xs text-white/60 font-medium">GHS {p.price}</p>
                <div className="flex items-center gap-3 mt-1 mb-4">
                  <p className="text-[9px] text-white/30">
                    <span className="text-white/60 font-semibold">{p.quantity ?? 0}</span> units in stock
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 text-[9px] tracking-widests uppercase py-2 border border-white/10 text-white/50 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all">
                    ✎ Edit
                  </button>
                  <button onClick={() => handleToggleStock(p)}
                    className="flex-1 text-[9px] tracking-widests uppercase py-2 border border-white/10 text-white/35 hover:text-white hover:border-white/30 transition-all">
                    {p.in_stock ? "Mark OOS" : "Restock"}
                  </button>
                  <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                    className="text-[9px] tracking-widests uppercase px-3 py-2 border border-red-500/20 text-red-500/40 hover:text-red-400 hover:border-red-500/40 transition-all">
                    {deleting === p.id ? "…" : "✕"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={close}>
          <div className="bg-[#0a0a0a] border border-white/10 p-8 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[9px] tracking-[0.3em] uppercase text-white/30">
                {modal === "add" ? "Add New Product" : `Edit — ${editing?.name}`}
              </p>
              <button onClick={close} className="text-white/30 hover:text-white">✕</button>
            </div>

            {msg && (
              <p className={`text-xs mb-4 flex items-center gap-2 ${msg.ok ? "text-green-400" : "text-red-400"}`}>
                {msg.ok ? "✓" : "✕"} {msg.text}
              </p>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {[
                { label: "Product Name", key: "name", type: "text", placeholder: "e.g. Series 02 Tee" },
                { label: "Price (GHS)", key: "price", type: "number", placeholder: "e.g. 155" },
                { label: "Stock Quantity", key: "quantity", type: "number", placeholder: "e.g. 50" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[9px] tracking-widests uppercase text-white/30 mb-1.5">{f.label}</label>
                  <input type={f.type} required placeholder={f.placeholder} value={(form as any)[f.key]}
                    onChange={e => setF(f.key, e.target.value)} className={inp} />
                </div>
              ))}

              <div>
                <label className="block text-[9px] tracking-widests uppercase text-white/30 mb-1.5">Product Image Attachment</label>
                {form.image && form.image !== "/products/placeholder.jpg" && (
                  <div className="mb-3 border border-white/10 bg-[#0d0d0d] overflow-hidden" style={{ aspectRatio: "4/5", width: "100%" }}>
                    <img src={form.image} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="relative bg-white/5 border border-white/10 text-white text-xs px-4 py-3 hover:border-white/20 transition-colors flex items-center justify-between cursor-pointer">
                  <span className="text-white/40 truncate">{form.image && form.image !== "/products/placeholder.jpg" ? "Change Image" : "Upload / Attach Image"}</span>
                  <span className="text-white/20 text-[9px] uppercase tracking-widest">Auto-Fit</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const src = reader.result as string;
                        const img = new window.Image();
                        img.onload = () => {
                          // Canvas target: 800×1000 (4:5) with 8% padding on each side
                          const W = 800, H = 1000;
                          const pad = 0.08;
                          const maxW = W * (1 - pad * 2);
                          const maxH = H * (1 - pad * 2);
                          const scale = Math.min(maxW / img.width, maxH / img.height);
                          const dw = img.width * scale;
                          const dh = img.height * scale;
                          const dx = (W - dw) / 2;
                          const dy = (H - dh) / 2;
                          const canvas = document.createElement("canvas");
                          canvas.width = W;
                          canvas.height = H;
                          const ctx = canvas.getContext("2d")!;
                          ctx.fillStyle = "#0a0a0a";
                          ctx.fillRect(0, 0, W, H);
                          ctx.drawImage(img, dx, dy, dw, dh);
                          setF("image", canvas.toDataURL("image/jpeg", 0.92));
                        };
                        img.src = src;
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] tracking-widests uppercase text-white/30 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setF("description", e.target.value)} rows={3}
                  className={inp + " resize-none"} placeholder="Short product description" />
              </div>

              <div>
                <label className="block text-[9px] tracking-widests uppercase text-white/30 mb-1.5">Category</label>
                <div className="relative w-full">
                  <select
                    value={form.category}
                    onChange={e => setF("category", e.target.value)}
                    className={inp + " appearance-none cursor-pointer pr-10"}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/30">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setF("in_stock", !form.in_stock)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form.in_stock ? "bg-green-500" : "bg-white/10"}`}>
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ transform: form.in_stock ? "translateX(20px)" : "translateX(2px)" }}
                  />
                </button>
                <span className="text-xs text-white/40">{form.in_stock ? "In Stock" : "Out of Stock"}</span>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setF("featured", !(form as any).featured)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${(form as any).featured ? "bg-amber-500" : "bg-white/10"}`}>
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ transform: (form as any).featured ? "translateX(20px)" : "translateX(2px)" }}
                  />
                </button>
                <span className="text-xs text-white/40">{(form as any).featured ? "⭐ Featured on Homepage" : "Not Featured"}</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-white text-black text-xs font-bold tracking-widests uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />Saving…</> : (modal === "add" ? "Add Product" : "Save Changes")}
                </button>
                <button type="button" onClick={close}
                  className="px-5 border border-white/10 text-white/40 hover:text-white text-xs uppercase tracking-widests transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
