"use client";

import { useId, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { animate, motion, useDragControls, useMotionValue, useReducedMotion } from "motion/react";
import { ChevronUp, X } from "lucide-react";
import Image from "next/image";
import { assetPaths } from "@/config/assets";
import type { CrowdLevel } from "@/data/sample-congestion";

export const SPRING = { type: "spring", stiffness: 380, damping: 32, mass: 0.9 } as const;
export const ICON_STROKE = 1.5;
export const haptic = () => { try { navigator.vibrate?.(12); } catch { /* Unsupported. */ } };

export function Button({ children, className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return <button className={`ui-button ui-button--${variant} ${className}`} {...props}>{children}</button>;
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
/** Team-provided fox art per state, framed in a cream-and-gold ring. Falls back to a neutral ring without art. */
export function FoxAvatar({ state = "idle", size = 44 }: { state?: FoxState; size?: number }) {
  return <span className={`fox-avatar fox-avatar--${state}`} data-art={Boolean(assetPaths.mascot)} style={{ width: size, height: size }} aria-hidden="true">
    {assetPaths.mascot ? <Image src={assetPaths.mascot[state]} width={size * 2} height={size * 2} sizes={`${size}px`} alt="" /> :
      <svg viewBox="0 0 44 44" fill="none" strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="22" cy="22" r="20" className="fox-ring" />
        <circle cx="22" cy="22" r="14.5" className="fox-face" />
        {state === "warning" ? <path d="M16 22h12" className="fox-mark" /> :
          state === "reward" || state === "arrived" ? <path d="m16 22 4 4 8-8" className="fox-mark" /> :
            <circle cx="22" cy="22" r="5" className="fox-dot" />}
      </svg>}
  </span>;
}
