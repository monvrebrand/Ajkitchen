"use client";

import { useState, useEffect } from "react";

type Ticket = {
  id: string; user_email: string; subject: string; message: string;
  status: "Open" | "Urgent" | "Replied" | "Resolved"; created_at: string; reply: string | null;
};

const statusColor: Record<string, string> = {
  Open: "bg-pink-50 text-pink-400 border-pink-100",
  Urgent: "bg-red-50 text-red-600 border-red-200",
  Replied: "bg-blue-50 text-blue-600 border-blue-200",
  Resolved: "bg-green-50 text-green-600 border-green-200",
};

const filters = ["All", "Open", "Urgent", "Replied", "Resolved"];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [replySent, setReplySent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/tickets")
      .then(res => res.json())
      .then(data => {
        setTickets(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "All" ? tickets : tickets.filter(t => t.status === filter);

  const updateStatus = async (id: string, status: Ticket["status"]) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    
    await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    
    const newStatus = "Replied";
    setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status: newStatus, reply } : t));
    setSelected(prev => prev ? { ...prev, status: newStatus, reply } : null);
    
    await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, status: newStatus, reply })
    });

    setReplySent(true);
    setReply("");
    setTimeout(() => setReplySent(false), 2500);
  };

  return (
    <div className="space-y-8 bg-white p-2">
      <div>
        <h1 className="text-2xl font-black tracking-tighter text-pink-600 uppercase">Kitchen Support</h1>
        <p className="text-xs text-pink-300 mt-1 font-bold">
          {tickets.filter(t => t.status === "Open" || t.status === "Urgent").length} inquiries needing kitchen attention
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[9px] font-black tracking-[0.2em] uppercase px-4 py-2 border-2 transition-all rounded-sm
              ${filter === f ? "border-pink-500 bg-pink-500 text-white shadow-md" : "border-pink-100 text-pink-300 hover:border-pink-300 hover:text-pink-600"}`}
          >
            {f}
            {f !== "All" && (
              <span className="ml-1.5 opacity-60">({tickets.filter(t => t.status === f).length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[340px_1fr] gap-6">
        <div className="bg-white border border-pink-100 rounded-sm overflow-hidden shadow-sm">
          {filtered.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={`w-full text-left px-5 py-5 border-b border-pink-50 transition-colors
                ${selected?.id === t.id ? "bg-pink-50/50" : "hover:bg-pink-50/20"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono text-pink-300 font-bold uppercase tracking-widest">{t.id.slice(0, 8)}</span>
                <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded-sm border ${statusColor[t.status]}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-xs font-black text-pink-700 truncate mb-1 uppercase tracking-tight">{t.subject}</p>
              <p className="text-[10px] text-pink-400 font-bold truncate">{t.user_email}</p>
            </button>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center text-pink-200 text-[10px] tracking-widest uppercase font-black">All Clear</div>
          )}
          {loading && (
            <div className="py-20 text-center text-pink-200 text-[10px] tracking-widest uppercase animate-pulse font-black">Checking Tickets…</div>
          )}
        </div>

        {selected ? (
          <div className="bg-white border border-pink-100 rounded-sm flex flex-col shadow-sm">
            <div className="px-6 py-6 border-b border-pink-50 bg-pink-50/10">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <p className="text-[9px] font-mono text-pink-300 mb-1 font-black">ORDER/ISSUE ID: {selected.id}</p>
                  <h2 className="text-lg font-black text-pink-700 uppercase tracking-tight">{selected.subject}</h2>
                  <p className="text-xs text-pink-400 font-bold mt-1 uppercase">{selected.user_email} • {new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 flex-wrap flex-shrink-0">
                  {(["Open", "Urgent", "Replied", "Resolved"] as Ticket["status"][]).map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`text-[8px] font-black tracking-widest uppercase px-3 py-1.5 rounded-sm border-2 transition-all
                        ${selected.status === s ? statusColor[s] + " shadow-sm" : "border-pink-100 text-pink-300 hover:border-pink-200 hover:text-pink-500"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-8 flex-1 space-y-8">
              <div className="bg-pink-50/20 border border-pink-100 rounded-sm p-6 shadow-inner">
                <p className="text-[9px] uppercase tracking-[0.3em] text-pink-300 mb-4 font-black">Customer Message</p>
                <p className="text-sm text-pink-700 font-bold leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              {selected.reply && (
                <div className="bg-blue-50/30 border border-blue-100 rounded-sm p-6">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-blue-400 mb-4 font-black">Kitchen Reply</p>
                  <p className="text-sm text-blue-700 font-bold leading-relaxed whitespace-pre-wrap">{selected.reply}</p>
                </div>
              )}

              <div className="pt-4 border-t border-pink-50">
                <p className="text-[9px] uppercase tracking-[0.3em] text-pink-300 mb-4 font-black">{selected.reply ? "Update Reply" : "Send Reply to Customer"}</p>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Type your response from the kitchen…"
                  rows={6}
                  className="w-full bg-white border-2 border-pink-100 text-pink-700 text-sm px-5 py-4 focus:outline-none focus:border-pink-500 transition-colors font-bold rounded-sm shadow-sm resize-none mb-4"
                />
                <button
                  onClick={sendReply}
                  disabled={!reply.trim()}
                  className="bg-pink-500 text-white text-[10px] font-black tracking-widest uppercase px-10 py-4 hover:bg-pink-600 transition-all rounded-sm shadow-lg disabled:opacity-50"
                >
                  {replySent ? "Message Sent ✓" : "Send Response"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-pink-50 bg-pink-50/10 rounded-sm flex items-center justify-center p-20 text-center">
            <div>
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-pink-100">
                  <span className="text-2xl">📥</span>
               </div>
               <p className="text-pink-300 text-xs tracking-widest uppercase font-black">Select an inquiry to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
