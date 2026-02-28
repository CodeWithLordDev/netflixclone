import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MetricCard({ label, value, delta }) {
  return (
    <Card className="animate-[fadeIn_.4s_ease]">
      <CardHeader>
        <CardTitle className="text-zinc-400">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-semibold text-zinc-100">{value}</p>
          <p className="flex items-center gap-1 text-xs text-emerald-400"><ArrowUpRight size={14} /> {delta}</p>
        </div>
      </CardContent>
    </Card>
  );
}
