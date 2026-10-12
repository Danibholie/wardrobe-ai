import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background">
      <div className="flex flex-col items-center text-center space-y-4 max-w-sm">
        <div className="font-display-hero text-headline-md tracking-tight text-primary">
          Wardrobe AI
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant text-[11px]">
            Loading your canvas
          </span>
        </div>
        <div className="pt-2">
          <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
        </div>
      </div>
    </div>
  );
}
