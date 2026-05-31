"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const term = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(term) ||
      u.full_name.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term))
    );
  });

  return (
    <div className="space-y-6 bg-white p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-pink-600 uppercase">User Management</h1>
          <p className="text-xs text-pink-300 mt-0.5 font-bold">{users.length} registered customers</p>
        </div>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, email or phone…"
        className="w-full bg-white border-2 border-pink-100 text-pink-700 text-xs px-4 py-3 placeholder:text-pink-200 focus:outline-none focus:border-pink-500 transition-colors font-bold rounded-sm shadow-sm"
      />

      <div className="bg-white border border-pink-100 rounded-sm overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-pink-200 text-xs tracking-widest uppercase animate-pulse font-black">
            Fetching Users…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-pink-50 bg-pink-50/20">
                  {["Name", "Email", "Phone", "Joined"].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-[9px] tracking-widest uppercase text-pink-300 font-black">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-pink-50/50 hover:bg-pink-50/20 transition-colors">
                    <td className="px-4 py-3.5 text-pink-600 font-bold">{u.full_name || `${u.first_name} ${u.last_name}` || "Unnamed"}</td>
                    <td className="px-4 py-3.5 text-pink-500 font-medium">{u.email}</td>
                    <td className="px-4 py-3.5 text-pink-700 font-bold">{u.phone || <span className="text-pink-200 font-normal italic">Not provided</span>}</td>
                    <td className="px-4 py-3.5 text-pink-300 font-bold">
                      {new Date(u.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-pink-200 text-xs tracking-widest uppercase font-black">
                No users found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
