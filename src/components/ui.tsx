"use client";

import { useId, useLayoutEffect, useRef, type RefObject, type ButtonHTMLAttributes, type ReactNode } from "react";
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

export function BottomSheet({ open, onClose, title, closeLabel, children, fallbackFocusRef }: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
  fallbackFocusRef?: RefObject<HTMLElement | null>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const fallback = fallbackFocusRef?.current;
    dialog.showModal();
    return () => {
      dialog.close();
      // Search suggestions disappear when selected. Restore a stable control in that case.
      if (document.activeElement === document.body) fallback?.focus();
    };
  }, [open, fallbackFocusRef]);

  useLayoutEffect(() => {
    if (open) headingRef.current?.focus();
  }, [open, title]);

  return <dialog ref={dialogRef} className="sheet-panel" aria-labelledby={titleId}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <div className="sheet-handle" aria-hidden="true" />
    <div className="sheet-heading">
      <h2 ref={headingRef} tabIndex={-1} id={titleId}>{title}</h2>
      <button className="icon-button" aria-label={closeLabel} onClick={onClose}><X size={20} /></button>
    </div>
    <div className="sheet-body">{children}</div>
  </dialog>;
}

export function MarkerPlaceholder({ size = "normal" }: { size?: "normal" | "large" }) {
  return <div className={`marker-placeholder marker-placeholder--${size}`} aria-hidden="true">{assetPaths.mascot ? <Image src={assetPaths.mascot} width={90} height={90} alt="" className="marker-asset" /> : <span className="marker-inner">🦊</span>}<span className="marker-dot" /></div>;
}
