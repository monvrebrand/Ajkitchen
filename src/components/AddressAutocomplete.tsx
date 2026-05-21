"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Suggestion {
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect: (parts: { address: string; city: string; zip: string }) => void;
  className?: string;
  placeholder?: string;
}

export default function AddressAutocomplete({ value, onChange, onSelect, className = "", placeholder = "Street Address" }: Props) {
  const [suggestions, setSuggestions]   = useState<Suggestion[]>([]);
  const [open, setOpen]                 = useState(false);
  const [loading, setLoading]           = useState(false);
  const [activeIdx, setActiveIdx]       = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = useCallback(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
      setActiveIdx(-1);
    } catch { setSuggestions([]); }
    setLoading(false);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (s: Suggestion) => {
    const a = s.address;
    const road    = [a.house_number, a.road].filter(Boolean).join(" ");
    const street  = road || s.display_name.split(",")[0];
    const city    = a.city || a.town || a.village || a.county || a.state || "";
    const zip     = a.postcode || "";
    onSelect({ address: street, city, zip });
    setOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); handleSelect(suggestions[activeIdx]); }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className={className}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border border-white/20 border-t-white/50 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#111] border border-white/10 shadow-2xl max-h-64 overflow-y-auto">
          {suggestions.map((s, i) => {
            const parts = s.display_name.split(", ");
            const main  = parts.slice(0, 2).join(", ");
            const sub   = parts.slice(2).join(", ");
            return (
              <li key={i}
                onMouseDown={() => handleSelect(s)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-white/5 last:border-0 ${
                  activeIdx === i ? "bg-white/8" : "hover:bg-white/5"
                }`}>
                <span className="text-white/30 text-xs mt-0.5 flex-shrink-0">📍</span>
                <div className="min-w-0">
                  <p className="text-xs text-white/80 font-medium truncate">{main}</p>
                  {sub && <p className="text-[10px] text-white/30 truncate mt-0.5">{sub}</p>}
                </div>
              </li>
            );
          })}
          <li className="px-4 py-2 flex items-center gap-2 border-t border-white/5">
            <span className="text-[8px] text-white/15 tracking-widest uppercase">Powered by OpenStreetMap</span>
          </li>
        </ul>
      )}
    </div>
  );
}
