"use client";

import { useState, useEffect } from "react";

type Ticket = {
  id: string; user_email: string; subject: string; message: string;
  status: "Open" | "Urgent" | "Replied" | "Resolved"; created_at: string; reply: string | null;
};

const statusColor: Record<string, string> = {
  Open: "bg-white/8 text-white/50",
  Urgent: "bg-red-500/20 text-red-400",
  Replied: "bg-blue-500/15 text-blue-400",
  Resolved: "bg-green-500/15 text-green-400",
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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tighter text-white/90 uppercase">Support Inbox</h1>
        <p className="text-xs text-white/30 mt-0.5">
          {tickets.filter(t => t.status === "Open" || t.status === "Urgent").length} open · {tickets.length} total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[9px] tracking-[0.2em] uppercase px-3 py-2 border transition-all rounded-sm
              ${filter === f ? "border-white bg-white text-black" : "border-white/10 text-white/40 hover:border-white/30 hover:text-white"}`}
          >
            {f}
            {f !== "All" && (
              <span className="ml-1.5 opacity-60">({tickets.filter(t => t.status === f).length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-4">
        {/* Ticket list */}
        <div className="bg-white/[0.03] border border-white/5 rounded-sm overflow-hidden">
          {filtered.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={`w-full text-left px-4 py-4 border-b border-white/[0.04] transition-colors
                ${selected?.id === t.id ? "bg-white/[0.06]" : "hover:bg-white/[0.02]"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono text-white/35">{t.id.slice(0, 8)}</span>
                <span className={`text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm ${statusColor[t.status]}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-xs font-medium text-white/75 truncate mb-0.5">{t.subject}</p>
              <p className="text-[10px] text-white/30 truncate">{t.user_email} · {new Date(t.created_at).toLocaleDateString()}</p>
            </button>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center text-white/20 text-[10px] tracking-widest uppercase">No tickets</div>
          )}
          {loading && (
            <div className="py-12 text-center text-white/20 text-[10px] tracking-widest uppercase animate-pulse">Loading tickets…</div>
          )}
        </div>

        {/* Ticket detail */}
        {selected ? (
          <div className="bg-white/[0.03] border border-white/5 rounded-sm flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-mono text-white/30 mb-1">ID: {selected.id}</p>
                  <h2 className="text-sm font-bold text-white/85">{selected.subject}</h2>
                  <p className="text-xs text-white/35 mt-1">{selected.user_email} · {new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 flex-wrap flex-shrink-0">
                  {(["Open", "Urgent", "Replied", "Resolved"] as Ticket["status"][]).map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`text-[8px] tracking-widest uppercase px-2 py-1 rounded-sm border transition-all
                        ${selected.status === s ? statusColor[s] + " border-transparent" : "border-white/10 text-white/30 hover:border-white/25"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="px-6 py-5 flex-1">
              <div className="bg-white/[0.03] border border-white/5 rounded-sm p-5 mb-6">
                <p className="text-[9px] uppercase tracking-widest text-white/30 mb-2">Message</p>
                <p className="text-sm text-white/60 leading-relaxed">{selected.message}</p>
              </div>

              {selected.reply && (
                <div className="bg-blue-500/[0.03] border border-blue-500/10 rounded-sm p-5 mb-6">
                  <p className="text-[9px] uppercase tracking-widest text-blue-400/50 mb-2">Your Reply</p>
                  <p className="text-sm text-blue-100/70 leading-relaxed">{selected.reply}</p>
                </div>
              )}

              {/* Reply box */}
              <div>
                <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 mb-3">Reply</p>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={5}
                  placeholder="Type your reply…"
                  className="w-full bg-white/5 border border-white/8 text-white text-xs px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors resize-none mb-3"
                />
                {replySent && (
                  <p className="text-green-400 text-[10px] tracking-widest uppercase mb-3">Reply sent ✓</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={sendReply}
                    disabled={!reply.trim()}
                    className="bg-white text-black text-[10px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-white/90 transition-colors disabled:opacity-40"
                  >
                    Send Reply
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, "Resolved")}
                    className="border border-white/10 text-white/40 hover:text-white text-[10px] tracking-widest uppercase px-6 py-2.5 transition-all hover:border-white/30"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/5 rounded-sm flex items-center justify-center">
            <p className="text-white/20 text-[10px] tracking-widest uppercase">Select a ticket</p>
          </div>
        )}
      </div>
    </div>
  );
}
