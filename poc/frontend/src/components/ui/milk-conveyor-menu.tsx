import * as React from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MilkOffer = {
  id: string;
  supplier: string;
  product: string;
  attributes: string[];
  pack_l: number;
  price_per_l: number;
  currency: string;
  available_l: number;
  delivery_date: string;
  source: string;
  required_packs: number;
  total: number;
  feasible: boolean;
  reasons: string[];
};

export type MilkConveyorLabels = {
  previous: string;
  next: string;
  pause: string;
  play: string;
  pick: string;
};

export type MilkConveyorMenuProps = Omit<React.ComponentProps<"section">, "onSelect"> & {
  items: MilkOffer[];
  selectedId: string | null;
  quantity: number;
  onSelect: (item: MilkOffer) => void;
  onInspect: (item: MilkOffer) => void;
  speed?: number;
  paused?: boolean;
  onPausedChange?: (paused: boolean) => void;
  labels?: Partial<MilkConveyorLabels>;
};

const eur = (value: number) => new Intl.NumberFormat("en-GB", {
  style: "currency", currency: "EUR", maximumFractionDigits: 0,
}).format(value);

const defaultLabels: MilkConveyorLabels = {
  previous: "Previous carton",
  next: "Next carton",
  pause: "Pause belt",
  play: "Play belt",
  pick: "Pick this offer",
};

function CartonArt({ item, index }: { item: MilkOffer; index: number }) {
  const id = React.useId().replaceAll(":", "");
  const shade = item.attributes.includes("lactose-free")
    ? ["#88aa57", "#6b8f72", "#a7bd71", "#769775"][index % 4]
    : "#b66d5d";
  const label = item.attributes.includes("lactose-free") ? "LACTOSE FREE" : "STANDARD MILK";

  return (
    <svg className="milk-pack" viewBox="0 0 140 185" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffef8" /><stop offset="1" stopColor="#e8eadc" /></linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#d9ddce" /><stop offset="1" stopColor="#b9c2b1" /></linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#faffef" /><stop offset="1" stopColor="#dce8c5" /></linearGradient>
      </defs>
      <ellipse cx="73" cy="169" rx="38" ry="8" fill="#26392b" opacity=".12" />
      <path d="M38 53 53 28 91 28 106 52 114 57 114 153Q114 160 107 160H40Q34 160 34 153V58Z" fill={`url(#${id}-side)`} stroke="#bbc4b5" strokeWidth="1.2" />
      <path d="M34 58 49 35 86 35 98 55 98 158H40Q34 158 34 152Z" fill={`url(#${id}-front)`} stroke="#d4d8cc" strokeWidth="1.2" />
      <path d="M34 58 49 35 86 35 98 55 72 66Z" fill={`url(#${id}-top)`} stroke="#d2dac8" strokeWidth="1" />
      <path d="m86 35 20 17 8 5-16-2Z" fill="#c4ccbb" />
      <path d="M34 94H98V126H34Z" fill={shade} />
      <path d="M98 94H114V126H98Z" fill="#526c49" opacity=".93" />
      <path d="M34 94H98" stroke="#f8f9ed" strokeWidth="1.5" opacity=".75" />
      <text x="66" y="82" textAnchor="middle" fill="#526447" fontSize="9" fontWeight="800" letterSpacing="2" fontFamily="Arial,sans-serif">GURU</text>
      <text x="66" y="108" textAnchor="middle" fill="#fffef4" fontSize="6.4" fontWeight="800" letterSpacing=".55" fontFamily="Arial,sans-serif">{label}</text>
      <text x="66" y="119" textAnchor="middle" fill="#f8f8e9" fontSize="5.5" fontWeight="700" letterSpacing="1.7" fontFamily="Arial,sans-serif">FRESH MILK</text>
      <text x="65" y="140" textAnchor="middle" fill="#7a8574" fontSize="7" fontWeight="700" fontFamily="Arial,sans-serif">{item.pack_l} × 1 L</text>
      <path d="M53 28 62 18 84 18 91 28Z" fill="#f2f5e9" stroke="#c9d0c2" strokeWidth="1" />
      <path d="M62 18 64 12H81L84 18Z" fill={shade} />
      <rect x="66" y="8" width="14" height="5" rx="1.5" fill="#526c49" />
      <path d="M106 65v17" stroke="#fff" strokeWidth="2" opacity=".6" strokeLinecap="round" />
    </svg>
  );
}

export function MilkConveyorMenu({
  items,
  selectedId,
  quantity,
  onSelect,
  onInspect,
  speed = 0.22,
  paused: pausedProp,
  onPausedChange,
  labels,
  className,
  ...sectionProps
}: MilkConveyorMenuProps) {
  const text = { ...defaultLabels, ...labels };
  const stageRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const offsetRef = React.useRef(-Math.PI / 2);
  const dragRef = React.useRef<{ pointerId: number; x: number } | null>(null);
  const reducedMotion = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const [internalPaused, setInternalPaused] = React.useState(reducedMotion);
  const [dragging, setDragging] = React.useState(false);
  const paused = pausedProp ?? internalPaused;
  const selectedIndex = Math.max(0, items.findIndex(item => item.id === selectedId));
  const chosen = items.find(item => item.id === selectedId) ?? null;

  const setPaused = React.useCallback((value: boolean) => {
    setInternalPaused(value);
    onPausedChange?.(value);
  }, [onPausedChange]);

  React.useEffect(() => {
    let frame = 0;
    let last = 0;
    const tick = (time: number) => {
      if (!last) last = time;
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;
      if (!paused && !dragRef.current) offsetRef.current = (offsetRef.current + dt * speed) % (Math.PI * 2);
      const stage = stageRef.current;
      if (stage) {
        const { width, height } = stage.getBoundingClientRect();
        const rx = Math.min(width * 0.38, 275);
        const ry = Math.min(height * 0.27, 82);
        itemRefs.current.forEach((node, index) => {
          if (!node) return;
          const angle = offsetRef.current + index * (Math.PI * 2 / Math.max(items.length, 1));
          const depth = (Math.sin(angle) + 1) / 2;
          const x = Math.cos(angle) * rx;
          const y = Math.sin(angle) * ry;
          const scale = 0.6 + depth * 0.39;
          node.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale}) rotateY(${Math.cos(angle) * 10}deg)`;
          node.style.zIndex = String(4 + Math.round(depth * 12));
        });
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [items.length, paused, speed]);

  const seek = React.useCallback((direction: -1 | 1) => {
    if (!items.length) return;
    const nextIndex = (selectedIndex + direction + items.length) % items.length;
    offsetRef.current = -Math.PI / 2 - nextIndex * (Math.PI * 2 / items.length);
    setPaused(true);
    const item = items[nextIndex];
    if (item.feasible) onSelect(item);
    else onInspect(item);
  }, [items, onInspect, onSelect, selectedIndex, setPaused]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    offsetRef.current += (event.clientX - dragRef.current.x) * 0.009;
    dragRef.current.x = event.clientX;
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
  };

  return (
    <section className={cn("milk-conveyor", className)} {...sectionProps}>
      <div
        ref={stageRef}
        className={cn("belt-stage", dragging && "is-dragging")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label="Interactive milk carton offer conveyor. Drag the belt to browse and select a carton."
      >
        <div className="belt-track" aria-hidden="true" />
        <div className="belt-island" aria-hidden="true"><span>GURU</span></div>
        <div className="pickup-gate" aria-hidden="true"><span>Pick an offer</span><i /></div>
        {items.map((item, index) => {
          const selected = item.id === selectedId;
          const rejected = !item.feasible;
          const reason = item.reasons[0]?.replaceAll("_", " ") ?? "blocked";
          return (
            <button
              ref={node => { itemRefs.current[index] = node; }}
              key={item.id}
              type="button"
              className={cn("belt-item", selected && "is-selected", rejected && "is-blocked")}
              onClick={() => rejected ? onInspect(item) : (setPaused(true), onSelect(item))}
              aria-label={`${item.supplier}, ${item.product}, ${eur(item.total)}${rejected ? `, blocked: ${reason}` : `, ${text.pick}`}`}
              aria-pressed={selected}
              style={{ left: "50%", top: "50%" }}
            >
              {rejected && <span className="carton-flag">{reason}</span>}
              <CartonArt item={item} index={index} />
              <span className="carton-supplier">{item.supplier}</span>
              <span className="carton-price">{eur(item.total)} · {item.pack_l} L cases</span>
            </button>
          );
        })}
      </div>
      <div className="belt-controls">
        <Button variant="secondary" size="icon" aria-label={text.previous} title={text.previous} onClick={() => seek(-1)}><ArrowLeft size={15} /></Button>
        <Button variant="secondary" size="icon" aria-label={paused ? text.play : text.pause} title={paused ? text.play : text.pause} onClick={() => setPaused(!paused)}>{paused ? <Play size={14} /> : <Pause size={14} />}</Button>
        <span className="belt-hint">{dragging ? "Release to coast" : paused ? "Belt paused" : "Drag anywhere to spin"}</span>
        <Button variant="secondary" size="icon" aria-label={text.next} title={text.next} onClick={() => seek(1)}><ArrowRight size={15} /></Button>
        <Button variant="ghost" size="icon" aria-label="Reset belt position" title="Reset belt position" onClick={() => { offsetRef.current = -Math.PI / 2; setPaused(false); }}><RotateCcw size={14} /></Button>
      </div>
      <div className="belt-picked"><span>Selected</span><b>{chosen?.supplier ?? "Choose an offer"}</b><i />{chosen ? <span>{selectedIndex + 1} / {items.length}</span> : null}<ArrowDown size={12} aria-hidden="true" />
      </div>
      <p className="belt-caption">{quantity.toLocaleString()} L requested · Feasible and blocked offers stay on the belt. Policy never relaxes hard requirements.</p>
    </section>
  );
}
