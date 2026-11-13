import * as React from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Box,
  Check,
  CircleAlert,
  Clock3,
  Droplets,
  Leaf,
  LockKeyhole,
  Milk,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { MilkConveyorMenu, type MilkOffer } from "@/components/ui/milk-conveyor-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PurchaseRequest = {
  reference: string;
  product: string;
  quantity: number;
  unit: string;
  hard_requirements: string[];
  deadline: string;
  timezone: string;
  fixture_notice: string;
};

type Preview = {
  id: string;
  request_reference: string;
  offer_id: string;
  supplier: string;
  quantity: number;
  unit: string;
  total: number;
  currency: string;
  spend_limit: number;
  policy: "allowed" | "approval_required";
  approval: "not_required" | "pending" | "approved" | "rejected";
  order_id: string | null;
  created_at: string;
  approval_reference?: string;
};

type AuditEvent = {
  at: string;
  event: string;
  preview_id?: string;
  offer_id?: string;
  order_id?: string;
  policy?: string;
  decision?: string;
};

type AppState = {
  request: PurchaseRequest;
  offers: MilkOffer[];
  previews: Preview[];
  orders: { order_id: string; status: string }[];
  audit: AuditEvent[];
};

type ToastMessage = { id: number; title: string; detail?: string; tone: "success" | "warning" | "error" };

const eur = (value: number, decimals = 0) => new Intl.NumberFormat("en-GB", {
  style: "currency", currency: "EUR", minimumFractionDigits: decimals, maximumFractionDigits: decimals,
}).format(value);

async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, body ? {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  } : undefined);
  const result = await response.json();
  if (!response.ok && !result.error) throw new Error("The demo service could not complete that action.");
  return result as T;
}

function BlockedOffer({ item, onInspect }: { item: MilkOffer; onInspect: (item: MilkOffer) => void }) {
  const reason = item.reasons.map(part => part.replaceAll("_", " ")).join(" · ");
  return (
    <article className="blocked-offer">
      <div className="blocked-symbol"><CircleAlert size={15} /></div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="blocked-name">{item.supplier}</span>
          <span className="offer-id">{item.id}</span>
        </div>
        <p className="blocked-reason">{item.product} · {reason}</p>
      </div>
      <Button size="sm" variant="secondary" onClick={() => onInspect(item)}>Inspect</Button>
    </article>
  );
}

function AuditLine({ event }: { event: AuditEvent }) {
  const isOrder = event.event.includes("commit");
  const isApproval = event.event.includes("approval");
  const Icon = isOrder ? PackageCheck : isApproval ? ShieldCheck : Sparkles;
  const detail = event.order_id ?? event.preview_id ?? event.offer_id ?? event.decision ?? event.policy ?? "";
  return (
    <li className="audit-line">
      <span className={cn("audit-icon", isOrder && "audit-icon-order", isApproval && "audit-icon-approval")}><Icon size={14} /></span>
      <span className="min-w-0 flex-1">
        <span className="audit-title">{event.event.replaceAll("_", " ")}</span>
        <span className="audit-detail">{detail}{event.policy ? ` · ${event.policy.replaceAll("_", " ")}` : ""}</span>
      </span>
      <time className="audit-time">{new Date(event.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
    </li>
  );
}

export default function App() {
  const [data, setData] = React.useState<AppState | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [spendLimit, setSpendLimit] = React.useState(1300);
  const [preview, setPreview] = React.useState<Preview | null>(null);
  const [offerView, setOfferView] = React.useState<"belt" | "list">("belt");
  const [paused, setPaused] = React.useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [busy, setBusy] = React.useState(false);
  const [blockedMessage, setBlockedMessage] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<ToastMessage | null>(null);
  const toastSequence = React.useRef(0);
  const toastTimer = React.useRef<number | null>(null);

  const notify = React.useCallback((title: string, detail?: string, tone: ToastMessage["tone"] = "success") => {
    const id = ++toastSequence.current;
    setToast({ id, title, detail, tone });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = React.useCallback(async (restore = false) => {
    const next = await api<AppState>("/api/state");
    setData(next);
    if (restore) {
      const latest = next.previews.at(-1) ?? null;
      setPreview(latest);
      setSelectedId(latest?.offer_id ?? next.offers.find(item => item.feasible)?.id ?? null);
      if (latest) setSpendLimit(latest.spend_limit);
    } else {
      setSelectedId(current => current ?? next.offers.find(item => item.feasible)?.id ?? null);
    }
  }, []);

  React.useEffect(() => {
    void refresh(true).catch(error => notify("Could not connect to Guru", error.message, "error"));
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, [notify, refresh]);

  const offer = data?.offers.find(item => item.id === selectedId) ?? null;
  const feasible = data?.offers.filter(item => item.feasible) ?? [];
  const blocked = data?.offers.filter(item => !item.feasible) ?? [];
  const allowed = !!offer && offer.total <= spendLimit;
  const committed = !!preview?.order_id;
  const decisionApproved = !!preview && (preview.policy === "allowed" || preview.approval === "approved");

  const pickOffer = (item: MilkOffer) => {
    if (committed) return notify("This order is already committed", "Reset the demo to start a new order.", "warning");
    setSelectedId(item.id);
    setPreview(null);
    setBlockedMessage(null);
  };

  const inspectOffer = async (item: MilkOffer) => {
    setBusy(true);
    try {
      const result = await api<Preview | { error: string; reasons: string[] }>("/api/preview", {
        offer_id: item.id, spend_limit: spendLimit,
      });
      if ("error" in result) {
        setBlockedMessage(`${item.supplier}: ${result.reasons.map(reason => reason.replaceAll("_", " ")).join(" · ")}. The request remains unchanged.`);
        notify("Offer blocked by policy", result.reasons.map(reason => reason.replaceAll("_", " ")).join(" · "), "warning");
      }
    } catch (error) {
      notify("Policy check failed", error instanceof Error ? error.message : "Unknown error", "error");
    } finally {
      setBusy(false);
    }
  };

  const createPreview = async () => {
    if (!offer || preview) return;
    setBusy(true);
    setBlockedMessage(null);
    try {
      const result = await api<Preview | { error: string }>("/api/preview", { offer_id: offer.id, spend_limit: spendLimit });
      if ("error" in result) return notify("Preview could not be created", result.error.replaceAll("_", " "), "error");
      setPreview(result);
      await refresh();
      notify(result.policy === "allowed" ? "Authority check passed" : "Human approval required", `Preview ${result.id}`,
        result.policy === "allowed" ? "success" : "warning");
    } catch (error) {
      notify("Preview failed", error instanceof Error ? error.message : "Unknown error", "error");
    } finally {
      setBusy(false);
    }
  };

  const decide = async (decision: "approve" | "reject") => {
    if (!preview) return;
    setBusy(true);
    try {
      const result = await api<Preview | { error: string }>("/api/approve", { preview_id: preview.id, decision });
      if ("error" in result) return notify("Decision could not be recorded", result.error.replaceAll("_", " "), "error");
      setPreview(result);
      await refresh();
      notify(decision === "approve" ? "Approval recorded" : "Preview rejected",
        decision === "approve" ? `Approval ${result.approval_reference ?? ""} · bound to ${result.id}` : "No order was placed.",
        decision === "approve" ? "success" : "warning");
    } catch (error) {
      notify("Approval action failed", error instanceof Error ? error.message : "Unknown error", "error");
    } finally {
      setBusy(false);
    }
  };

  const commitOrder = async () => {
    if (!preview || !decisionApproved) return;
    setBusy(true);
    try {
      const result = await api<{ order_id: string; error?: string; status: string }>("/api/commit", { preview_id: preview.id });
      if (result.error) return notify("Order remains blocked", result.error.replaceAll("_", " "), "error");
      setPreview(current => current ? { ...current, order_id: result.order_id } : current);
      await refresh();
      notify("Synthetic order confirmed", result.order_id);
    } catch (error) {
      notify("Order could not be committed", error instanceof Error ? error.message : "Unknown error", "error");
    } finally {
      setBusy(false);
    }
  };

  const resetDemo = async () => {
    setBusy(true);
    try {
      await api<{ ok: boolean }>("/api/reset", {});
      setPreview(null); setBlockedMessage(null); setSpendLimit(1300); setPaused(false);
      await refresh();
      notify("Demo session reset", "Ready for a fresh purchasing flow.");
    } catch (error) {
      notify("Could not reset demo", error instanceof Error ? error.message : "Unknown error", "error");
    } finally {
      setBusy(false);
    }
  };

  if (!data) {
    return <main className="loading-screen"><div className="loading-mark"><Milk size={27} /></div><p>Connecting to Guru</p><span>Loading the local offer book…</span></main>;
  }

  return (
    <div className="guru-app" id="top">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Guru home"><span className="brand-mark"><Droplets size={19} /></span><span><strong>guru</strong><small>trusted trade agents</small></span></a>
        <nav className="main-nav" aria-label="Main navigation"><a className="nav-active" href="#top">Workspace</a><a href="#offers">Offers</a><a href="#authority">Authority</a><a href="#activity">Activity</a></nav>
        <div className="top-actions"><span className="synthetic-pill"><i />Synthetic mode</span><Button variant="ghost" size="sm" disabled={busy} onClick={() => void resetDemo()}><RotateCcw size={14} />Reset</Button></div>
      </header>

      <main className="page-shell">
        <section className="hero-panel">
          <div className="hero-content">
            <div className="hero-kicker"><span className="hero-kicker-dot" />PURCHASE REQUEST · HELSINKI</div>
            <h1>Your agent finds the milk.<br /><em>Guru checks the order.</em></h1>
            <p>Right product. Fixed price. Within the buyer’s authority. The decision trail stays clear from request to order.</p>
            <div className="hero-meta"><span>{data.request.reference}</span><i />{data.request.deadline}<i />{data.request.timezone}</div>
          </div>
          <div className="hero-milk" aria-hidden="true"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-glow" /><div className="hero-carton"><Milk size={53} strokeWidth={1.2} /></div><span className="hero-number">01 / 04</span></div>
          <div className="hero-stats"><div><b>{String(data.offers.length).padStart(2, "0")}</b><span>offers found</span></div><div><b>{String(feasible.length).padStart(2, "0")}</b><span>meet request</span></div><div><b>{String(blocked.length).padStart(2, "0")}</b><span>blocked</span></div></div>
        </section>

        <div className="progress-rail" aria-label="Purchase progress">
          <ProgressStep number="01" title="Request" complete /><ProgressLine /><ProgressStep number="02" title="Compare" complete />
          <ProgressLine /><ProgressStep number="03" title="Authority" complete={decisionApproved} active={!!preview && !decisionApproved} />
          <ProgressLine /><ProgressStep number="04" title="Order" complete={committed} active={decisionApproved && !committed} />
        </div>

        <div className="main-grid">
          <div className="left-column">
            <section className="surface offer-surface" id="offers">
              <div className="section-heading">
                <div><div className="eyebrow">THE SHORTLIST</div><h2>Offers on the belt</h2><p>Pick a carton. Policy checks the request before any order can move.</p></div>
                <div className="view-toggle" role="group" aria-label="Offer layout"><button className={cn(offerView === "belt" && "selected")} onClick={() => setOfferView("belt")} aria-pressed={offerView === "belt"}><Milk size={13} />Belt</button><button className={cn(offerView === "list" && "selected")} onClick={() => setOfferView("list")} aria-pressed={offerView === "list"}><Box size={13} />List</button><span>{feasible.length} valid</span></div>
              </div>
              <div className="request-strip">
                <RequestFact label="PRODUCT" value={data.request.product} icon={<Milk size={14} />} />
                <RequestFact label="VOLUME" value={`${data.request.quantity.toLocaleString()} ${data.request.unit}`} icon={<Droplets size={14} />} />
                <RequestFact label="HARD REQUIREMENT" value={data.request.hard_requirements.join(", ")} icon={<Leaf size={14} />} green />
                <RequestFact label="DELIVERY BY" value={data.request.deadline} icon={<Truck size={14} />} />
              </div>
              {offerView === "belt" ? (
                <MilkConveyorMenu items={data.offers} selectedId={selectedId} quantity={data.request.quantity}
                  paused={paused} onPausedChange={setPaused} onSelect={pickOffer} onInspect={inspectOffer} />
              ) : (
                <div className="offer-list">
                  {feasible.map((item, index) => <OfferRow key={item.id} item={item} selected={item.id === selectedId} best={index === 0} onSelect={() => pickOffer(item)} />)}
                </div>
              )}
              {blocked.length > 0 && <div className="blocked-section"><div className="blocked-heading"><div><span>Outside the request</span><small>Hard requirements are never softened</small></div><span>{blocked.length} blocked</span></div><div className="blocked-list">{blocked.map(item => <BlockedOffer key={item.id} item={item} onInspect={inspectOffer} />)}</div></div>}
              {blockedMessage && <div className="blocked-message"><CircleAlert size={15} /><span>{blockedMessage}</span><button aria-label="Dismiss blocked notice" onClick={() => setBlockedMessage(null)}><X size={14} /></button></div>}
            </section>

            <section className="surface activity-surface" id="activity">
              <div className="activity-heading"><div><div className="eyebrow">SESSION RECORD</div><h2>Decision trail</h2><p>Request → decision → approval → order</p></div><span className="event-count">{String(data.audit.length).padStart(2, "0")} EVENTS</span></div>
              {data.audit.length ? <ol className="audit-list">{[...data.audit].reverse().map((event, index) => <AuditLine event={event} key={`${event.at}-${index}`} />)}</ol> : <div className="empty-audit"><Sparkles size={15} /><span>Your actions will appear here as a readable audit trail.</span></div>}
            </section>
          </div>

          <aside className="surface authority-surface" id="authority">
            <div className="authority-heading"><div><div className="eyebrow">BUYER DELEGATION</div><h2>Check before commit</h2><p>Policy runs outside the agent.</p></div><PolicyPill allowed={allowed} preview={preview} /></div>
            {offer && <div className="selected-offer"><span className="selected-pack"><Milk size={20} /></span><span className="selected-info"><b>{offer.supplier}</b><small>{data.request.quantity.toLocaleString()} L · {offer.id}</small></span><span className="selected-total">{eur(offer.total)}<small>fixed total</small></span></div>}
            <div className="limit-heading"><label htmlFor="spend-limit">Delegated spend limit</label><strong>{eur(spendLimit)}</strong></div>
            <input id="spend-limit" className="spend-slider" type="range" min="1000" max="1500" step="50" value={spendLimit}
              onChange={event => { setSpendLimit(Number(event.target.value)); setPreview(null); }} aria-label="Delegated spend limit" />
            <div className="slider-labels"><span>€1,000</span><span>€1,500</span></div>
            <div className={cn("policy-result", allowed ? "policy-ok" : "policy-review")}>
              <span className="policy-result-icon">{allowed ? <BadgeCheck size={17} /> : <LockKeyhole size={16} />}</span>
              <span><b>{allowed ? "Within delegated authority" : "Human approval required"}<small>{allowed ? "The total is within the current limit." : `Exceeds the limit by ${eur((offer?.total ?? 0) - spendLimit)}.`}</small></b></span>
              <strong>{eur(offer?.total ?? 0)}</strong>
            </div>
            {!preview ? <Button className="wide-action" disabled={!offer || busy} onClick={() => void createPreview()}>
              {busy ? <span className="spinner" /> : allowed ? <ShieldCheck size={16} /> : <ArrowUpRight size={16} />}
              {allowed ? "Create order preview" : "Request human approval"}<ArrowRight className="action-arrow" size={16} />
            </Button> : <PreviewCard preview={preview} busy={busy} onDecision={decision => void decide(decision)} onCommit={() => void commitOrder()} />}
            <div className="authority-footnote"><ShieldCheck size={14} /><span>Approval is bound to this exact preview. A changed offer needs a new decision.</span></div>
            <div className="policy-divider" />
            <div className="policy-facts"><span><Wallet size={13} />Spend authority</span><span><Clock3 size={13} />Delivery cutoff</span><span><Leaf size={13} />Hard product needs</span></div>
          </aside>
        </div>
        <footer className="app-footer"><span><strong>Guru</strong> · Trusted Trade Agents</span><span>Local prototype · Synthetic offers and orders · No Valio system connection</span></footer>
      </main>

      {toast && <div className={cn("toast", `toast-${toast.tone}`)} role="status" aria-live="polite" key={toast.id}><span className="toast-mark">{toast.tone === "error" ? <X size={13} /> : toast.tone === "warning" ? <CircleAlert size={14} /> : <Check size={14} />}</span><span><b>{toast.title}</b>{toast.detail && <small>{toast.detail}</small>}</span></div>}
    </div>
  );
}

function ProgressStep({ number, title, complete = false, active = false }: { number: string; title: string; complete?: boolean; active?: boolean }) {
  return <div className={cn("progress-step", complete && "complete", active && "active")}><span>{complete ? <Check size={12} /> : number}</span><b>{title}</b></div>;
}

function ProgressLine() { return <i className="progress-line" />; }

function RequestFact({ label, value, icon, green = false }: { label: string; value: string; icon: React.ReactNode; green?: boolean }) {
  return <div className="request-fact"><span className={cn("fact-icon", green && "fact-green")}>{icon}</span><span><small>{label}</small><b>{value}</b></span></div>;
}

function OfferRow({ item, selected, best, onSelect }: { item: MilkOffer; selected: boolean; best: boolean; onSelect: () => void }) {
  const fill = Math.min(100, Math.round(item.available_l / 1000 * 100));
  return <button className={cn("offer-row", selected && "is-selected")} onClick={onSelect} aria-pressed={selected}>
    <span className="offer-radio">{selected && <i />}</span><span className="offer-row-main"><span><b>{item.supplier}</b>{best && <em>BEST FIT</em>}<small>{item.id}</small></span><span className="offer-row-tags"><i><Check size={10} />Lactose-free</i><i>{item.pack_l} L case</i><i>Arrives {item.delivery_date}</i></span></span>
    <span className="offer-stock"><span>{item.available_l.toLocaleString()} L in stock</span><i><b style={{ width: `${fill}%` }} /></i></span><span className="offer-row-price"><b>{eur(item.total)}</b><small>{eur(item.price_per_l, 2)} / L</small></span>
  </button>;
}

function PolicyPill({ allowed, preview }: { allowed: boolean; preview: Preview | null }) {
  if (preview?.order_id) return <span className="policy-pill pill-success"><PackageCheck size={12} />Confirmed</span>;
  if (preview?.approval === "pending") return <span className="policy-pill pill-review"><Clock3 size={12} />Needs approval</span>;
  if (preview?.approval === "rejected") return <span className="policy-pill pill-blocked"><X size={12} />Rejected</span>;
  if (preview?.approval === "approved") return <span className="policy-pill pill-success"><Check size={12} />Approved</span>;
  return <span className={cn("policy-pill", allowed ? "pill-success" : "pill-review")}>{allowed ? <BadgeCheck size={12} /> : <ArrowDownRight size={12} />}{allowed ? "Within authority" : "Approval needed"}</span>;
}

function PreviewCard({ preview, busy, onDecision, onCommit }: {
  preview: Preview;
  busy: boolean;
  onDecision: (decision: "approve" | "reject") => void;
  onCommit: () => void;
}) {
  const isPending = preview.approval === "pending";
  const isRejected = preview.approval === "rejected";
  const isCommitted = !!preview.order_id;
  const canCommit = preview.policy === "allowed" || preview.approval === "approved";
  return <div className={cn("preview-card", isPending && "preview-pending", isRejected && "preview-rejected", isCommitted && "preview-confirmed")}>
    <div className="preview-head"><span>{isCommitted ? "ORDER CONFIRMATION" : isPending ? "APPROVAL CHECKPOINT" : isRejected ? "DECISION RECORDED" : "ORDER PREVIEW"}</span><span>{preview.id}</span></div>
    <div className="preview-summary"><span>{preview.quantity.toLocaleString()} {preview.unit}<small>{preview.supplier}</small></span><b>{eur(preview.total)}</b></div>
    <p className="preview-copy">{isCommitted ? "Synthetic order recorded. A retry of this preview returns the same order." : isRejected ? "Approval rejected. This preview cannot be committed." : isPending ? "This total is above delegation. A person must approve this exact preview before ordering." : preview.approval === "approved" ? "Human approval recorded for this exact preview." : "The amount is within delegated authority and ready to commit."}</p>
    {preview.order_id && <div className="order-reference"><PackageCheck size={15} /><span>Order reference</span><b>{preview.order_id}</b></div>}
    {isPending && <div className="preview-actions"><Button variant="secondary" disabled={busy} onClick={() => onDecision("reject")}><X size={14} />Reject</Button><Button disabled={busy} onClick={() => onDecision("approve")}><Check size={14} />Approve exact preview</Button></div>}
    {!isPending && !isRejected && !isCommitted && canCommit && <Button className="wide-action commit-action" disabled={busy} onClick={onCommit}>{busy ? <span className="spinner" /> : <ShoppingBasket size={16} />}Commit synthetic order<ArrowRight className="action-arrow" size={16} /></Button>}
    {isCommitted && <span className="confirmed-chip"><Check size={12} />Synthetic order confirmed</span>}
  </div>;
}
