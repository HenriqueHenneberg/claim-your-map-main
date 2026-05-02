import { Minus, Plus } from "lucide-react";

export function MapControls({
  onZoomIn,
  onZoomOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div className="absolute bottom-4 right-4 z-20 grid overflow-hidden rounded-lg border border-white/10 bg-zinc-950/85 shadow-xl">
      <button
        type="button"
        onClick={onZoomIn}
        className="flex size-10 items-center justify-center text-zinc-200 hover:bg-white/10"
        aria-label="Aproximar mapa"
      >
        <Plus className="size-4" />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="flex size-10 items-center justify-center border-t border-white/10 text-zinc-200 hover:bg-white/10"
        aria-label="Afastar mapa"
      >
        <Minus className="size-4" />
      </button>
    </div>
  );
}
