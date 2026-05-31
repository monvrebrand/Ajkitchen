"use client";

import { useState, useEffect, useRef } from "react";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
  };
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect: (data: { address: string; city: string; state: string; zip: string }) => void;
  placeholder?: string;
  className?: string;
}

/** Format the street-only part from a Nominatim address object */
function toStreet(a: Suggestion["address"]): string {
  const parts: string[] = [];
  if (a.house_number) parts.push(a.house_number);
  if (a.road)         parts.push(a.road);
  return parts.join(" ") || "";
}

export default function AddressAutocomplete({ value, onChange, onSelect, placeholder, className }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx]   = useState(-1);
  const containerRef  = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Close on outside click ──────────────────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Fetch via internal proxy ────────────────────────── */
  const fetchSuggestions = async (raw: string) => {
    const q = raw.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`/api/address?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setSuggestions(data);
        setOpen(true);
      } else {
        setSuggestions([]);
        setOpen(false);
      }
    } catch (e) {
      console.error("Autocomplete error:", e);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  /* ── Input change ────────────────────────────────────── */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  /* ── Select — store only the street, not the full display_name ── */
  const handleSelect = (s: Suggestion) => {
    const street = toStreet(s.address);
    const city   = s.address.city || s.address.town || s.address.county || s.address.village || "";
    const state  = s.address.state || "";
    const zip    = s.address.postcode || "";

    // Fill address field with just the street (e.g. "12 South Walnut Street")
    const addressValue = street || s.display_name.split(",")[0].trim();
    onChange(addressValue);
    onSelect({ address: addressValue, city, state, zip });

    setOpen(false);
    setSuggestions([]);
    setActiveIdx(-1);
  };

  /* ── Keyboard navigation ─────────────────────────────── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (value.trim().length >= 2 && suggestions.length > 0) setOpen(true);
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {/* Loading spinner */}
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-3 h-3 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-[999] top-full left-0 right-0 mt-1 bg-white border border-pink-200 shadow-2xl max-h-80 overflow-y-auto rounded-md py-1">
          {suggestions.map((s, i) => {
            const street = toStreet(s.address);
            const city   = s.address.city || s.address.town || s.address.county || "";
            const state  = s.address.state || "";
            const zip    = s.address.postcode || "";

            // Main line: street number + road
            const mainLine = street || s.display_name.split(",")[0];
            // Sub line: city, state ZIP
            const subLine  = [city, state, zip].filter(Boolean).join(", ");

            return (
              <li
                key={i}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                onMouseEnter={() => setActiveIdx(i)}
                className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all border-b border-pink-50 last:border-0 ${
                  activeIdx === i ? "bg-pink-50 text-pink-700" : "hover:bg-pink-50/60"
                }`}
              >
                <span className="text-pink-400 text-base mt-0.5 flex-shrink-0">📍</span>
                <div className="min-w-0">
                  <p className="text-xs text-pink-700 font-black truncate">{mainLine}</p>
                  {subLine && (
                    <p className="text-[10px] text-pink-300 truncate mt-0.5 font-bold">{subLine}</p>
                  )}
                </div>
              </li>
            );
          })}
          <li className="px-4 py-2 flex items-center justify-end border-t border-pink-50 bg-pink-50/30">
            <span className="text-[8px] text-pink-200 tracking-widest uppercase font-bold">© OpenStreetMap</span>
          </li>
        </ul>
      )}

      {/* No results hint */}
      {open && !loading && value.trim().length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-[999] top-full left-0 right-0 mt-1 bg-white border border-pink-100 shadow-xl rounded-md px-4 py-4 text-center">
          <p className="text-[10px] text-pink-300 font-bold uppercase tracking-widest">No addresses found</p>
          <p className="text-[9px] text-pink-200 font-bold mt-1">Try typing your street number and name</p>
        </div>
      )}
    </div>
  );
}
