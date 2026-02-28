import { Button } from "@/components/ui/button";

export default function PageHeader({ title, description, ctaLabel, onClick }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">{title}</h1>
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      </div>
      {ctaLabel ? <Button onClick={onClick}>{ctaLabel}</Button> : null}
    </div>
  );
}
