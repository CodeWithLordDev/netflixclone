import { Skeleton } from "@/components/ui/skeleton";

export default function PageSkeleton({ cards = 5, withTable = false }) {
  return (
    <div className="space-y-5">
      <div className={`grid gap-4 sm:grid-cols-2 ${cards > 4 ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
        {Array.from({ length: cards }).map((_, idx) => (
          <Skeleton key={idx} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      {withTable ? <Skeleton className="h-96 rounded-2xl" /> : null}
    </div>
  );
}
