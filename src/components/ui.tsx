"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ButtonHTMLAttributes, type ReactNode, type RefObject } from "react";
import { animate, motion, useDragControls, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import Image from "next/image";
import { ChevronRight, ChevronUp, X } from "lucide-react";
import { assetPaths } from "@/config/assets";
import type { CrowdLevel } from "@/data/sample-congestion";

export const SPRING = { type: "spring", stiffness: 380, damping: 32, mass: 0.9 } as const;
export const ICON_STROKE = 1.5;
export const haptic = () => { try { navigator.vibrate?.(12); } catch { /* Unsupported. */ } };

export function Button({ children, className = "", variant = "primary", disabled, onPointerDown, onPointerUp, onPointerCancel, onPointerLeave, onKeyDown, onKeyUp, onBlur, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion();
  if (variant !== "primary") {
    return <button className={`ui-button ui-button--${variant} ${className}`} disabled={disabled}
      onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel} onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown} onKeyUp={onKeyUp} onBlur={onBlur} {...props}>{children}</button>;
  }
  const active = Boolean(pressed && !disabled);
  return <button className={`ui-button ui-button--primary ${className}`} disabled={disabled} data-pressed={active}
    onPointerDown={(event) => { if (!disabled) setPressed(true); onPointerDown?.(event); }}
    onPointerUp={(event) => { setPressed(false); onPointerUp?.(event); }}
    onPointerCancel={(event) => { setPressed(false); onPointerCancel?.(event); }}
    onPointerLeave={(event) => { setPressed(false); onPointerLeave?.(event); }}
    onKeyDown={(event) => { if (!disabled && (event.key === " " || event.key === "Enter")) setPressed(true); onKeyDown?.(event); }}
    onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") setPressed(false); onKeyUp?.(event); }}
    onBlur={(event) => { setPressed(false); onBlur?.(event); }}
    {...props}>
    <motion.span className="ui-button-face" animate={{ y: active ? 3 : 0 }} transition={reduced ? { duration: 0 } : SPRING}>
      {children}
    </motion.span>
  </button>;
}

export function Segmented<T extends string>({ value, options, onChange, label }: {
  value: T; options: { id: T; label: string }[]; onChange: (value: T) => void; label: string;
}) {
  return <div className="segmented" role="group" aria-label={label}>
    {options.map(option => <button type="button" key={option.id} aria-pressed={value === option.id} onClick={() => onChange(option.id)}>{option.label}</button>)}
  </div>;
}

const crowdGlyph: Record<CrowdLevel, string> = { calm: "●", moderate: "▲", busy: "■", unknown: "?" };
/** Colour is always paired with a distinct shape and text. */
export function CrowdBadge({ level, label }: { level: CrowdLevel; label: string }) {
  return <span className={`crowd-badge crowd-badge--${level}`}><span aria-hidden="true">{crowdGlyph[level]}</span>{label}</span>;
}

/** Modal confirmation for destructive or deliberate actions only. */
export function ConfirmDialog({ open, onClose, title, closeLabel, children, className = "" }: {
  open: boolean; onClose: () => void; title: string; closeLabel: string; children: ReactNode; className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    dialog.showModal();
    headingRef.current?.focus();
    return () => dialog.close();
  }, [open]);
  return <dialog ref={dialogRef} className={`confirm-dialog ${className}`} aria-labelledby={titleId}
    onCancel={(event) => { event.preventDefault(); onClose(); }}>
    {open && <>
      <div className="confirm-heading">
        <h2 ref={headingRef} tabIndex={-1} id={titleId}>{title}</h2>
        <button type="button" className="icon-button" aria-label={closeLabel} onClick={onClose}><X size={20} strokeWidth={ICON_STROKE} /></button>
      </div>
      {children}
    </>}
  </dialog>;
}

export type Snap = "peek" | "half" | "full";
const SNAP_FRACTION: Record<Snap, number> = { peek: 0.18, half: 0.52, full: 0.9 };
const SNAP_MIN_PEEK = 184; // Keep in sync with --peek-h in globals.css.
const order: Snap[] = ["peek", "half", "full"];

/** Non-modal map sheet with three snap points. Dragging starts from the handle area so the body can scroll. */
export function SnapSheet({ snap, onSnap, header, children, labels }: {
  snap: Snap; onSnap: (snap: Snap) => void; header: ReactNode; children: ReactNode;
  labels: { expand: string; collapse: string; region: string };
}) {
  const ref = useRef<HTMLElement>(null);
  const [parentHeight, setParentHeight] = useState(0);
  const reduced = useReducedMotion();
  const controls = useDragControls();
  const y = useMotionValue(0);
  const full = parentHeight * SNAP_FRACTION.full;
  const offsetFor = (target: Snap) => {
    const height = target === "peek" ? Math.max(parentHeight * SNAP_FRACTION.peek, SNAP_MIN_PEEK) : parentHeight * SNAP_FRACTION[target];
    return Math.max(0, full - height);
  };
  useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(() => setParentHeight(parent.clientHeight));
    observer.observe(parent);
    setParentHeight(parent.clientHeight);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    if (!parentHeight) return;
    const target = offsetFor(snap);
    if (reduced) { y.set(target); return; }
    const animation = animate(y, target, SPRING);
    return () => animation.stop();
    // offsetFor only depends on parentHeight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap, parentHeight, reduced, y]);
  const next = order[(order.indexOf(snap) + 1) % order.length];
  return <motion.section ref={ref} className="snap-sheet" data-snap={snap} aria-label={labels.region}
    style={{ height: full || undefined, y }}
    drag="y" dragListener={false} dragControls={controls} dragMomentum={false}
    dragConstraints={{ top: 0, bottom: offsetFor("peek") }} dragElastic={0.08}
    onDragEnd={(_, info) => {
      const projected = y.get() + info.velocity.y * 0.18;
      const nearest = order.reduce((best, candidate) =>
        Math.abs(offsetFor(candidate) - projected) < Math.abs(offsetFor(best) - projected) ? candidate : best, snap);
      if (nearest === snap) animate(y, offsetFor(snap), reduced ? { duration: 0 } : SPRING);
      else onSnap(nearest);
    }}>
    <div className="snap-sheet-grip" onPointerDown={(event) => controls.start(event)}>
      <button type="button" className="snap-sheet-handle" aria-expanded={snap !== "peek"}
        aria-label={next === "peek" ? labels.collapse : labels.expand} onClick={() => onSnap(next)}>
        <span aria-hidden="true" />
        <ChevronUp size={16} strokeWidth={ICON_STROKE} aria-hidden="true" data-direction={next === "peek" ? "down" : "up"} />
      </button>
      {header}
    </div>
    <div className="snap-sheet-body" data-scrollable={snap === "full"}>{children}</div>
  </motion.section>;
}

export type FoxState = "idle" | "walking" | "arrived" | "reward" | "warning";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
/** True only on the client once the viewer is known not to prefer reduced motion; the server render stays still. */
function useMotionAllowed() {
  const reduced = useReducedMotion();
  const allowed = useSyncExternalStore(subscribeReducedMotion, () => !window.matchMedia(REDUCED_MOTION_QUERY).matches, () => false);
  return allowed && reduced !== true;
}

/**
 * Pixel sprites share a 64 px frame. The idle sheet holds three breathing frames.
 * `animated` swaps in the looping GIF (one moving fox per visible section); under reduced motion it stays the static PNG.
 * `still` stops the CSS breathing, bob and pulse so a nearby animated fox is the only one moving.
 * `framed={false}` drops the gold ring for inline placements in rows, notes and buttons.
 */
export function FoxAvatar({ state = "idle", size = 44, animated = false, still = false, framed = true }: {
  state?: FoxState; size?: number; animated?: boolean; still?: boolean; framed?: boolean;
}) {
  const motionAllowed = useMotionAllowed();
  const gif = animated && motionAllowed ? assetPaths.mascotAnimated?.[state] : undefined;
  return <span className={`fox-avatar fox-avatar--${state}`} data-art={Boolean(assetPaths.mascot)} data-animated={Boolean(gif)}
    data-still={still || (animated && !gif)} data-framed={framed} style={{ width: size, height: size }} aria-hidden="true">
    {gif ? <Image className="fox-gif" src={gif} alt="" width={size} height={size} unoptimized draggable={false} /> :
    assetPaths.mascot ? <span className="fox-sprite" style={{ backgroundImage: `url(${assetPaths.mascot[state]})` }} /> :
      <svg viewBox="0 0 44 44" fill="none" strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="22" cy="22" r="20" className="fox-ring" />
        <circle cx="22" cy="22" r="14.5" className="fox-face" />
        {state === "warning" ? <path d="M16 22h12" className="fox-mark" /> :
          state === "reward" || state === "arrived" ? <path d="m16 22 4 4 8-8" className="fox-mark" /> :
            <circle cx="22" cy="22" r="5" className="fox-dot" />}
      </svg>}
  </span>;
}

/**
 * Whether an element is on screen, for keeping one moving fox per visible section.
 * Starts as in view so a lower-priority fox stays still until the observer reports. Change `watchKey`
 * when the observed element is replaced (for example, a different walk) to re-attach the observer.
 */
export function useInView(ref: RefObject<Element | null>, active = true, watchKey = "") {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!active || !element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, active, watchKey]);
  return active && inView;
}

/** One bead per stop: gold when stamped, ringed for the next stop. Shared by the walk HUD and the Missions hero. */
export function StopBeads({ total, done, label }: { total: number; done: number; label: string }) {
  return <span className="stop-beads" role="img" aria-label={label}>
    {Array.from({ length: total }, (_, index) => <span key={index} data-done={index < done} data-next={index === done} />)}
  </span>;
}

/** Empty segment or list: the idle fox beside a short explanation (visuals.md §3.7). */
export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-note"><FoxAvatar state="idle" size={40} /><p>{children}</p></div>;
}

/**
 * Slide-to-confirm (visuals.md F1). Pointer users drag the knob to the end; keyboard and
 * assistive-technology users press Enter/Space or activate the knob (a click with
 * `detail === 0`). A plain pointer tap does not confirm, so it can't fire by accident.
 */
export function SlideToConfirm({ label, sublabel, hint, onConfirm, disabled = false }: {
  label: string; sublabel?: ReactNode; hint: string; onConfirm: () => void; disabled?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [max, setMax] = useState(0);
  const x = useMotionValue(0);
  const fill = useTransform(x, value => value + 52);
  const reduced = useReducedMotion();
  const done = useRef(false);
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setMax(Math.max(0, track.clientWidth - 56));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);
  const confirm = () => {
    if (done.current || disabled) return;
    done.current = true;
    animate(x, max, reduced ? { duration: 0 } : SPRING);
    onConfirm();
  };
  return <div ref={trackRef} className="slide-confirm" data-disabled={disabled}>
    <motion.span className="slide-confirm-fill" style={{ width: fill }} aria-hidden="true" />
    <span className="slide-confirm-label"><span>{label}</span>{sublabel}</span>
    <motion.button type="button" className="slide-confirm-knob" aria-label={`${label}. ${hint}`} disabled={disabled}
      style={{ x }} drag={disabled ? false : "x"} dragConstraints={{ left: 0, right: max }} dragElastic={0} dragMomentum={false}
      onDragEnd={() => { if (x.get() >= max * 0.85) confirm(); else animate(x, 0, reduced ? { duration: 0 } : SPRING); }}
      onClick={(event) => { if (event.detail === 0) confirm(); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); const next = Math.min(max, x.get() + max / 4); x.set(next); if (next >= max) confirm(); }
        if (event.key === "ArrowLeft") { event.preventDefault(); x.set(Math.max(0, x.get() - max / 4)); }
      }}>
      <ChevronRight size={22} strokeWidth={ICON_STROKE + 0.5} aria-hidden="true" />
    </motion.button>
  </div>;
}
