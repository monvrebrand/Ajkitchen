"use client";

import { useState, useEffect, useRef } from "react";

type Product = {
  id: string; name: string; category: string; description: string;
  price: number; sizes: string[]; image: string; in_stock: boolean; quantity: number; featured: boolean;
};

const EMPTY_FORM = { name: "", category: "Main Meals", description: "", price: "", image: "", in_stock: true, quantity: "0", featured: false };
const CATEGORIES = ["Main Meals", "Sides", "Drinks"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<"add" | "edit" | null>(null);
  const [editing, setEditing]   = useState<Product | null>(null);
  const [form, setForm]         = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{ text: string; ok: boolean } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const close = () => { setModal(null); setEditing(null); setMsg(null); setUploadProgress(0); };
  const setF = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  /* ── File upload handler ─────────────────────────────────── */
  const uploadFile = async (file: File) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setMsg({ text: "Only JPG, PNG, WEBP or GIF files allowed.", ok: false });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMsg({ text: "File too large — max 10 MB.", ok: false });
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setMsg(null);

    const fd = new FormData();
    fd.append("file", file);

    // Simulate progress
    const tick = setInterval(() => setUploadProgress(p => Math.min(p + 15, 85)), 200);

    try {
      const res  = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      clearInterval(tick);
      if (res.ok && data.url) {
        setUploadProgress(100);
        setF("image", data.url);
        setTimeout(() => setUploadProgress(0), 800);
      } else {
        setMsg({ text: data.error || "Upload failed.", ok: false });
        setUploadProgress(0);
      }
    } catch {
      clearInterval(tick);
      setMsg({ text: "Upload failed. Try again.", ok: false });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = ""; // reset so same file can be re-selected
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  /* ── Save ────────────────────────────────────────────────── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) { setMsg({ text: "Please upload a meal photo.", ok: false }); return; }
    setSaving(true);
    const payload: Record<string, unknown> = {
      ...(editing ? { id: editing.id } : {
        id: form.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()
      }),
      name: form.name, category: form.category, description: form.description,
      price: Number(form.price), image: form.image,
      quantity: Number((form as any).quantity ?? 0),
      featured: (form as any).featured ?? false,
      sizes: ["Regular", "Large"],
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
      setMsg({ text: editing ? "Menu item updated." : "Meal added to menu.", ok: true });
      load();
      setTimeout(close, 1500);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this item from menu?")) return;
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

  const inp = "w-full bg-pink-50/30 border border-pink-100 text-pink-700 text-xs px-4 py-3 placeholder:text-pink-200 focus:outline-none focus:border-pink-500 transition-colors font-bold rounded-sm";

  return (
    <div className="space-y-8 bg-white p-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-pink-600 uppercase">Menu Management</h1>
          <p className="text-xs text-pink-300 mt-1 font-bold">
            {loading ? "Kitchen Busy…" : (
              <>
                {products.filter(p => p.in_stock).length} active meals
                {" · "}{products.filter(p => !p.in_stock).length} unavailable
              </>
            )}
          </p>
        </div>
        <button onClick={openAdd}
          className="bg-pink-500 text-white text-[10px] font-black tracking-[0.2em] uppercase px-5 py-3 hover:bg-pink-600 transition-all flex items-center gap-2 rounded-sm shadow-md">
          <span>+</span> Add New Meal
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-72 bg-pink-50/20 animate-pulse border border-pink-50 rounded-sm" />)}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="border-2 border-dashed border-pink-100 py-20 text-center rounded-sm">
          <p className="text-pink-300 text-sm mb-6 font-bold">The kitchen is empty.</p>
          <button onClick={openAdd} className="bg-pink-500 text-white text-xs font-black tracking-widest uppercase px-10 py-4 rounded-sm shadow-lg">
            Add First Meal
          </button>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p.id} className={`bg-white border border-pink-100 overflow-hidden transition-all shadow-sm rounded-sm ${!p.in_stock ? "opacity-60" : ""}`}>
              <div className="relative h-48 bg-pink-50 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.style.display = "none"; }} />
                {!p.in_stock && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest border-2 border-red-500 px-3 py-1 bg-white">Sold Out</span>
                  </div>
                )}
                {p.featured && (
                   <span className="absolute top-3 left-3 text-[8px] font-black bg-pink-500 text-white px-2 py-1 uppercase tracking-widest rounded-sm">Bestseller</span>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                   <p className="text-[9px] text-pink-300 font-black uppercase tracking-widest">{p.category}</p>
                   <p className="text-xs font-black text-pink-600">$ {p.price}</p>
                </div>
                <h3 className="text-sm font-black text-pink-700 uppercase mb-3 truncate">{p.name}</h3>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 text-[9px] font-black tracking-widest uppercase py-2 bg-pink-50 text-pink-400 hover:bg-pink-100 hover:text-pink-600 transition-colors border border-pink-100 rounded-sm">
                    Edit
                  </button>
                  <button onClick={() => handleToggleStock(p)}
                    className={`flex-1 text-[9px] font-black tracking-widest uppercase py-2 transition-colors border rounded-sm ${p.in_stock ? "border-red-100 text-red-300 hover:bg-red-50 hover:text-red-500" : "border-green-100 text-green-300 hover:bg-green-50 hover:text-green-500"}`}>
                    {p.in_stock ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    className="w-10 flex items-center justify-center border border-pink-100 text-pink-200 hover:text-red-500 transition-colors rounded-sm">
                    {deleting === p.id ? "…" : "×"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-[1000] bg-pink-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={close}>
          <div className="bg-white border border-pink-100 p-8 w-full max-w-lg rounded-md shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 border-b border-pink-50 pb-4">
              <h2 className="text-xl font-black text-pink-600 uppercase tracking-tighter">{editing ? "Update Meal" : "New Menu Item"}</h2>
              <button onClick={close} className="text-pink-200 hover:text-pink-500">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] tracking-widest uppercase text-pink-300 mb-2 font-black">Meal Name</label>
                  <input required value={form.name} onChange={e => setF("name", e.target.value)} placeholder="e.g. Classic Jollof" className={inp} />
                </div>
                <div>
                  <label className="block text-[9px] tracking-widest uppercase text-pink-300 mb-2 font-black">Category</label>
                  <select value={form.category} onChange={e => setF("category", e.target.value)} className={inp + " appearance-none cursor-pointer"}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-[9px] tracking-widest uppercase text-pink-300 mb-2 font-black">Price ($)</label>
                <input required type="number" step="0.01" value={form.price} onChange={e => setF("price", e.target.value)} placeholder="15.00" className={inp} />
              </div>

              {/* ── Image Upload Zone ─────────────────────────────── */}
              <div>
                <label className="block text-[9px] tracking-widest uppercase text-pink-300 mb-2 font-black">
                  Meal Photo
                </label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {form.image ? (
                  /* ── Preview state ── */
                  <div className="relative border border-pink-100 rounded-sm overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.image} alt="Meal preview" className="w-full h-52 object-cover" />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-pink-900/0 group-hover:bg-pink-900/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-pink-600 text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-sm shadow-lg hover:bg-pink-50"
                      >
                        ↑ Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => setF("image", "")}
                        className="bg-red-500 text-white text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-sm shadow-lg hover:bg-red-600"
                      >
                        ✕ Remove
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                      <p className="text-white text-[9px] font-black tracking-widest uppercase opacity-80">Photo uploaded ✓</p>
                    </div>
                  </div>
                ) : (
                  /* ── Drop zone ── */
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all
                      ${dragOver ? "border-pink-500 bg-pink-50/50 scale-[1.01]" : "border-pink-100 hover:border-pink-300 hover:bg-pink-50/20"}`}
                  >
                    {uploading ? (
                      <div className="space-y-3">
                        <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto" />
                        <p className="text-[10px] text-pink-400 font-black tracking-widest uppercase">Uploading…</p>
                        {/* Progress bar */}
                        <div className="w-full bg-pink-100 rounded-full h-1.5">
                          <div
                            className="bg-pink-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-pink-300 font-bold">{uploadProgress}%</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center mx-auto border-2 border-pink-100">
                          <svg className="w-6 h-6 text-pink-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-pink-500 font-black tracking-widest uppercase">
                            {dragOver ? "Drop it!" : "Click to upload"}
                          </p>
                          <p className="text-[9px] text-pink-300 font-bold mt-1">or drag & drop your photo here</p>
                          <p className="text-[9px] text-pink-200 font-bold mt-1">JPG · PNG · WEBP · GIF · max 10 MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[9px] tracking-widest uppercase text-pink-300 mb-2 font-black">Recipe / Description</label>
                <textarea rows={4} value={form.description} onChange={e => setF("description", e.target.value)} placeholder="Describe the flavors and ingredients…" className={inp + " resize-none"} />
              </div>

              <div className="flex items-center gap-6 p-4 bg-pink-50/20 border border-pink-50 rounded-sm">
                <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" checked={form.featured} onChange={e => setF("featured", e.target.checked)} className="w-4 h-4 rounded border-pink-200 text-pink-600 focus:ring-pink-500" />
                   <span className="text-[10px] font-black uppercase text-pink-400 group-hover:text-pink-600 transition-colors">Bestseller / Featured</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" checked={form.in_stock} onChange={e => setF("in_stock", e.target.checked)} className="w-4 h-4 rounded border-pink-200 text-pink-600 focus:ring-pink-500" />
                   <span className="text-[10px] font-black uppercase text-pink-400 group-hover:text-pink-600 transition-colors">Currently Available</span>
                </label>
              </div>

              {msg && (
                <p className={`text-xs text-center font-black p-3 rounded-sm ${msg.ok ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{msg.text}</p>
              )}

              <button type="submit" disabled={saving || uploading}
                className="w-full bg-pink-500 text-white text-xs font-black tracking-[0.2em] uppercase py-5 hover:bg-pink-600 transition-all disabled:opacity-50 shadow-lg rounded-sm mt-4 flex items-center justify-center gap-3">
                {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {editing ? "Update Menu Item" : "Add to Kitchen"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
