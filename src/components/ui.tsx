"use client";

import { useEffect, type ButtonHTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { assetPaths } from "@/config/assets";

export function Button({ children, className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" }) {
  return <button className={`ui-button ui-button--${variant} ${className}`} {...props}>{children}</button>;
}

export function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`ui-pill ${className}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`ui-card ${className}`}>{children}</div>;
}

export function BottomSheet({ open, onClose, title, closeLabel, children }: { open: boolean; onClose: () => void; title: string; closeLabel: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return <div className="sheet-root">
    <button className="sheet-scrim" aria-label={closeLabel} onClick={onClose} />
    <section className="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div className="sheet-handle" aria-hidden="true" />
      <div className="sheet-heading"><h2 id="sheet-title">{title}</h2><button className="icon-button" aria-label={closeLabel} onClick={onClose}><X size={20} /></button></div>
      <div className="sheet-body">{children}</div>
    </section>
  </div>;
}

export function MarkerPlaceholder({ size = "normal" }: { size?: "normal" | "large" }) {
  return <div className={`marker-placeholder marker-placeholder--${size}`} aria-hidden="true">{assetPaths.mascot ? <Image src={assetPaths.mascot} width={90} height={90} alt="" className="marker-asset" /> : <span className="marker-inner">京</span>}<span className="marker-dot" /></div>;
}
