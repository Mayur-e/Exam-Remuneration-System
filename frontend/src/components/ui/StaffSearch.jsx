/**
 * StaffSearch.jsx
 * 
 * Reusable autocomplete component that searches the staff_directory.
 * 
 * Props:
 *  - value: string  (current display value)
 *  - onChange: fn(name: string)  called when user types or selects
 *  - disabled: bool
 *  - placeholder: string
 *  - type: 'faculty' | 'all'
 *    'faculty' → only professors/visiting (for second examiner)
 *    'all'     → all staff (for add staff form)
 */
import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { Input } from "./input";
import { SearchIcon } from "../icons/logo";

export default function StaffSearch({
  value = "",
  onChange,
  disabled = false,
  placeholder = "Search name...",
  type = "faculty",
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Sync external value changes (e.g. when form is reset or loaded)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // update parent with typed text in real-time

    clearTimeout(debounceRef.current);
    if (!val.trim() || val.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/staff-directory/search`, {
          params: { q: val.trim(), type },
        });
        setResults(res.data || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const select = (person) => {
    setQuery(person.name);
    onChange(person.name);
    setResults([]);
    setOpen(false);
  };

  const clear = () => {
    setQuery("");
    onChange("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onChange={handleInput}
          autoComplete="off"
          className="pr-8"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
          {query && !disabled ? (
            <button
              type="button"
              onClick={clear}
              className="hover:text-foreground text-sm leading-none"
              tabIndex={-1}
            >
              ✕
            </button>
          ) : (
            <SearchIcon className="w-4 h-4" />
          )}
        </div>
      </div>

      {open && !disabled && (
        <div className="absolute z-50 left-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto min-w-full">
          {loading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">Searching…</div>
          ) : results.length > 0 ? (
            results.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => select(person)}
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b last:border-0 border-border group"
              >
                <div className="text-sm font-medium text-foreground group-hover:text-blue-700">
                  {person.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {person.designation}
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
