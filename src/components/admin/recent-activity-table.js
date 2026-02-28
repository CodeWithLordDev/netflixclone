import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecentActivityTable({ activities = [] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-400">
                <th className="py-3 pr-4">Actor</th>
                <th className="py-3 pr-4">Action</th>
                <th className="py-3 pr-4">Entity</th>
                <th className="py-3 pr-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((item) => (
                <tr key={item.id} className="border-b border-zinc-900 text-zinc-200">
                  <td className="py-3 pr-4">{item.actor}</td>
                  <td className="py-3 pr-4"><Badge>{item.action}</Badge></td>
                  <td className="py-3 pr-4">{item.entity}</td>
                  <td className="py-3 pr-4 text-zinc-400">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
