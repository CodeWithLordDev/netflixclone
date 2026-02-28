"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ContentTable({ initialData }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return initialData.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
  }, [initialData, query]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <Input placeholder="Search content..." value={query} onChange={(e) => setQuery(e.target.value)} className="mb-4" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-zinc-400">
              <th className="py-2">Title</th>
              <th className="py-2">Type</th>
              <th className="py-2">Status</th>
              <th className="py-2">Featured</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row._id || row.id} className="border-b border-zinc-900">
                <td className="py-3 text-zinc-200">{row.title}</td>
                <td className="py-3 text-zinc-300">{row.contentType}</td>
                <td className="py-3"><Badge>{row.status}</Badge></td>
                <td className="py-3 text-zinc-300">{row.featured ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
