import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SectionCard({ title, description, className, contentClassName, children }) {
  return (
    <Card className={cn("rounded-2xl", className)}>
      {(title || description) && (
        <CardHeader>
          {title ? <CardTitle className="text-base">{title}</CardTitle> : null}
          {description ? <p className="mt-1 text-sm text-[var(--dash-muted)]">{description}</p> : null}
        </CardHeader>
      )}
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  );
}
