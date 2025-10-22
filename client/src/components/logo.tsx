import { Search } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Search className="h-5 w-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold leading-none">Radar de</span>
        <span className="text-sm font-bold leading-none">Editais</span>
      </div>
    </div>
  );
}
